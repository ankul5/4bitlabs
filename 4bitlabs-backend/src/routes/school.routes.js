const express = require('express');
const { getSchools, createSchool, deleteSchool } = require('../controllers/schoolController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getSchools);
router.post('/', protect, createSchool);
router.delete('/:id', protect, deleteSchool);

module.exports = router;
