const { Worker } = require('bullmq');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const redis = require('../config/redis');
const Session = require('../models/Session');
const Clip = require('../models/Clip');
const ingestService = require('../services/ingestService');
const asrService = require('../services/asrService');
const llmService = require('../services/llmService');
const renderService = require('../services/renderService');
const ENV = require('../config/env');

const updateStage = async (sessionId, stage, status, progress) => {
  const update = {
    [`stagesDetail.${stage}`]: status,
    currentStage: stage,
  };
  if (progress !== undefined) update.overallProgress = progress;
  if (status === 'processing') update.status = 'processing';
  await Session.findOneAndUpdate({ sessionId }, update);
};

const pipelineWorker = new Worker(
  'cuplik-pipeline',
  async (job) => {
    const { sessionId } = job.data;
    const session = await Session.findOne({ sessionId });
    if (!session) throw new Error('Session not found');

    try {
      // Stage 1: Ingestion
      await updateStage(sessionId, 'ingestion', 'processing', 10);
      const { audioExtractedPath } = await ingestService.processUpload(
        { path: session.originalFilePath, originalname: session.originalFileName, size: 0 },
        session.layoutTemplate,
        session.customVocabulary,
        session.userId
      );
      await Session.findOneAndUpdate({ sessionId }, { audioExtractedPath });
      await updateStage(sessionId, 'ingestion', 'done', 25);

      // Stage 2: Transcription
      await updateStage(sessionId, 'transcription', 'processing', 30);
      const transcript = await asrService.transcribe(audioExtractedPath, session.customVocabulary);
      await Session.findOneAndUpdate({ sessionId }, { transcript });
      await updateStage(sessionId, 'transcription', 'done', 50);

      // Stage 3: LLM Curation
      await updateStage(sessionId, 'curation_llm', 'processing', 55);
      const concepts = await llmService.selectConcepts(transcript, session.customVocabulary);
      const clipDocs = await Promise.all(
        concepts.map(async (concept) => {
          const clip = await Clip.create({
            sessionId: session._id,
            clipId: uuidv4(),
            startTimeSeconds: concept.start_time_seconds,
            endTimeSeconds: concept.end_time_seconds,
            duration: concept.duration,
            conceptScore: concept.concept_score,
            suggestedTitle: concept.suggested_title,
            pedagogicalReason: concept.pedagogical_reason,
            subtitles: transcript.filter(
              (t) => t.start_time >= concept.start_time_seconds && t.end_time <= concept.end_time_seconds
            ),
            status: 'pending',
          });
          return clip;
        })
      );
      await updateStage(sessionId, 'curation_llm', 'done', 70);

      // Stage 4: Rendering
      await updateStage(sessionId, 'rendering', 'processing', 75);
      for (let i = 0; i < clipDocs.length; i++) {
        const clip = clipDocs[i];
        const progress = 75 + Math.round(((i + 1) / clipDocs.length) * 25);
        await Clip.findOneAndUpdate({ clipId: clip.clipId }, { status: 'rendering' });

        try {
          const outputPath = path.join(ENV.OUTPUT_DIR, `${clip.clipId}.mp4`);
          const result = await renderService.renderClip(
            session.originalFilePath,
            { start_time_seconds: clip.startTimeSeconds, duration: clip.duration },
            session.layoutTemplate,
            clip.subtitles,
            outputPath
          );
          await Clip.findOneAndUpdate(
            { clipId: clip.clipId },
            { videoPath: result.videoPath, srtContent: result.srtContent, status: 'done' }
          );
        } catch (err) {
          await Clip.findOneAndUpdate(
            { clipId: clip.clipId },
            { status: 'failed', lastRenderError: err.message }
          );
        }
        await updateStage(sessionId, 'rendering', 'processing', progress);
      }

      await Session.findOneAndUpdate({ sessionId }, { status: 'completed', overallProgress: 100 });
      await updateStage(sessionId, 'rendering', 'done', 100);
    } catch (error) {
      console.error('Pipeline error:', error);
      await Session.findOneAndUpdate(
        { sessionId },
        { status: 'failed', errorMessage: error.message }
      );
      throw error;
    }
  },
  { connection: redis, concurrency: 2 }
);

pipelineWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

module.exports = pipelineWorker;
