const mongoose = require("mongoose");

const timesheetEntrySchema = new mongoose.Schema({
  employee: { type: String, required: true },
  classification: { type: String, default: "None" },
  subJob: { type: String, default: "None" },
  costCode: { type: String, required: true },
  location: { type: String, default: "None" },
  startTime: { type: String, required: true },
  stopTime: { type: String, required: true },
  lunchTime: { type: String, default: "None" },
  totalHours: { type: Number, required: true },
  timeType: {
    type: String,
    enum: ["Regular Time", "Overtime", "Double Time", "Salary"],
    default: "Regular Time",
  },
  billable: { type: Boolean, default: true },
  signatureStatus: {
    type: String,
    enum: ["Awaiting", "Signed", "Rejected"],
    default: "Awaiting",
  },
  crewName: { type: String, default: "General" },
});

const timesheetSchema = new mongoose.Schema(
  {
    timesheetId: { type: String, required: true, unique: true },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Draft"],
      default: "Pending",
    },
    createdBy: { type: String, required: true },
    entries: [timesheetEntrySchema],
    totalHours: { type: Number, default: 0 },
    regularHours: { type: Number, default: 0 },
    salaryHours: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-calculate totals before save
timesheetSchema.pre("save", function (next) {
  this.totalHours = this.entries.reduce((sum, e) => sum + e.totalHours, 0);
  this.regularHours = this.entries
    .filter((e) => e.timeType === "Regular Time")
    .reduce((sum, e) => sum + e.totalHours, 0);
  this.salaryHours = this.entries
    .filter((e) => e.timeType === "Salary")
    .reduce((sum, e) => sum + e.totalHours, 0);
  this.overtimeHours = this.entries
    .filter((e) => e.timeType === "Overtime")
    .reduce((sum, e) => sum + e.totalHours, 0);
  next();
});

module.exports = mongoose.model("Timesheet", timesheetSchema);