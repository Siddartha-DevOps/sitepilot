const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  project:      { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  date:         { type: Date, required: true, default: Date.now },
  workDone:     { type: String, required: true },
  workersCount: { type: Number, required: true },
  materialsUsed:{ type: String, default: '' },
  notes:        { type: String, default: '' },
  weather:      { type: String, default: '' },
  photos:       [{ type: String }],
  submittedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

reportSchema.index({ project: 1, date: -1 });
reportSchema.index({ submittedBy: 1 });

module.exports = mongoose.model('Report', reportSchema);