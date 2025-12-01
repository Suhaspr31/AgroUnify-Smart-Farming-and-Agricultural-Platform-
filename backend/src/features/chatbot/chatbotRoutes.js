const express = require('express');
const {
  initializeChat,
  sendMessage,
  getConversationHistory,
  clearConversation,
} = require('./chatbotController');

const router = express.Router();

// Initialize chat
router.post('/initialize', initializeChat);

// Send message
router.post('/message', sendMessage);

// Get conversation history
router.get('/history/:userId', getConversationHistory);

// Clear conversation
router.delete('/conversation/:userId', clearConversation);

module.exports = router;