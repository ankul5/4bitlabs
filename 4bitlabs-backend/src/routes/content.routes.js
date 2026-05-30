const express = require('express');
const { getContent, createContent, updateContent, deleteContent } = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getContent);
router.post('/', protect, createContent);
router.put('/:id', protect, updateContent);
router.delete('/:id', protect, deleteContent);

module.exports = router;
