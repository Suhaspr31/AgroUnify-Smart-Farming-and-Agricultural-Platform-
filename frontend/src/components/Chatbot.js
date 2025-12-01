import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import chatbotService from '../services/chatbotService';
import './Chatbot.css';

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('hi');
  const messagesEndRef = useRef(null);

  const userId = user?.id || 'guest_' + Date.now();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const initializeChat = useCallback(async () => {
    setLoading(true);
    const result = await chatbotService.initializeChat(userId);
    if (result.success) {
      setMessages([result.data.message]);
    } else {
      setMessages([{
        id: Date.now(),
        type: 'bot',
        message: 'Hello! I am your agriculture assistant. How can I help you today?',
        timestamp: new Date(),
      }]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen, initializeChat, messages.length]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    const result = await chatbotService.sendMessage(userId, inputMessage, language);

    if (result.success) {
      setMessages(prev => [...prev, result.data.message]);
    } else {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        message: 'Sorry, I am unable to respond right now. Please try again later.',
        timestamp: new Date(),
      }]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    const result = await chatbotService.clearConversation(userId);
    if (result.success) {
      setMessages([]);
      initializeChat();
    }
  };

  const quickReplies = [
    'What is the weather today?',
    'Rice price today?',
    'How to control pests?',
    'Best time to sow wheat?',
  ];

  return (
    <>
      {/* Chatbot Toggle Button */}
      <div className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '❌' : '🤖'}
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="header-info">
              <h3>🌾 Agri Assistant</h3>
              <span className="status">Online</span>
            </div>
            <div className="header-controls">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="language-select"
              >
                <option value="hi">हिंदी</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="en">English</option>
              </select>
              <button onClick={clearChat} className="clear-btn" title="Clear Chat">
                🗑️
              </button>
              <button onClick={() => setIsOpen(false)} className="close-btn">
                ✕
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.type}`}>
                <div className="message-content">
                  <p>{msg.message}</p>
                  <span className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {msg.suggestions && (
                  <div className="suggestions">
                    {msg.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(suggestion)}
                        className="suggestion-btn"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <div className="input-container">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  language === 'hi' ? 'अपना प्रश्न यहाँ लिखें...' :
                  language === 'kn' ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ...' :
                  'Type your message here...'
                }
                rows="1"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                className="send-btn"
              >
                📤
              </button>
            </div>

            <div className="quick-replies">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(reply)}
                  className="quick-reply-btn"
                  disabled={loading}
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;