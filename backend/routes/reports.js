const express = require('express');
const Report  = require('../models/Report');
const protect = require('../middleware/auth');
const router  = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { project, date, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (date) {
      const s = new Date(date); s.setHours(0,0,0,0);
      const e = new Date(date); e.setHours(23,59,59,999);
      filter.date = { $gte: s, $lte: e };
    }
    const reports = await Report.find(filter)
      .populate('project','name location').populate('submittedBy','name')
      .sort({ date: -1 }).skip((page-1)*limit).limit(+limit);
    res.json({ data: reports, total: await Report.countDocuments(filter) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { project, date, workDone, workersCount, materialsUsed, notes, weather, issues } = req.body;
    if (!project || !workDone || !workersCount)
      return res.status(400).json({ message: 'project, workDone, workersCount required' });
    const report = await Report.create({ project, date: date||new Date(), workDone, workersCount: +workersCount, materialsUsed, notes, weather, issues, photos: req.body.photos||[], submittedBy: req.user._id });
    res.status(201).json(report);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await Report.findById(req.params.id).populate('project','name').populate('submittedBy','name');
    if (!r) return res.status(404).json({ message: 'Not found' });
    res.json(r);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try { await Report.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;