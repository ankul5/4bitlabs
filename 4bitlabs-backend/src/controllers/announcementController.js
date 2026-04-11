const Announcement = require('../models/Announcement');
const notificationService = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── POST /api/v1/announcements — Teacher/admin creates announcement ────────
const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      createdBy: req.user._id,
      schoolId: req.body.schoolId || req.user.schoolId,
    });

    // Send FCM push notification to school students
    const schoolId = announcement.schoolId;
    if (schoolId) {
      notificationService.notifySchool(
        schoolId,
        `📢 ${announcement.title}`,
        announcement.body.substring(0, 100) + (announcement.body.length > 100 ? '...' : '')
      ).catch(() => {}); // Don't fail if FCM fails
    }

    res.status(201).json(successResponse('Announcement created.', { announcement }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/announcements — List announcements ─────────────────────────
const getAnnouncements = async (req, res, next) => {
  try {
    const { schoolId, courseId, type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    // School-scoped: students see only their school announcements
    if (req.user.role === 'student') {
      filter.$or = [
        { schoolId: req.user.schoolId },
        { schoolId: { $exists: false } }, // Global announcements
      ];
    } else if (schoolId) {
      filter.schoolId = schoolId;
    }

    if (courseId) filter.courseId = courseId;
    if (type) filter.type = type;

    // Filter out expired announcements
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });

    const total = await Announcement.countDocuments(filter);
    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'name avatar role')
      .populate('courseId', 'title')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(successResponse('Announcements fetched.', {
      announcements,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/announcements/:id ──────────────────────────────────────────
const getAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name avatar')
      .populate('courseId', 'title')
      .lean();
    if (!announcement) return res.status(404).json(errorResponse('Announcement not found.'));
    res.json(successResponse('Announcement fetched.', { announcement }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/announcements/:id ──────────────────────────────────────────
const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!announcement) return res.status(404).json(errorResponse('Announcement not found.'));
    res.json(successResponse('Announcement updated.', { announcement }));
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/announcements/:id ───────────────────────────────────────
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json(errorResponse('Announcement not found.'));
    res.json(successResponse('Announcement deleted.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
