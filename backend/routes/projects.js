const express  = require('express');
const Project  = require('../models/Project');
const Report   = require('../models/Report');
const Material = require('../models/Material');
const Photo    = require('../models/Photo');
const protect  = require('../middleware/auth');
const router   = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const projects = await Project.find(filter).populate('manager', 'name email')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(+limit);
    const total = await Project.countDocuments(filter);
    res.json({ data: projects, total });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(project);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const p = await Project.findById(req.params.id).populate('manager team', 'name email');
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const p = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id/reports',   async (req, res) => { try { res.json(await Report.find({ project: req.params.id }).populate('submittedBy','name').sort({ date: -1 })); } catch(e){ res.status(500).json({message:e.message}); }});
router.get('/:id/materials', async (req, res) => { try { res.json(await Material.find({ project: req.params.id }).sort({ createdAt: -1 })); } catch(e){ res.status(500).json({message:e.message}); }});
router.get('/:id/photos',    async (req, res) => { try { res.json(await Photo.find({ project: req.params.id }).populate('uploadedBy','name').sort({ createdAt: -1 })); } catch(e){ res.status(500).json({message:e.message}); }});

module.exports = router;