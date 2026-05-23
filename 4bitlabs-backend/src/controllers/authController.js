const admin = require('../config/firebase-admin');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const School = require('../models/School');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── Generate Backend JWT ─────────────────────────────────────────────────────
const signJWT = (user) =>
  jwt.sign(
    { uid: user.uid, role: user.role, _id: user._id || user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ─── POST /api/v1/auth/verify-token ──────────────────────────────────────────
const verifyToken = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json(errorResponse('idToken is required.'));

    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findByUid(decoded.uid);
    if (!user) return res.status(404).json(errorResponse('User not registered. Please register first.'));

    const token = signJWT(user);
    return res.json(successResponse('Login successful.', { token, user }));
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json(errorResponse('Firebase token expired. Please login again.'));
    }
    if (error.code && error.code.startsWith('auth/')) {
      return res.status(401).json(errorResponse('Invalid Firebase token.'));
    }
    next(error);
  }
};

// ─── POST /api/v1/auth/register ───────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errorResponse('Validation failed.', errors.array()));
    }

    const { idToken, name, email, phone, schoolId, customSchoolName, role } = req.body;
    const decoded = await admin.auth().verifyIdToken(idToken);

    const existing = await User.findByUid(decoded.uid);
    if (existing) {
      const token = signJWT(existing);
      return res.json(successResponse('User already registered.', { token, user: existing }));
    }

    let resolvedSchoolId = null;
    if (schoolId) {
      const school = await School.findById(schoolId);
      if (!school) return res.status(400).json(errorResponse('Invalid school ID.'));
      resolvedSchoolId = schoolId;
      await School.findByIdAndUpdate(schoolId, { student_count_inc: 1 });
    } else if (customSchoolName && customSchoolName.trim()) {
      const formattedName = customSchoolName.trim();
      const code = formattedName.toUpperCase().replace(/\s+/g, '').substring(0, 8) + Math.floor(100 + Math.random() * 900);
      const { rows: existingSchools } = await pool.query('SELECT * FROM schools WHERE LOWER(name) = LOWER($1) LIMIT 1', [formattedName]);
      let school;
      if (existingSchools[0]) {
        school = existingSchools[0];
      } else {
        school = await School.create({
          name: formattedName,
          code,
          is_active: true
        });
      }
      resolvedSchoolId = school.id || school._id;
      await School.findByIdAndUpdate(resolvedSchoolId, { student_count_inc: 1 });
    }

    const user = await User.create({
      uid: decoded.uid,
      name: name || decoded.name || 'Student',
      email: email || decoded.email,
      phone: phone || decoded.phone_number || '',
      avatar: decoded.picture || '',
      role: role || 'student',
      school_id: resolvedSchoolId,
      is_verified: decoded.email_verified || false,
    });

    const token = signJWT(user);

    // Real-time: notify admin dashboard of new student registration
    if (req.io) {
      req.io.to('admin').emit('student:registered', {
        student: { id: user._id || user.id, name: user.name, email: user.email, schoolId: resolvedSchoolId, createdAt: user.createdAt },
      });
      if (resolvedSchoolId) {
        req.io.to(`school_${resolvedSchoolId}`).emit('student:registered', {
          student: { id: user._id || user.id, name: user.name, email: user.email, schoolId: resolvedSchoolId },
        });
      }
    }

    return res.status(201).json(successResponse('Registration successful.', { token, user }));
  } catch (error) {
    if (error.code && error.code.startsWith('auth/')) {
      return res.status(401).json(errorResponse('Invalid Firebase token.'));
    }
    next(error);
  }
};

// ─── GET /api/v1/auth/me ─────────────────────────────────────────────────────
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id || req.user.id);
  res.json(successResponse('Profile fetched.', { user }));
};

// ─── PUT /api/v1/auth/me ──────────────────────────────────────────────────────
// ─── PUT /api/v1/auth/me ──────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, email } = req.body;
    const userId = req.user._id || req.user.id;
    const updates = { name, phone, avatar };

    if (email && email !== req.user.email) {
      // Update Firebase Auth bypassing recent-login requirements
      await admin.auth().updateUser(req.user.uid, { email });
      updates.email = email;
    }

    const ObjectClean = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
    const user = await User.findByIdAndUpdate(userId, ObjectClean);
    res.json(successResponse('Profile updated.', { user }));
  } catch (error) {
    if (error.code === 'auth/email-already-exists' || error.code === '23505') {
      return res.status(400).json(errorResponse('Email already used by another account.'));
    }
    next(error);
  }
};

// ─── PUT /api/v1/auth/fcm-token ───────────────────────────────────────────────
const updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json(errorResponse('fcmToken is required.'));
    await User.addFcmToken(req.user._id || req.user.id, fcmToken);
    res.json(successResponse('FCM token registered.'));
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyToken, register, getMe, updateProfile, updateFcmToken };
