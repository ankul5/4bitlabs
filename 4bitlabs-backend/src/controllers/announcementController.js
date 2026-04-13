const Announcement = require('../models/Announcement');
const notificationService = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── POST /api/v1/announcements ──────────────────────────────────────────────
const createAnnouncement = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const schoolId = req.body.schoolId || req.user.schoolId?._id || req.user.schoolId;
    const announcement = await Announcement.create({
      ...req.body, created_by: userId, school_id: schoolId,
    });
    if (schoolId) {
      notificationService.notifySchool(schoolId, announcement.title, announcement.body.substring(0, 100)).catch(() => {});
    }
    res.status(201).json(successResponse('Announcement created.', { announcement }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/announcements ───────────────────────────────────────────────
const getAnnouncements = async (req, res, next) => {
  try {
    const filter = { is_active: true };
    const schoolId = req.user.schoolId?._id || req.user.schoolId;
    if (req.user.role === 'student' && schoolId) {
      filter.school_id = schoolId;
    } else if (req.query.schoolId) {
      filter.school_id = req.query.schoolId;
    }
    if (req.query.limit) filter.limit = parseInt(req.query.limit);
    const announcements = await Announcement.find(filter);
    res.json(successResponse('Announcements fetched.', { announcements, total: announcements.length }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/announcements/:id ───────────────────────────────────────────
const getAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json(errorResponse('Announcement not found.'));
    res.json(successResponse('Announcement fetched.', { announcement }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/announcements/:id ───────────────────────────────────────────
const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body);
    if (!announcement) return res.status(404).json(errorResponse('Announcement not found.'));
    res.json(successResponse('Announcement updated.', { announcement }));
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/announcements/:id ────────────────────────────────────────
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json(errorResponse('Announcement not found.'));
    res.json(successResponse('Announcement deleted.'));
  } catch (error) {
    next(error);
  }
};

module.exports = { createAnnouncement, getAnnouncements, getAnnouncement, updateAnnouncement, deleteAnnouncement };
