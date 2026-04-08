const express = require('express');
const path    = require('path');
const Photo   = require('../models/Photo');
const protect = require('../middleware/auth');
const upload  = require('../middleware/upload');

const router = express.Router();
router.use(protect);

// POST /api/photos/upload  – upload one or many photos
router.post('/upload', upload.array('photos', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    if (!req.body.project) {
      return res.status(400).json({ message: 'project is required' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const docs    = req.files.map(file => ({
      project:    req.body.project,
      filename:   file.filename,
      url:        `${baseUrl}/uploads/${file.filename}`,
      note:       req.body.note || '',
      uploadedBy: req.user._id,
      size:       file.size,
      mimeType:   file.mimetype,
    }));

    const photos = await Photo.insertMany(docs);
    res.status(201).json(photos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/photos  – list all photos (optionally by project)
router.get('/', async (req, res) => {
  try {
    const { project, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (project) filter.project = project;

    const photos = await Photo.find(filter)
      .populate('project',    'name')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Photo.countDocuments(filter);
    res.json({ data: photos, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/photos/:id
router.delete('/:id', async (req, res) => {
  try {
    const fs    = require('fs');
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    // Remove file from disk
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await photo.deleteOne();
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;