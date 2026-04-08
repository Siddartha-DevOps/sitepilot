const express  = require('express');
const Material = require('../models/Material');
const protect  = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/materials  – optionally filter by project
router.get('/', async (req, res) => {
  try {
    const { project, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (project) filter.project = project;

    const materials = await Material.find(filter)
      .populate('project', 'name')
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Material.countDocuments(filter);
    res.json({ data: materials, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/materials/low-stock  – items below threshold
router.get('/low-stock', async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 0;
    const materials = await Material.find({
      $expr: { $lte: ['$quantity', '$minThreshold'] },
    }).populate('project', 'name location');
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/materials
router.post('/', async (req, res) => {
  try {
    const {
      project, name, quantity, unit, minThreshold,
      supplier, deliveryDate, invoiceNo, notes,
    } = req.body;

    if (!project || !name || !quantity || !unit) {
      return res.status(400).json({ message: 'project, name, quantity, and unit are required' });
    }

    const material = await Material.create({
      project,
      name,
      quantity: parseFloat(quantity),
      unit,
      minThreshold: minThreshold ? parseFloat(minThreshold) : 0,
      supplier,
      deliveryDate,
      invoiceNo,
      notes,
      addedBy: req.user._id,
    });

    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/materials/:id
router.get('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('project', 'name')
      .populate('addedBy', 'name');
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/materials/:id
router.put('/:id', async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json(material);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/materials/:id/consume  – deduct quantity used on site
router.patch('/:id/consume', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount required' });

    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    if (material.quantity < amount) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    material.quantity -= parseFloat(amount);
    await material.save();
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/materials/:id
router.delete('/:id', async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;