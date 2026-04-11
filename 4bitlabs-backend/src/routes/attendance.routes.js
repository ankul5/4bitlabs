const express = require('express');
const { markAttendance, getMyAttendance, getCourseAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { markAttendanceValidation, validate } = require('../middleware/validators');

const router = express.Router();

// POST /api/v1/attendance            — Mark attendance when student opens a lecture
router.post('/', protect, markAttendanceValidation, validate, markAttendance);

// GET  /api/v1/attendance/my         — Student's own attendance records
router.get('/my', protect, getMyAttendance);

// GET  /api/v1/attendance/course/:courseId  — Teacher views all students' attendance
router.get('/course/:courseId', protect, authorize('teacher', 'school_admin', 'super_admin'), getCourseAttendance);

module.exports = router;
