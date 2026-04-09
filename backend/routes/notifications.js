const express  = require('express');
const Material = require('../models/Material');
const Report   = require('../models/Report');
const Project  = require('../models/Project');
const protect  = require('../middleware/auth');
const router   = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const notifications = [];
    const now = new Date();

    const lowMats = await Material.find({ $expr: { $lte: ['$quantity','$minThreshold'] } }).populate('project','name');
    lowMats.forEach(m => notifications.push({
      id: m._id+'-stock', type: m.quantity <= m.minThreshold*.5 ? 'danger' : 'warning',
      category: 'material', title: m.quantity <= m.minThreshold*.5 ? 'Critical Stock' : 'Low Stock',
      message: `${m.name} is low (${m.quantity} ${m.unit}) on ${m.project?.name}`,
      time: 'Just now', read: false,
    }));

    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd   = new Date(); todayEnd.setHours(23,59,59,999);
    const reports = await Report.find({ date: { $gte: todayStart, $lte: todayEnd } }).populate('project','name').populate('submittedBy','name');
    reports.forEach(r => notifications.push({
      id: r._id+'-report', type: 'success', category: 'report',
      title: 'Report Submitted', message: `Report for ${r.project?.name} by ${r.submittedBy?.name}`,
      time: new Date(r.createdAt).toLocaleTimeString(), read: true,
    }));

    const upcoming = await Project.find({ status: 'active', endDate: { $lte: new Date(now.getTime()+30*86400000), $gte: now } });
    upcoming.forEach(p => {
      const days = Math.ceil((new Date(p.endDate)-now)/86400000);
      notifications.push({
        id: p._id+'-deadline', type: days<=7?'danger':'warning', category: 'deadline',
        title: 'Deadline Approaching', message: `${p.name} due in ${days} day(s). Progress: ${p.progress}%`,
        time: `${days}d left`, read: false,
      });
    });

    res.json(notifications);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;