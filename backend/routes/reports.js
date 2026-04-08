const express = require('express');
const Report  = require('../models/Report');
const protect = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/reports
router.get('/', async (req, res) => {
  try {
    const { project, date, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const reports = await Report.find(filter)
      .populate('project',     'name location')
      .populate('submittedBy', 'name email')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);
    res.json({ data: reports, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reports
router.post('/', async (req, res) => {
  try {
    const { project, date, workDone, workersCount, materialsUsed, notes, weather, issues } = req.body;

    if (!project || !workDone || !workersCount) {
      return res.status(400).json({ message: 'project, workDone, and workersCount are required' });
    }

    const report = await Report.create({
      project,
      date:         date || new Date(),
      workDone,
      workersCount: parseInt(workersCount),
      materialsUsed,
      notes,
      weather,
      issues,
      photos:       req.body.photos || [],
      submittedBy:  req.user._id,
    });

    const populated = await Report.findById(report._id)
      .populate('project',     'name location')
      .populate('submittedBy', 'name email');

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/reports/:id
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('project',     'name location')
      .populate('submittedBy', 'name email');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/reports/:id
router.put('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('project',     'name location')
      .populate('submittedBy', 'name email');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/reports/:id
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;