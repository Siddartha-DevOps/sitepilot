const express  = require('express');
const Project  = require('../models/Project');
const Report   = require('../models/Report');
const Material = require('../models/Material');
const protect  = require('../middleware/auth');
const router   = express.Router();
router.use(protect);

router.get('/stats', async (req, res) => {
  try {
    const now   = new Date();
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);

    const [activeProjects, todayReports, lowStock, totalMaterials, recentProjects] = await Promise.all([
      Project.countDocuments({ status: 'active' }),
      Report.countDocuments({ date: { $gte: start, $lte: end } }),
      Material.countDocuments({ $expr: { $lte: ['$quantity', '$minThreshold'] } }),
      Material.countDocuments({}),
      Project.find({ status: 'active' }).sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({ activeProjects, todayReports, lowStock, totalMaterials, recentProjects });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;