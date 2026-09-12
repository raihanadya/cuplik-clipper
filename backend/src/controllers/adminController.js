const fs = require('fs');
const path = require('path');
const { Queue } = require('bullmq');
const redis = require('../config/redis');
const Session = require('../models/Session');
const ENV = require('../config/env');

const getTelemetry = async (req, res) => {
  try {
    const pipelineQueue = new Queue('cuplik-pipeline', { connection: redis });
    const rerenderQueue = new Queue('cuplik-rerender', { connection: redis });

    const [pipelineWaiting, pipelineActive, pipelineFailed] = await Promise.all([
      pipelineQueue.getWaitingCount(),
      pipelineQueue.getActiveCount(),
      pipelineQueue.getFailedCount(),
    ]);

    const [rerenderWaiting, rerenderActive, rerenderFailed] = await Promise.all([
      rerenderQueue.getWaitingCount(),
      rerenderQueue.getActiveCount(),
      rerenderQueue.getFailedCount(),
    ]);

    const activeJobs = pipelineActive + rerenderActive;
    const waitingJobs = pipelineWaiting + rerenderWaiting;
    const failedJobs = pipelineFailed + rerenderFailed;

    let usedGb = 0;
    let tempFilesCount = 0;
    const dirs = [ENV.UPLOAD_DIR, ENV.OUTPUT_DIR];
    for (const dir of dirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        tempFilesCount += files.length;
        for (const file of files) {
          const stats = fs.statSync(path.join(dir, file));
          usedGb += stats.size;
        }
      }
    }

    const sessions = await Session.find({});
    const totalTokens = sessions.length * 10000;
    const totalMinutes = sessions.length * 5;

    res.json({
      worker_status: {
        active_jobs: activeJobs,
        waiting_jobs: waitingJobs,
        failed_jobs: failedJobs,
        queue_latency_seconds: 0,
      },
      storage_retention: {
        used_gb: parseFloat((usedGb / (1024 * 1024 * 1024)).toFixed(2)),
        temp_files_count: tempFilesCount,
        last_cleanup: new Date().toISOString(),
      },
      api_cost_meter: {
        llm_tokens_used: totalTokens,
        asr_audio_minutes: totalMinutes,
        estimated_cost_usd: parseFloat((totalMinutes * 0.06 + totalTokens * 0.00001).toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getTelemetry };
