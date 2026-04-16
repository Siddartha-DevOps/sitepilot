const express   = require('express');
const RMCPour   = require('../models/RMCPour');
const SiteEvent = require('../models/SiteEvent');
const protect   = require('../middleware/auth');
const router    = express.Router();

router.use(protect);

// GET /api/rmc?projectId=
router.get('/', async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (status)    filter.status    = status;

    const pours = await RMCPour.find(filter)
      .populate('projectId', 'name location')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ data: pours, total: pours.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/rmc/stats/:projectId
router.get('/stats/:projectId', async (req, res) => {
  try {
    const pid = req.params.projectId;
    const pours = await RMCPour.find({ projectId: pid });

    const totalVolume   = pours.reduce((s, p) => s + (p.volume || 0), 0);
    const avgDelay      = pours.length ? pours.reduce((s, p) => s + (p.delayMinutes || 0), 0) / pours.length : 0;
    const byGrade       = {};
    const supplierMap   = {};

    pours.forEach(p => {
      byGrade[p.grade]       = (byGrade[p.grade] || 0) + p.volume;
      supplierMap[p.supplierName] = (supplierMap[p.supplierName] || 0) + 1;
    });

    const supplierRanking = Object.entries(supplierMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      totalPours: pours.length,
      totalVolume: +totalVolume.toFixed(2),
      avgDelayMinutes: +avgDelay.toFixed(1),
      byGrade,
      supplierRanking,
      completedPours: pours.filter(p => p.status === 'completed').length,
      delayedPours:   pours.filter(p => p.status === 'delayed').length,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/rmc
router.post('/', async (req, res) => {
  try {
    const { projectId, grade, volume, supplierName, truckNumber, pourLocation,
      arrivalTime, pourStartTime, notes, temperature, slumpValue } = req.body;

    if (!projectId || !grade || !volume || !supplierName)
      return res.status(400).json({ message: 'projectId, grade, volume, supplierName required' });

    // Create the RMC pour record
    const pour = await RMCPour.create({
      projectId, grade, volume: +volume, supplierName,
      truckNumber: truckNumber || '',
      pourLocation: pourLocation || '',
      arrivalTime: arrivalTime ? new Date(arrivalTime) : null,
      pourStartTime: pourStartTime ? new Date(pourStartTime) : null,
      temperature, slumpValue, notes,
      status: pourStartTime ? 'in-progress' : 'scheduled',
      createdBy: req.user._id,
    });

    // Auto-create a SiteEvent for the timeline
    const event = await SiteEvent.create({
      projectId,
      type: 'RMC_POUR',
      data: {
        grade, volume: +volume, supplierName,
        truckNumber, pourLocation,
        rmcPourId: pour._id,
      },
      notes: notes || `${grade} concrete - ${volume} m³ from ${supplierName}`,
      createdBy: req.user._id,
    });

    await RMCPour.findByIdAndUpdate(pour._id, { siteEventId: event._id });

    const populated = await RMCPour.findById(pour._id)
      .populate('projectId', 'name')
      .populate('createdBy', 'name');

    res.status(201).json(populated);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// GET /api/rmc/:id
router.get('/:id', async (req, res) => {
  try {
    const pour = await RMCPour.findById(req.params.id)
      .populate('projectId', 'name location')
      .populate('createdBy', 'name');
    if (!pour) return res.status(404).json({ message: 'Not found' });
    res.json(pour);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PATCH /api/rmc/:id/start
router.patch('/:id/start', async (req, res) => {
  try {
    const pour = await RMCPour.findByIdAndUpdate(
      req.params.id,
      { pourStartTime: new Date(), status: 'in-progress' },
      { new: true }
    );
    if (!pour) return res.status(404).json({ message: 'Not found' });
    res.json(pour);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PATCH /api/rmc/:id/complete
router.patch('/:id/complete', async (req, res) => {
  try {
    const { delayMinutes, delayReason, slumpValue } = req.body;
    const pour = await RMCPour.findByIdAndUpdate(
      req.params.id,
      {
        pourEndTime: new Date(),
        status: delayMinutes > 0 ? 'delayed' : 'completed',
        delayMinutes: delayMinutes || 0,
        delayReason: delayReason || '',
        slumpValue,
      },
      { new: true }
    );
    if (!pour) return res.status(404).json({ message: 'Not found' });
    res.json(pour);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/rmc/:id
router.put('/:id', async (req, res) => {
  try {
    const pour = await RMCPour.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pour) return res.status(404).json({ message: 'Not found' });
    res.json(pour);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// DELETE /api/rmc/:id
router.delete('/:id', async (req, res) => {
  try {
    await RMCPour.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;