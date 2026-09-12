require('dotenv').config();

const ENV = {
  PORT: parseInt(process.env.PORT, 10) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cuplik',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  MLAPI_KEY: process.env.MLAPI_KEY,
  ASR_API_URL: process.env.ASR_API_URL,
  LLM_API_URL: process.env.LLM_API_URL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  OUTPUT_DIR: process.env.OUTPUT_DIR || './output',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 1073741824,
  MAX_DURATION: parseInt(process.env.MAX_DURATION, 10) || 2700,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

module.exports = ENV;
