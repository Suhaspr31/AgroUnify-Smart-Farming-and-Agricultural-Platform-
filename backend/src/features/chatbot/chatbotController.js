const axios = require('axios');
const logger = require('../../core/logger');

// Chatbot conversation history (in production, use database)
const conversationHistory = new Map();

// Initialize conversation
const initializeChat = async (req, res) => {
  try {
    const { userId } = req.body;

    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      message: 'नमस्ते! मैं आपका कृषि सहायक हूँ। मैं आपकी फसल, मौसम, बाजार भाव और कृषि संबंधित किसी भी सवाल का जवाब दे सकता हूँ।\n\nHello! I am your agriculture assistant. I can help you with crops, weather, market prices, and any farming-related questions.',
      timestamp: new Date(),
      suggestions: [
        'आज का मौसम कैसा है?',
        'गेहूं की कीमत क्या है?',
        'मेरी फसल में कीट का क्या इलाज?',
        'किस महीने में कौन सी फसल बोएं?'
      ]
    };

    conversationHistory.set(userId, [welcomeMessage]);

    res.status(200).json({
      success: true,
      message: welcomeMessage,
      conversationId: userId,
    });
  } catch (error) {
    logger.error('Error initializing chat:', error, { service: 'chatbot' });
    res.status(500).json({
      success: false,
      message: 'Failed to initialize chat',
      error: error.message,
    });
  }
};

// Send message to chatbot
const sendMessage = async (req, res) => {
  try {
    const { userId, message, language = 'hi' } = req.body;

    if (!message || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Message and userId are required',
      });
    }

    // Add user message to history
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message,
      timestamp: new Date(),
    };

    let history = conversationHistory.get(userId) || [];
    history.push(userMessage);

    // Prepare context for AI
    const context = history.slice(-10).map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.message,
    }));

    // Call Farmer.CHAT API or fallback to mock response
    // Call OpenAI API or fallback to local mock
    let botResponse;
    try {
      const response = await axios.post(
        process.env.OPENAI_API_URL,
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful agricultural assistant who answers in Hindi, Kannada, and English for farmers. Respond in the language that matches the user's query - if they ask in Hindi, respond in Hindi; if in Kannada, respond in Kannada; otherwise in English." },
            ...context,
            { role: "user", content: message }
          ],
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      botResponse = response.data.choices[0].message.content.trim();
    } catch (apiError) {
      logger.warn('OpenAI API error, using fallback:', apiError.message, { service: 'chatbot' });
      botResponse = generateFallbackResponse(message, language);
    }

    // Create bot message object
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      message: botResponse,
      timestamp: new Date(),
    };

    history.push(botMessage);
    conversationHistory.set(userId, history);

    logger.info(`Chatbot response sent to user: ${userId}`, { service: 'chatbot' });

    res.status(200).json({
      success: true,
      message: botMessage,
      conversationId: userId,
    });
  } catch (error) {
    logger.error('Error sending message to chatbot:', error, { service: 'chatbot' });
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

// Get conversation history
const getConversationHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = conversationHistory.get(userId) || [];

    res.status(200).json({
      success: true,
      history,
      conversationId: userId,
    });
  } catch (error) {
    logger.error('Error fetching conversation history:', error, { service: 'chatbot' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation history',
      error: error.message,
    });
  }
};

// Clear conversation
const clearConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    conversationHistory.delete(userId);

    res.status(200).json({
      success: true,
      message: 'Conversation cleared successfully',
    });
  } catch (error) {
    logger.error('Error clearing conversation:', error, { service: 'chatbot' });
    res.status(500).json({
      success: false,
      message: 'Failed to clear conversation',
      error: error.message,
    });
  }
};

// Fallback response generator
const generateFallbackResponse = (message, language) => {
  const lowerMessage = message.toLowerCase();

  if (language === 'hi') {
    if (lowerMessage.includes('मौसम') || lowerMessage.includes('weather')) {
      return 'मौसम की जानकारी के लिए आप हमारे मौसम अनुभाग में जा सकते हैं। आज का मौसम कैसा है, इस बारे में बताने के लिए कृपया अपना स्थान बताएं।';
    }
    if (lowerMessage.includes('कीमत') || lowerMessage.includes('price')) {
      return 'बाजार भाव की जानकारी के लिए आप हमारे मार्केट प्राइस अनुभाग में जा सकते हैं। वहां आप विभिन्न फसलों की real-time कीमतें देख सकते हैं।';
    }
    if (lowerMessage.includes('कीट') || lowerMessage.includes('pest')) {
      return 'फसल में कीट आने पर सबसे पहले कीट की पहचान करें। कीट नियंत्रण के लिए जैविक तरीकों का इस्तेमाल करें। अधिक जानकारी के लिए कृषि वैज्ञानिक से संपर्क करें।';
    }
    if (lowerMessage.includes('बीज') || lowerMessage.includes('seed')) {
      return 'अच्छी गुणवत्ता के बीज चुनें। प्रमाणित बीज ही इस्तेमाल करें। मौसम और मिट्टी के अनुसार बीज का चुनाव करें।';
    }
    return 'क्षमा करें, मैं आपकी इस पूछताछ का सही जवाब नहीं दे सकता। कृपया अधिक स्पष्ट जानकारी दें या हमारे अन्य अनुभागों का इस्तेमाल करें।';
  } else if (language === 'kn') {
    if (lowerMessage.includes('ಹವಾಮಾನ') || lowerMessage.includes('weather') || lowerMessage.includes('ಮೌಸಮ')) {
      return 'ಹವಾಮಾನ ಮಾಹಿತಿಗಾಗಿ ನೀವು ನಮ್ಮ ಹವಾಮಾನ ವಿಭಾಗಕ್ಕೆ ಹೋಗಬಹುದು. ಇಂದಿನ ಹವಾಮಾನ ಹೇಗಿದೆ ಎಂಬುದರ ಕುರಿತು ತಿಳಿಸಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ತಿಳಿಸಿ.';
    }
    if (lowerMessage.includes('ಬೆಲೆ') || lowerMessage.includes('price') || lowerMessage.includes('ದರ')) {
      return 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳ ಮಾಹಿತಿಗಾಗಿ ನೀವು ನಮ್ಮ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳ ವಿಭಾಗಕ್ಕೆ ಭೇಟಿ ನೀಡಿ. ಅಲ್ಲಿ ನೀವು ವಿವಿಧ ಬೆಳೆಗಳ real-time ಬೆಲೆಗಳನ್ನು ನೋಡಬಹುದು.';
    }
    if (lowerMessage.includes('ಕೀಟ') || lowerMessage.includes('pest') || lowerMessage.includes('ಹುಳು')) {
      return 'ಬೆಳೆಯಲ್ಲಿ ಕೀಟ ಬಂದಾಗ ಮೊದಲು ಕೀಟವನ್ನು ಗುರುತಿಸಿ. ಕೀಟ ನಿಯಂತ್ರಣಕ್ಕಾಗಿ ಸಾವಯವಿಕ ವಿಧಾನಗಳನ್ನು ಬಳಸಿ. ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ಕೃಷಿ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.';
    }
    if (lowerMessage.includes('ಬೀಜ') || lowerMessage.includes('seed') || lowerMessage.includes('ಬೀಜಗಳು')) {
      return 'ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಬೀಜಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ. ಪ್ರಮಾಣೀಕೃತ ಬೀಜಗಳನ್ನು ಮಾತ್ರ ಬಳಸಿ. ಹವಾಮಾನ ಮತ್ತು ಮಣ್ಣಿನ ಪ್ರಕಾರದ ಪ್ರಕಾರ ಬೀಜಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.';
    }
    return 'ಕ್ಷಮಿಸಿ, ನಾನು ನಿಮ್ಮ ಈ ಪ್ರಶ್ನೆಗೆ ಸರಿಯಾದ ಉತ್ತರವನ್ನು ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಹೆಚ್ಚಿನ ಸ್ಪಷ್ಟ ಮಾಹಿತಿಯನ್ನು ನೀಡಿ ಅಥವಾ ನಮ್ಮ ಇತರ ವಿಭಾಗಗಳನ್ನು ಬಳಸಿ.';
  } else {
    if (lowerMessage.includes('weather') || lowerMessage.includes('मौसम') || lowerMessage.includes('ಹವಾಮಾನ')) {
      return 'For weather information, please check our weather section. Let me know your location for current weather updates.';
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('कीमत') || lowerMessage.includes('ಬೆಲೆ')) {
      return 'For market prices, please visit our market prices section. You can see real-time prices for various crops there.';
    }
    if (lowerMessage.includes('pest') || lowerMessage.includes('कीट') || lowerMessage.includes('ಕೀಟ')) {
      return 'For pest control, first identify the pest. Use organic methods for pest control. Consult agricultural experts for more information.';
    }
    if (lowerMessage.includes('seed') || lowerMessage.includes('बीज') || lowerMessage.includes('ಬೀಜ')) {
      return 'Choose good quality seeds. Use certified seeds only. Select seeds according to weather and soil conditions.';
    }
    return 'Sorry, I cannot provide the correct answer to your query. Please provide more specific information or use our other sections.';
  }
};

module.exports = {
  initializeChat,
  sendMessage,
  getConversationHistory,
  clearConversation,
};