const express = require('express');
const { body } = require('express-validator');
const { verifyToken, register, getMe, updateProfile, updateFcmToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Validation Rules ─────────────────────────────────────────────────────────
const registerValidation = [
  body('idToken').notEmpty().withMessage('idToken is required.'),
  body('name').notEmpty().trim().withMessage('Name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
];

// ─── Routes ───────────────────────────────────────────────────────────────────
// POST /api/v1/auth/verify-token   — Firebase token → backend JWT
router.post('/verify-token', verifyToken);

// POST /api/v1/auth/register       — Create user in MongoDB
router.post('/register', registerValidation, register);

// GET  /api/v1/auth/me             — Get current user profile
router.get('/me', protect, getMe);

// PUT  /api/v1/auth/me             — Update profile
router.put('/me', protect, updateProfile);

// PUT  /api/v1/auth/fcm-token      — Register FCM push token
router.put('/fcm-token', protect, updateFcmToken);

module.exports = router;
