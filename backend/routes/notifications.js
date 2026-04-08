const express  = require('express');
const Material = require('../models/Material');
const Report   = require('../models/Report');
const Project  = require('../models/Project');
const protect  = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/notifications  – build dynamic notifications from DB state
router.get('/', async (req, res) => {
  try {
    const notifications = [];
    const now           = new Date();

    // ── 1. Low / critical stock alerts ────────────────────────────────────────
    const lowMaterials = await Material.find({
      $expr: { $lte: ['$quantity', '$minThreshold'] },
    }).populate('project', 'name');

    lowMaterials.forEach(m => {
      const isCritical = m.quantity <= m.minThreshold * 0.5;
      notifications.push({
        id:       m._id.toString() + '-stock',
        type:     isCritical ? 'danger' : 'warning',
        category: 'material',
        title:    isCritical ? 'Critical Stock Alert' : 'Low Stock Warning',
        message:  `${m.name} is ${isCritical ? 'critically low' : 'running low'} (${m.quantity} ${m.unit}) on ${m.project?.name}.`,
        time:     'Just now',
        read:     false,
      });
    });

    // ── 2. Today's submitted reports ──────────────────────────────────────────
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const todayReports = await Report.find({ date: { $gte: todayStart, $lte: todayEnd } })
      .populate('project',     'name')
      .populate('submittedBy', 'name');

    todayReports.forEach(r => {
      notifications.push({
        id:       r._id.toString() + '-report',
        type:     'success',
        category: 'report',
        title:    'Daily Report Submitted',
        message:  `Report for ${r.project?.name} submitted by ${r.submittedBy?.name}.`,
        time:     new Date(r.createdAt).toLocaleTimeString(),
        read:     true,
      });
    });

    // ── 3. Project deadline alerts (within 30 days) ───────────────────────────
    const upcoming = await Project.find({
      status:  'active',
      endDate: { $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), $gte: now },
    });

    upcoming.forEach(p => {
      const daysLeft = Math.ceil((new Date(p.endDate) - now) / (1000 * 60 * 60 * 24));
      notifications.push({
        id:       p._id.toString() + '-deadline',
        type:     daysLeft <= 7 ? 'danger' : 'warning',
        category: 'deadline',
        title:    'Project Deadline Approaching',
        message:  `${p.name} is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Current progress: ${p.progress}%.`,
        time:     `${daysLeft}d left`,
        read:     false,
      });
    });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;