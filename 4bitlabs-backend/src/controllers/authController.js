const admin = require('../config/firebase-admin');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const School = require('../models/School');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── Generate Backend JWT ─────────────────────────────────────────────────────
const signJWT = (user) =>
  jwt.sign(
    { uid: user.uid, role: user.role, _id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ─── POST /api/v1/auth/verify-token ──────────────────────────────────────────
// Firebase client sends idToken → backend verifies → returns JWT + user
const verifyToken = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json(errorResponse('idToken is required.'));

    // 1. Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken);

    // 2. Find user in MongoDB
    const user = await User.findOne({ uid: decoded.uid }).populate('schoolId', 'name code');
    if (!user) {
      return res.status(404).json(errorResponse('User not registered. Please register first.'));
    }

    // 3. Issue backend JWT
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
// Register a new user after Firebase account creation
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errorResponse('Validation failed.', errors.array()));
    }

    const { idToken, name, email, phone, schoolId, courseIds, role } = req.body;

    // 1. Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(idToken);

    // 2. Check if user already exists
    const existing = await User.findOne({ uid: decoded.uid });
    if (existing) {
      const token = signJWT(existing);
      return res.json(successResponse('User already registered.', { token, user: existing }));
    }

    // 3. Validate school if provided
    let resolvedSchoolId = null;
    if (schoolId) {
      const school = await School.findById(schoolId);
      if (!school) return res.status(400).json(errorResponse('Invalid school ID.'));
      resolvedSchoolId = school._id;
      // Increment student count
      await School.findByIdAndUpdate(schoolId, { $inc: { studentCount: 1 } });
    }

    // 4. Create user in MongoDB
    const user = await User.create({
      uid: decoded.uid,
      name: name || decoded.name || 'Student',
      email: email || decoded.email,
      phone: phone || decoded.phone_number || '',
      avatar: decoded.picture || '',
      role: role || 'student',
      schoolId: resolvedSchoolId,
      courseIds: courseIds || [],
      isVerified: decoded.email_verified || false,
    });

    // 5. Issue JWT
    const token = signJWT(user);

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
  const user = await User.findById(req.user._id).populate('schoolId', 'name code logo');
  res.json(successResponse('Profile fetched.', { user }));
};

// ─── PUT /api/v1/auth/me ──────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    ).populate('schoolId', 'name code logo');
    res.json(successResponse('Profile updated.', { user }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/auth/fcm-token ───────────────────────────────────────────────
// Save/update FCM push token for this device
const updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json(errorResponse('fcmToken is required.'));
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { fcmTokens: fcmToken },
    });
    res.json(successResponse('FCM token registered.'));
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyToken, register, getMe, updateProfile, updateFcmToken };
