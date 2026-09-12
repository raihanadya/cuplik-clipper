const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const ENV = require('../config/env');
const { ensureDir } = require('../utils/fileUtils');

const generateSRT = (subtitles, outputPath) => {
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  };

  const srt = subtitles
    .map((sub, i) => `${i + 1}\n${formatTime(sub.start_time)} --> ${formatTime(sub.end_time)}\n${sub.word}`)
    .join('\n\n');

  fs.writeFileSync(outputPath, srt, 'utf-8');
  return srt;
};

const buildFilterComplex = (template, width, height) => {
  switch (template) {
    case 'talking_head':
      return `[0:v]crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2`;
    case 'slide_saja':
      return `[0:v]scale=1080:-2:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black`;
    case 'slide_pembicara':
    default:
      return `[0:v]split[slide][cam];[slide]crop=1080:ih*0.6:0:0,scale=1080:1152:force_original_aspect_ratio=decrease,pad=1080:1152:(ow-iw)/2:(oh-ih)/2[top];[cam]crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=400:300:force_original_aspect_ratio=decrease,pad=400:300:(ow-iw)/2:(oh-ih)/2[bot];[top][bot]overlay=0:H*0.6`;
  }
};

const renderClip = (sourceVideo, segment, template, subtitles, outputPath) =>
  new Promise((resolve, reject) => {
    ensureDir(path.dirname(outputPath));

    const srtPath = outputPath.replace('.mp4', '.srt');
    const srtContent = generateSRT(subtitles, srtPath);

    const filterComplex = buildFilterComplex(template, 1080, 1920);

    ffmpeg(sourceVideo)
      .setStartTime(segment.start_time_seconds)
      .setDuration(segment.duration)
      .videoFilters(filterComplex)
      .outputOptions(['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p'])
      .noAudio()
      .on('end', () => resolve({ videoPath: outputPath, srtPath, srtContent }))
      .on('error', (err) => reject(err))
      .save(outputPath);
  });

module.exports = { renderClip, generateSRT };
