const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  project:      { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  date:         { type: Date, required: true, default: Date.now },
  workDone:     { type: String, required: true },
  workersCount: { type: Number, required: true },
  materialsUsed:{ type: String },
  notes:        { type: String },
  photos:       [{ type: String }],  // File paths / URLs
  submittedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weather:      { type: String },
  issues:       { type: String },
}, { timestamps: true });

reportSchema.index({ project: 1, date: -1 });
reportSchema.index({ submittedBy: 1 });

module.exports = mongoose.model('Report', reportSchema);