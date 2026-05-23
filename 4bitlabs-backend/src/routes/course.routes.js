const express = require('express');
const {
  getPublicCourses, getCourses, getCourse, createCourse, updateCourse,
  addLecture, updateLecture, getHomeSummary, deleteCourse, deleteLecture,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createCourseValidation, updateCourseValidation, addLectureValidation, validate,
} = require('../middleware/validators');

const router = express.Router();

// GET  /api/v1/courses/public         — List all global courses (unprotected for registration dropdown)
router.get('/public', getPublicCourses);

// GET  /api/v1/courses/home-summary  — Dashboard data for student
router.get('/home-summary', protect, getHomeSummary);

// GET  /api/v1/courses               — List courses (school-scoped)
router.get('/', protect, getCourses);

// GET  /api/v1/courses/:id           — Single course with lectures + user progress
router.get('/:id', protect, getCourse);

// POST /api/v1/courses               — Teacher/Admin create course
router.post('/', protect, authorize('mentor', 'teacher', 'school_admin', 'super_admin'), createCourseValidation, validate, createCourse);

// PUT  /api/v1/courses/:id           — Teacher/Admin update course
router.put('/:id', protect, authorize('mentor', 'teacher', 'school_admin', 'super_admin'), updateCourseValidation, validate, updateCourse);

// DELETE /api/v1/courses/:id         — Teacher/Admin delete course
router.delete('/:id', protect, authorize('mentor', 'teacher', 'school_admin', 'super_admin'), deleteCourse);

// POST /api/v1/courses/:id/lectures  — Add lecture to course
router.post('/:id/lectures', protect, authorize('mentor', 'teacher', 'school_admin', 'super_admin'), addLectureValidation, validate, addLecture);

// PUT  /api/v1/courses/:id/lectures/:lectureId  — Update lecture
router.put('/:id/lectures/:lectureId', protect, authorize('mentor', 'teacher', 'school_admin', 'super_admin'), updateLecture);

// DELETE /api/v1/courses/:id/lectures/:lectureId — Delete lecture
router.delete('/:id/lectures/:lectureId', protect, authorize('mentor', 'teacher', 'school_admin', 'super_admin'), deleteLecture);

module.exports = router;
