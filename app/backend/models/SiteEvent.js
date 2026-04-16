const mongoose = require('mongoose');

const siteEventSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  type: {
    type: String,
    enum: ['RMC_POUR', 'LABOUR_UPDATE', 'MATERIAL_DELIVERY', 'WORK_DONE', 'ISSUE_DELAY', 'PHOTO_UPDATE'],
    required: true,
  },
  timestamp:  { type: Date, default: Date.now },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data:       { type: mongoose.Schema.Types.Mixed, default: {} },
  photos:     [{ type: String }],
  notes:      { type: String, default: '' },
  resolved:   { type: Boolean, default: false },
  priority:   { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
}, { timestamps: true });

siteEventSchema.index({ projectId: 1, timestamp: -1 });
siteEventSchema.index({ type: 1 });
siteEventSchema.index({ createdBy: 1 });

module.exports = mongoose.model('SiteEvent', siteEventSchema);