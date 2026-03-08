const express = require('express');
const { askBot, getChatHistory } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/ask', authMiddleware, askBot);
router.get('/history', authMiddleware, getChatHistory);

module.exports = router;