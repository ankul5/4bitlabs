const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getLabItems, createLabItem, updateLabItem, deleteLabItem } = require('../controllers/labController');
const router = express.Router();

router.get('/', protect, getLabItems);
router.post('/', protect, authorize('mentor', 'teacher', 'school_admin', 'super_admin'), createLabItem);
router.put('/:id', protect, authorize('mentor', 'teacher', 'school_admin', 'super_admin'), updateLabItem);
router.delete('/:id', protect, authorize('mentor', 'teacher', 'school_admin', 'super_admin'), deleteLabItem);

module.exports = router;
