const path = require('path');
const ENV = require('../config/env');
const { getVideoMetadata, extractAudio } = require('../utils/ffmpeg');
const { ensureDir } = require('../utils/fileUtils');

const ALLOWED_FORMATS = ['.mp4', '.mov'];

const validateFile = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_FORMATS.includes(ext)) {
    throw new Error('Format tidak didukung. Gunakan MP4/MOV.');
  }

  if (file.size > ENV.MAX_FILE_SIZE) {
    throw new Error('Ukuran file melebihi 1GB.');
  }

  const metadata = await getVideoMetadata(file.path);
  const duration = metadata.format.duration;
  if (duration > ENV.MAX_DURATION) {
    throw new Error('Durasi video maksimal 45 menit.');
  }

  const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
  if (videoStream && videoStream.height < 720) {
    throw new Error('Resolusi minimal 720p.');
  }

  return { duration, metadata };
};

const processUpload = async (file, layoutTemplate, customVocabulary, userId) => {
  ensureDir(ENV.UPLOAD_DIR);
  ensureDir(ENV.OUTPUT_DIR);

  const { duration } = await validateFile(file);

  const audioPath = path.join(ENV.UPLOAD_DIR, `audio_${Date.now()}.wav`);
  await extractAudio(file.path, audioPath);

  return {
    originalFilePath: file.path,
    audioExtractedPath: audioPath,
    duration,
  };
};

module.exports = { validateFile, processUpload };
