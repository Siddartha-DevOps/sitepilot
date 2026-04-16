const express  = require('express');
const Project  = require('../models/Project');
const Report   = require('../models/Report');
const Material = require('../models/Material');
const Photo    = require('../models/Photo');
const protect  = require('../middleware/auth');
const router   = express.Router();

router.use(protect);

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
    const [projects, total] = await Promise.all([
      Project.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(+limit),
      Project.countDocuments(filter),
    ]);
    res.json({ data: projects, total, page: +page });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(project);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Project not found' });
    res.json(p);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  try {
    const p = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ message: 'Project not found' });
    res.json(p);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Sub-resources
router.get('/:id/reports', async (req, res) => {
  try {
    const reports = await Report.find({ project: req.params.id })
      .populate('submittedBy', 'name email').sort({ date: -1 });
    res.json(reports);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id/materials', async (req, res) => {
  try {
    const materials = await Material.find({ project: req.params.id }).sort({ createdAt: -1 });
    res.json(materials);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id/photos', async (req, res) => {
  try {
    const photos = await Photo.find({ project: req.params.id })
      .populate('uploadedBy', 'name').sort({ createdAt: -1 });
    res.json(photos);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;