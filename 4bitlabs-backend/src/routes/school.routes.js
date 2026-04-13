const express = require('express');
const { getSchools, getSchool, createSchool, updateSchool, deleteSchool } = require('../controllers/schoolController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { createSchoolValidation, validate } = require('../middleware/validators');

const router = express.Router();

// GET  /api/v1/schools         — Public (for registration dropdown)
router.get('/', getSchools);

// GET  /api/v1/schools/:id     — Public
router.get('/:id', getSchool);

// POST /api/v1/schools         — Super admin/Mentor create school
router.post('/', protect, authorize('super_admin', 'mentor'), createSchoolValidation, validate, createSchool);

// PUT  /api/v1/schools/:id     — Super admin/Mentor update school
router.put('/:id', protect, authorize('super_admin', 'school_admin', 'mentor'), updateSchool);

// DELETE /api/v1/schools/:id   — Super admin/Mentor delete school
router.delete('/:id', protect, authorize('super_admin', 'mentor'), deleteSchool);

module.exports = router;
