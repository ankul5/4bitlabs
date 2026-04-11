const express = require('express');
const {
  createAnnouncement, getAnnouncements, getAnnouncement,
  updateAnnouncement, deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { createAnnouncementValidation, validate } = require('../middleware/validators');

const router = express.Router();

// GET  /api/v1/announcements             — List announcements (school-scoped)
router.get('/', protect, getAnnouncements);

// GET  /api/v1/announcements/:id         — Single announcement
router.get('/:id', protect, getAnnouncement);

// POST /api/v1/announcements             — Teacher/admin creates announcement
router.post(
  '/',
  protect,
  authorize('teacher', 'school_admin', 'super_admin'),
  createAnnouncementValidation,
  validate,
  createAnnouncement
);

// PUT  /api/v1/announcements/:id         — Teacher/admin updates announcement
router.put(
  '/:id',
  protect,
  authorize('teacher', 'school_admin', 'super_admin'),
  updateAnnouncement
);

// DELETE /api/v1/announcements/:id       — Admin deletes announcement
router.delete(
  '/:id',
  protect,
  authorize('school_admin', 'super_admin'),
  deleteAnnouncement
);

module.exports = router;
