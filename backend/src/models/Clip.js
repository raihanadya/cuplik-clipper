const mongoose = require('mongoose');

const subtitleWordSchema = new mongoose.Schema(
  {
    word: { type: String, required: true },
    start_time: { type: Number, required: true },
    end_time: { type: Number, required: true },
  },
  { _id: false }
);

const clipSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    clipId: { type: String, required: true, unique: true },
    startTimeSeconds: { type: Number, required: true },
    endTimeSeconds: { type: Number, required: true },
    duration: { type: Number, required: true },
    conceptScore: { type: Number, min: 0, max: 1 },
    suggestedTitle: { type: String },
    pedagogicalReason: { type: String },
    subtitles: [subtitleWordSchema],
    videoPath: { type: String },
    srtContent: { type: String },
    status: { type: String, enum: ['pending', 'rendering', 'done', 'failed'], default: 'pending' },
    renderAttempts: { type: Number, default: 0 },
    lastRenderError: { type: String },
  },
  { timestamps: true }
);

clipSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Clip', clipSchema);
