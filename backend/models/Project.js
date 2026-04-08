const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  location:    { type: String, required: true },
  description: { type: String },
  startDate:   { type: Date },
  endDate:     { type: Date },
  budget:      { type: String },
  progress:    { type: Number, default: 0, min: 0, max: 100 },
  status:      { type: String, enum: ['active', 'completed', 'paused', 'cancelled'], default: 'active' },
  manager:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  team:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Indexes
projectSchema.index({ status: 1 });
projectSchema.index({ manager: 1 });
projectSchema.index({ name: 'text', location: 'text' });

module.exports = mongoose.model('Project', projectSchema);