const express = require('express');
const { manuallyUpdatePoints, overrideAttendance, getSchoolStats, getDashboardStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/dashboard-stats', protect, authorize('mentor', 'super_admin', 'school_admin', 'teacher'), getDashboardStats);
router.get('/school-stats', protect, authorize('mentor', 'super_admin', 'school_admin', 'teacher'), getSchoolStats);
router.put('/users/:id/points', protect, authorize('mentor', 'super_admin', 'school_admin'), manuallyUpdatePoints);
router.put('/attendance/:id/override', protect, authorize('mentor', 'super_admin', 'school_admin'), overrideAttendance);

module.exports = router;
