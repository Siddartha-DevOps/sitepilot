require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const path      = require('path');
const rateLimit = require('express-rate-limit');
const fs        = require('fs');

const app  = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads dir exists
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads', { recursive: true });

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// ── Core Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/projects',      require('./routes/projects'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/materials',     require('./routes/materials'));
app.use('/api/photos',        require('./routes/photos'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/dashboard',     require('./routes/dashboard'));

// ── New: Event-driven & RMC Routes ───────────────────────────────────────────
app.use('/api/events',        require('./routes/siteEvents'));
app.use('/api/rmc',           require('./routes/rmc'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', time: new Date().toISOString() }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Connect & Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => console.log(`🚀  API → http://localhost:${PORT}`));
  })
  .catch(err => { console.error('❌  DB Error:', err.message); process.exit(1); });