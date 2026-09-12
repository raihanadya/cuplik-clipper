const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const { Queue } = require('bullmq');
const ENV = require('../config/env');
const redis = require('../config/redis');
const Session = require('../models/Session');
const Clip = require('../models/Clip');

const upload = multer({
  dest: ENV.UPLOAD_DIR,
  limits: { fileSize: ENV.MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.mp4', '.mov'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format tidak didukung. Gunakan MP4/MOV.'));
    }
  },
});

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File video wajib diupload.' });
    }

    const { layout_template, custom_vocabulary } = req.body;
    if (!layout_template) {
      return res.status(400).json({ error: 'Layout template wajib dipilih.' });
    }

    const validLayouts = ['slide_pembicara', 'talking_head', 'slide_saja'];
    if (!validLayouts.includes(layout_template)) {
      return res.status(400).json({ error: 'Layout template tidak valid.' });
    }

    const sessionId = uuidv4();

    await Session.create({
      userId: req.user._id,
      sessionId,
      status: 'queued',
      layoutTemplate: layout_template,
      customVocabulary: custom_vocabulary || '',
      originalFileName: req.file.originalname,
      originalFilePath: req.file.path,
      stagesDetail: {
        ingestion: 'pending',
        transcription: 'pending',
        curation_llm: 'pending',
        rendering: 'pending',
      },
    });

    const queue = new Queue('cuplik-pipeline', { connection: redis });
    await queue.add('process', { sessionId }, { jobId: sessionId });

    res.status(201).json({
      session_id: sessionId,
      status: 'queued',
      message: 'Video berhasil diterima dan masuk antrean.',
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Terjadi kesalahan server.' });
  }
};

const getStatus = async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.session_id });
    if (!session) {
      return res.status(404).json({ error: 'Sesi pemrosesan tidak ditemukan.' });
    }

    res.json({
      session_id: session.sessionId,
      overall_progress_percentage: session.overallProgress,
      current_stage: session.currentStage,
      stages_detail: session.stagesDetail,
      error_message: session.errorMessage || null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

const getClips = async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.session_id });
    if (!session) {
      return res.status(404).json({ error: 'Sesi pemrosesan tidak ditemukan.' });
    }

    const clips = await Clip.find({ sessionId: session._id }).sort({ startTimeSeconds: 1 });

    res.json({
      clips: clips.map((c) => ({
        clip_id: c.clipId,
        start_time_seconds: c.startTimeSeconds,
        end_time_seconds: c.endTimeSeconds,
        duration: c.duration,
        concept_score: c.conceptScore,
        suggested_title: c.suggestedTitle,
        pedagogical_reason: c.pedagogicalReason,
        subtitles: c.subtitles,
        status: c.status,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

module.exports = { upload, uploadVideo, getStatus, getClips };
