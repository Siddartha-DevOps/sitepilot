const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  filename:    { type: String, required: true },
  url:         { type: String, required: true },
  note:        { type: String },
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  size:        { type: Number },
  mimeType:    { type: String },
}, { timestamps: true });

photoSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Photo', photoSchema);