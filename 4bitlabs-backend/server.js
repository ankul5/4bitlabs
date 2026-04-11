require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/config/database');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');
const { registerSocketHandlers } = require('./src/sockets');

// ─── Route Imports ─────────────────────────────────────────────────────────────
const authRoutes = require('./src/routes/auth.routes');
const schoolRoutes = require('./src/routes/school.routes');
const courseRoutes = require('./src/routes/course.routes');
const quizRoutes = require('./src/routes/quiz.routes');
const leaderboardRoutes = require('./src/routes/leaderboard.routes');
const mentorRoutes = require('./src/routes/mentor.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const attendanceRoutes = require('./src/routes/attendance.routes');
const uploadRoutes = require('./src/routes/upload.routes');
const enrollmentRoutes = require('./src/routes/enrollment.routes');
const announcementRoutes = require('./src/routes/announcement.routes');
const userRoutes = require('./src/routes/user.routes');
const aiRoutes = require('./src/routes/ai.routes');

// ─── App Setup ─────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Socket.IO Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});
// Attach io to each request so controllers can emit events
app.use((req, _res, next) => {
  req.io = io;
  next();
});
registerSocketHandlers(io);

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: { success: false, message: 'Too many auth requests, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);
app.use('/api/v1/auth', authLimiter);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/mentors', mentorRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/ai', aiRoutes);

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

module.exports = { app, server, io };
