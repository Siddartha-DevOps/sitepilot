const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  project:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  filename:   { type: String, required: true },
  url:        { type: String, required: true },
  note:       { type: String, default: '' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  size:       { type: Number, default: 0 },
  mimeType:   { type: String, default: '' },
}, { timestamps: true });

photoSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Photo', photoSchema);