const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  project:      { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name:         { type: String, required: true, trim: true },
  quantity:     { type: Number, required: true, min: 0 },
  unit:         { type: String, required: true },
  minThreshold: { type: Number, default: 0 },
  supplier:     { type: String, default: '' },
  deliveryDate: { type: Date },
  invoiceNo:    { type: String, default: '' },
  notes:        { type: String, default: '' },
  addedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

materialSchema.virtual('stockStatus').get(function () {
  if (this.quantity <= this.minThreshold * 0.5) return 'critical';
  if (this.quantity <= this.minThreshold)        return 'low';
  return 'ok';
});
materialSchema.set('toJSON', { virtuals: true });
materialSchema.index({ project: 1 });

module.exports = mongoose.model('Material', materialSchema);