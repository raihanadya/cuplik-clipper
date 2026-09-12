const path = require('path');
const fs = require('fs');
const { Queue } = require('bullmq');
const Clip = require('../models/Clip');
const redis = require('../config/redis');

const rerenderQueue = new Queue('cuplik-rerender', { connection: redis });

const rerender = async (req, res) => {
  try {
    const { start_time_seconds, end_time_seconds, modified_title, modified_subtitles } = req.body;
    if (!start_time_seconds || !end_time_seconds || !modified_subtitles) {
      return res.status(400).json({ error: 'Parameter tidak lengkap.' });
    }

    const clip = await Clip.findOne({ clipId: req.params.clip_id });
    if (!clip) {
      return res.status(404).json({ error: 'Klip tidak ditemukan.' });
    }

    await Clip.findOneAndUpdate(
      { clipId: req.params.clip_id },
      { status: 'rendering', suggestedTitle: modified_title || clip.suggestedTitle }
    );

    await rerenderQueue.add('rerender', {
      clipId: req.params.clip_id,
      start_time_seconds,
      end_time_seconds,
      modified_subtitles,
    });

    res.json({
      clip_id: req.params.clip_id,
      status: 'rendering',
      new_video_url: `/api/v1/clips/${req.params.clip_id}/download/mp4`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

const downloadMp4 = async (req, res) => {
  try {
    const clip = await Clip.findOne({ clipId: req.params.clip_id });
    if (!clip || !clip.videoPath) {
      return res.status(404).json({ error: 'File tidak ditemukan.' });
    }

    if (!fs.existsSync(clip.videoPath)) {
      return res.status(404).json({ error: 'File tidak ditemukan.' });
    }

    const filename = `cuplik_${clip.suggestedTitle || 'clip'}_${Date.now()}.mp4`;
    res.download(clip.videoPath, filename);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

const downloadSrt = async (req, res) => {
  try {
    const clip = await Clip.findOne({ clipId: req.params.clip_id });
    if (!clip || !clip.srtContent) {
      return res.status(404).json({ error: 'File tidak ditemukan.' });
    }

    const filename = `cuplik_${clip.suggestedTitle || 'clip'}_${Date.now()}.srt`;
    res.setHeader('Content-Type', 'text/srt');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(clip.srtContent);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

module.exports = { rerender, downloadMp4, downloadSrt };
