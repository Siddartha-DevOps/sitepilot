const mongoose = require('mongoose');

const rmcPourSchema = new mongoose.Schema({
  projectId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  grade:          { type: String, enum: ['M15','M20','M25','M30','M35','M40'], required: true },
  volume:         { type: Number, required: true },           // m³
  supplierName:   { type: String, required: true },
  truckNumber:    { type: String, default: '' },
  batchSlipPhoto: { type: String, default: '' },
  arrivalTime:    { type: Date },
  pourStartTime:  { type: Date },
  pourEndTime:    { type: Date },
  delayMinutes:   { type: Number, default: 0 },
  delayReason:    { type: String, default: '' },
  pourLocation:   { type: String, default: '' },              // e.g. "Column C3-D5, Level 2"
  status:         { type: String, enum: ['scheduled','in-progress','completed','delayed','cancelled'], default: 'scheduled' },
  slumpValue:     { type: Number },                           // mm
  temperature:    { type: Number },                           // °C
  notes:          { type: String, default: '' },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  siteEventId:    { type: mongoose.Schema.Types.ObjectId, ref: 'SiteEvent' },
}, { timestamps: true });

rmcPourSchema.virtual('pourDurationMinutes').get(function () {
  if (!this.pourStartTime || !this.pourEndTime) return null;
  return Math.round((this.pourEndTime - this.pourStartTime) / 60000);
});

rmcPourSchema.virtual('arrivalDelayMinutes').get(function () {
  if (!this.arrivalTime || !this.pourStartTime) return null;
  return Math.round((this.pourStartTime - this.arrivalTime) / 60000);
});

rmcPourSchema.set('toJSON', { virtuals: true });
rmcPourSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model('RMCPour', rmcPourSchema);