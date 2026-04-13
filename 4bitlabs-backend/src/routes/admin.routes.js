const express = require('express');
const { manuallyUpdatePoints, overrideAttendance } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.put('/users/:id/points', protect, authorize('mentor', 'super_admin', 'school_admin'), manuallyUpdatePoints);
router.put('/attendance/:id/override', protect, authorize('mentor', 'super_admin', 'school_admin'), overrideAttendance);

module.exports = router;
