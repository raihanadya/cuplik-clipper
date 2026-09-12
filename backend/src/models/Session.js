const mongoose = require('mongoose');

const stagesDetailSchema = new mongoose.Schema(
  {
    ingestion: { type: String, enum: ['pending', 'processing', 'done', 'failed'], default: 'pending' },
    transcription: { type: String, enum: ['pending', 'processing', 'done', 'failed'], default: 'pending' },
    curation_llm: { type: String, enum: ['pending', 'processing', 'done', 'failed'], default: 'pending' },
    rendering: { type: String, enum: ['pending', 'processing', 'done', 'failed'], default: 'pending' },
  },
  { _id: false }
);

const transcriptWordSchema = new mongoose.Schema(
  {
    word: { type: String, required: true },
    start_time: { type: Number, required: true },
    end_time: { type: Number, required: true },
    confidence: { type: Number },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['queued', 'processing', 'completed', 'failed'], default: 'queued' },
    layoutTemplate: {
      type: String,
      enum: ['slide_pembicara', 'talking_head', 'slide_saja'],
      required: true,
    },
    customVocabulary: { type: String, maxlength: 200 },
    originalFileName: { type: String },
    originalFilePath: { type: String },
    audioExtractedPath: { type: String },
    currentStage: {
      type: String,
      enum: ['ingestion', 'transcription', 'curation_llm', 'rendering'],
    },
    stagesDetail: { type: stagesDetailSchema, default: () => ({}) },
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },
    transcript: [transcriptWordSchema],
    errorMessage: { type: String },
  },
  { timestamps: true }
);

sessionSchema.index({ sessionId: 1 });
sessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Session', sessionSchema);
