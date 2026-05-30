const express = require('express');
const { getStudents, createStudent, updateStudent, verifyStudent, deleteStudent } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getStudents);
router.post('/', protect, createStudent);
router.put('/:id', protect, updateStudent);
router.patch('/:id/verify', protect, verifyStudent);
router.delete('/:id', protect, deleteStudent);

module.exports = router;
