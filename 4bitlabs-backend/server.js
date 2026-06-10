require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./src/config/database');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');

// ─── Route Imports ─────────────────────────────────────────────────────────────
const authRoutes = require('./src/routes/auth.routes');
const schoolRoutes = require('./src/routes/school.routes');
const studentRoutes = require('./src/routes/student.routes');
const contentRoutes = require('./src/routes/content.routes');
const announcementRoutes = require('./src/routes/announcement.routes');

// ─── App Setup ─────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Smart key: use user ID from JWT when logged in, fall back to IP.
// This way each user gets their own bucket whether they share an IP or not.
const jwt = require('jsonwebtoken');
const getUserKey = (req) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return `user_${decoded.id || decoded.username}`;
    }
  } catch (_) { /* token invalid or missing — fall back to IP */ }
  return req.ip;
};

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 500,
  keyGenerator: getUserKey,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 200,
  message: { success: false, message: 'Too many auth requests, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);
app.use('/api/v1/auth', authLimiter);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/announcements', announcementRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ─── 404 & Error Handlers ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 4Bit Labs Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
});

module.exports = { app, server };


