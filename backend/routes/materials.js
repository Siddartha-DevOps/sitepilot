const express  = require('express');
const Material = require('../models/Material');
const protect  = require('../middleware/auth');
const router   = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { project } = req.query;
    const filter = project ? { project } : {};
    const mats = await Material.find(filter).populate('project','name').sort({ createdAt: -1 });
    res.json({ data: mats, total: mats.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/low-stock', async (req, res) => {
  try {
    const mats = await Material.find({ $expr: { $lte: ['$quantity','$minThreshold'] } }).populate('project','name location');
    res.json(mats);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { project, name, quantity, unit, minThreshold, supplier, deliveryDate, invoiceNo, notes } = req.body;
    if (!project || !name || !quantity || !unit)
      return res.status(400).json({ message: 'project, name, quantity, unit required' });
    const mat = await Material.create({ project, name, quantity: +quantity, unit, minThreshold: +(minThreshold||0), supplier, deliveryDate, invoiceNo, notes, addedBy: req.user._id });
    res.status(201).json(mat);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const mat = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mat) return res.status(404).json({ message: 'Not found' });
    res.json(mat);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.patch('/:id/consume', async (req, res) => {
  try {
    const { amount } = req.body;
    const mat = await Material.findById(req.params.id);
    if (!mat) return res.status(404).json({ message: 'Not found' });
    if (mat.quantity < amount) return res.status(400).json({ message: 'Insufficient stock' });
    mat.quantity -= +amount;
    await mat.save();
    res.json(mat);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try { await Material.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;