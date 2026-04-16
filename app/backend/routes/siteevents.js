const express   = require('express');
const SiteEvent = require('../models/SiteEvent');
const protect   = require('../middleware/auth');
const router    = express.Router();

router.use(protect);

// GET /api/events?projectId=&type=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { projectId, type, page = 1, limit = 50, startDate, endDate } = req.query;
    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (type)      filter.type      = type;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate)   filter.timestamp.$lte = new Date(endDate);
    }

    const [events, total] = await Promise.all([
      SiteEvent.find(filter)
        .populate('projectId', 'name location')
        .populate('createdBy', 'name role')
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(+limit),
      SiteEvent.countDocuments(filter),
    ]);

    res.json({ data: events, total, page: +page });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/events/timeline/:projectId  — grouped by date
router.get('/timeline/:projectId', async (req, res) => {
  try {
    const events = await SiteEvent.find({ projectId: req.params.projectId })
      .populate('createdBy', 'name role')
      .sort({ timestamp: -1 })
      .limit(200);

    // Group by date
    const grouped = {};
    events.forEach(ev => {
      const key = ev.timestamp.toISOString().split('T')[0];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(ev);
    });

    const timeline = Object.entries(grouped).map(([date, events]) => ({ date, events }));
    res.json(timeline);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/events
router.post('/', async (req, res) => {
  try {
    const { projectId, type, data, notes, photos, priority } = req.body;
    if (!projectId || !type) return res.status(400).json({ message: 'projectId and type required' });

    const event = await SiteEvent.create({
      projectId, type,
      data:      data     || {},
      notes:     notes    || '',
      photos:    photos   || [],
      priority:  priority || 'medium',
      timestamp: new Date(),
      createdBy: req.user._id,
    });

    const populated = await SiteEvent.findById(event._id)
      .populate('projectId', 'name location')
      .populate('createdBy', 'name role');

    res.status(201).json(populated);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const ev = await SiteEvent.findById(req.params.id)
      .populate('projectId', 'name location')
      .populate('createdBy', 'name role');
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    res.json(ev);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PATCH /api/events/:id/resolve
router.patch('/:id/resolve', async (req, res) => {
  try {
    const ev = await SiteEvent.findByIdAndUpdate(req.params.id, { resolved: true }, { new: true });
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    res.json(ev);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    await SiteEvent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/events/stats/:projectId
router.get('/stats/:projectId', async (req, res) => {
  try {
    const pid = req.params.projectId;
    const today = new Date(); today.setHours(0,0,0,0);

    const [total, todayCount, byType, issues] = await Promise.all([
      SiteEvent.countDocuments({ projectId: pid }),
      SiteEvent.countDocuments({ projectId: pid, timestamp: { $gte: today } }),
      SiteEvent.aggregate([
        { $match: { projectId: require('mongoose').Types.ObjectId.createFromHexString(pid) } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      SiteEvent.countDocuments({ projectId: pid, type: 'ISSUE_DELAY', resolved: false }),
    ]);

    res.json({ total, todayCount, byType, openIssues: issues });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;