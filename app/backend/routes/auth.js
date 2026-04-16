const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const protect = require('../middleware/auth');
const router  = express.Router();

const sign = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company, role, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'name, email and password are required' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: 'Email already registered' });
    const user  = await User.create({ name, email, password, company, role, phone });
    res.status(201).json({ token: sign(user._id), user });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: sign(user._id), user });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json(req.user));

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const fields = ['name', 'phone', 'company', 'location', 'avatar', 'role'];
    const update = {};
    fields.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
    res.json(user);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/auth/password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;