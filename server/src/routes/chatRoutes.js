const express = require('express');
const router = express.Router();
const {
  askQuestion,
  submitFeedback,
  getHistory,
  renameConversation,
  deleteConversation,
  exportConversation,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/ask', askQuestion);
router.post('/feedback', submitFeedback);
router.get('/history', getHistory);
router.patch('/history/:id', renameConversation);
router.delete('/history/:id', deleteConversation);
router.get('/export/:id', exportConversation);

module.exports = router;
