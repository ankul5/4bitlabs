const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getChatHistory, sendMessage } = require('../controllers/chatController');

const router = express.Router();

// ─── Chat Routes ─────────────────────────────────────────────────────────────
router.get('/:roomId', protect, getChatHistory);
router.post('/:roomId', protect, sendMessage);

module.exports = router;
