const express = require('express');
const {
  getMentors, getMentor, getMyBookings, createMentor, updateMentor, addReview, deleteMentor,
} = require('../controllers/mentorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { createMentorValidation, addReviewValidation, validate } = require('../middleware/validators');

const router = express.Router();

// GET  /api/v1/mentors                — List available mentors
router.get('/', protect, getMentors);

// GET  /api/v1/mentors/bookings/my    — Student's booking history
router.get('/bookings/my', protect, getMyBookings);

// GET  /api/v1/mentors/:id            — Single mentor profile
router.get('/:id', protect, getMentor);

// POST /api/v1/mentors                — Admin creates mentor profile
router.post('/', protect, authorize('school_admin', 'super_admin'), createMentorValidation, validate, createMentor);

// PUT  /api/v1/mentors/:id            — Admin/mentor updates profile
router.put('/:id', protect, authorize('mentor', 'school_admin', 'super_admin'), updateMentor);

// DELETE /api/v1/mentors/:id          — Admin deletes mentor
router.delete('/:id', protect, authorize('school_admin', 'super_admin'), deleteMentor);

// POST /api/v1/mentors/:id/review     — Student reviews mentor after session
router.post('/:id/review', protect, addReviewValidation, validate, addReview);

module.exports = router;
