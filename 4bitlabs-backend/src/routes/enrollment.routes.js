const express = require('express');
const {
  enrollInCourse, unenrollFromCourse, getMyEnrollments,
  getCourseEnrollments, updateProgress,
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { enrollValidation, validate } = require('../middleware/validators');

const router = express.Router();

// POST /api/v1/enrollments               — Student enrolls in a course
router.post('/', protect, enrollValidation, validate, enrollInCourse);

// GET  /api/v1/enrollments/my            — Student's enrolled courses
router.get('/my', protect, getMyEnrollments);

// GET  /api/v1/enrollments/course/:courseId — Teacher views enrolled students
router.get(
  '/course/:courseId',
  protect,
  authorize('teacher', 'school_admin', 'super_admin'),
  getCourseEnrollments
);

// PUT  /api/v1/enrollments/:courseId/progress — Update progress (lecture completed)
router.put('/:courseId/progress', protect, updateProgress);

// DELETE /api/v1/enrollments/:courseId    — Student unenrolls
router.delete('/:courseId', protect, unenrollFromCourse);

module.exports = router;
