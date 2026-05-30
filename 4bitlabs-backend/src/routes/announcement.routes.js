const express = require('express');
const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getAnnouncements);
router.post('/', protect, createAnnouncement);
router.put('/:id', protect, updateAnnouncement);
router.delete('/:id', protect, deleteAnnouncement);

module.exports = router;
