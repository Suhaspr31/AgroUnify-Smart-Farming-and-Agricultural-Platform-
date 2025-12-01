import { api } from './apiClient';

const chatbotService = {
  // Initialize chat conversation
  initializeChat: async (userId) => {
    try {
      const response = await api.post('/chatbot/initialize', {
        userId,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to initialize chat',
      };
    }
  },

  // Send message to chatbot
  sendMessage: async (userId, message, language = 'hi') => {
    try {
      const response = await api.post('/chatbot/message', {
        userId,
        message,
        language,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send message',
      };
    }
  },

  // Get conversation history
  getConversationHistory: async (userId) => {
    try {
      const response = await api.get(`/chatbot/history/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch conversation history',
      };
    }
  },

  // Clear conversation
  clearConversation: async (userId) => {
    try {
      const response = await api.delete(`/chatbot/conversation/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear conversation',
      };
    }
  },
};

export default chatbotService;