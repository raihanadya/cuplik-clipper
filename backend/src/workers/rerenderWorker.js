const { Worker } = require('bullmq');
const path = require('path');
const redis = require('../config/redis');
const Clip = require('../models/Clip');
const Session = require('../models/Session');
const renderService = require('../services/renderService');
const ENV = require('../config/env');

const rerenderWorker = new Worker(
  'cuplik-rerender',
  async (job) => {
    const { clipId, start_time_seconds, end_time_seconds, modified_subtitles } = job.data;
    const clip = await Clip.findOne({ clipId });
    if (!clip) throw new Error('Clip not found');

    const session = await Session.findById(clip.sessionId);
    if (!session) throw new Error('Session not found');

    const duration = end_time_seconds - start_time_seconds;
    const outputPath = path.join(ENV.OUTPUT_DIR, `${clip.clipId}.mp4`);

    const result = await renderService.renderClip(
      session.originalFilePath,
      { start_time_seconds, duration },
      session.layoutTemplate,
      modified_subtitles,
      outputPath
    );

    await Clip.findOneAndUpdate(
      { clipId },
      {
        startTimeSeconds: start_time_seconds,
        endTimeSeconds: end_time_seconds,
        duration,
        subtitles: modified_subtitles,
        videoPath: result.videoPath,
        srtContent: result.srtContent,
        status: 'done',
        renderAttempts: (clip.renderAttempts || 0) + 1,
      }
    );

    return { clipId, status: 'done' };
  },
  { connection: redis, concurrency: 1 }
);

module.exports = rerenderWorker;
