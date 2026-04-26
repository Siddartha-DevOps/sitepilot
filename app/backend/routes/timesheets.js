const express = require("express");
const router = express.Router();
const Timesheet = require("../models/Timesheet");
const { Parser } = require("json2csv");

// ─── GET /api/timesheets ────────────────────────────────────────────────────
// Query params: startDate, endDate, status, projectId, search, page, limit
router.get("/", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      status,
      projectId,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (projectId) filter.project = projectId;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { timesheetId: { $regex: search, $options: "i" } },
        { createdBy: { $regex: search, $options: "i" } },
        { "entries.employee": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Timesheet.countDocuments(filter);

    const timesheets = await Timesheet.find(filter)
      .sort({ date: -1, timesheetId: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("project", "name");

    res.json({
      success: true,
      data: timesheets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/timesheets/:id ────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id).populate(
      "project",
      "name"
    );
    if (!timesheet)
      return res
        .status(404)
        .json({ success: false, message: "Timesheet not found" });
    res.json({ success: true, data: timesheet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/timesheets ───────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { project, date, createdBy, entries, notes } = req.body;

    // Generate timesheetId: MM-DD-YYYY-XX format
    const d = new Date(date);
    const dateStr = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}-${d.getFullYear()}`;

    const existingCount = await Timesheet.countDocuments({
      date: {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999)),
      },
    });

    const timesheetId = `${dateStr}-${String(existingCount + 1).padStart(
      2,
      "0"
    )}`;

    const timesheet = new Timesheet({
      timesheetId,
      project,
      date,
      createdBy,
      entries: entries || [],
      notes,
    });

    await timesheet.save();
    res.status(201).json({ success: true, data: timesheet });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/timesheets/:id ────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);
    if (!timesheet)
      return res
        .status(404)
        .json({ success: false, message: "Timesheet not found" });

    const { entries, status, notes } = req.body;

    if (entries !== undefined) timesheet.entries = entries;
    if (status !== undefined) timesheet.status = status;
    if (notes !== undefined) timesheet.notes = notes;

    await timesheet.save(); // triggers pre-save hook for totals
    res.json({ success: true, data: timesheet });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/timesheets/:id/status ──────────────────────────────────────
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Approved", "Rejected", "Draft"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const timesheet = await Timesheet.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!timesheet)
      return res
        .status(404)
        .json({ success: false, message: "Timesheet not found" });

    res.json({ success: true, data: timesheet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/timesheets/:id ─────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const timesheet = await Timesheet.findByIdAndDelete(req.params.id);
    if (!timesheet)
      return res
        .status(404)
        .json({ success: false, message: "Timesheet not found" });
    res.json({ success: true, message: "Timesheet deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/timesheets/export/csv ────────────────────────────────────────
router.get("/export/csv", async (req, res) => {
  try {
    const { startDate, endDate, projectId } = req.query;
    const filter = {};
    if (projectId) filter.project = projectId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const timesheets = await Timesheet.find(filter).populate("project", "name");

    const rows = [];
    timesheets.forEach((ts) => {
      ts.entries.forEach((entry) => {
        rows.push({
          TimesheetID: ts.timesheetId,
          Date: ts.date.toISOString().split("T")[0],
          Status: ts.status,
          CreatedBy: ts.createdBy,
          Project: ts.project?.name || "",
          Employee: entry.employee,
          Classification: entry.classification,
          SubJob: entry.subJob,
          CostCode: entry.costCode,
          Location: entry.location,
          StartTime: entry.startTime,
          StopTime: entry.stopTime,
          LunchTime: entry.lunchTime,
          TotalHours: entry.totalHours,
          TimeType: entry.timeType,
          Billable: entry.billable ? "Yes" : "No",
          Signature: entry.signatureStatus,
        });
      });
    });

    const parser = new Parser();
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("timesheets.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;