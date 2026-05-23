const express = require('express');
const { markAttendance, getMyAttendance, getCourseAttendance, markStudentAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { markAttendanceValidation, validate } = require('../middleware/validators');

const router = express.Router();

// POST /api/v1/attendance            — Mark attendance when student opens a lecture
router.post('/', protect, markAttendanceValidation, validate, markAttendance);

// POST /api/v1/attendance/mark-student — Mentor marks attendance for a student
router.post('/mark-student', protect, authorize('teacher', 'school_admin', 'super_admin', 'mentor'), markStudentAttendance);

// GET  /api/v1/attendance/my         — Student's own attendance records
router.get('/my', protect, getMyAttendance);

// GET  /api/v1/attendance/course/:courseId  — Teacher/mentor views all students' attendance
router.get('/course/:courseId', protect, authorize('teacher', 'school_admin', 'super_admin', 'mentor'), getCourseAttendance);

module.exports = router;
