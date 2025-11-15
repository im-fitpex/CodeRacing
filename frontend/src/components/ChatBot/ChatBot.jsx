import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiMinimize2 } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg = isAuthenticated
        ? `Привет! Я Максим Ферштапенович 👋 Готов помочь тебе с выбором приложений!`
        : `Привет! Я Максим Ферштапенович 👋 Я помогу тебе найти нужные приложения. Авторизуйся, чтобы получить персональные рекомендации! 🎯`;
      
      setMessages([{
        role: 'assistant',
        content: welcomeMsg,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const installedApps = isAuthenticated 
        ? JSON.parse(localStorage.getItem('installedApps') || '[]')
        : [];

      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          userId: user?.id || null,
          installedApps: installedApps
        })
      });

      const data = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: data.message,
        suggestions: data.suggestions || [],
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Извини, произошла ошибка 😔 Попробуй еще раз.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAppClick = (appId) => {
    navigate(`/app/${appId}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="chat-fab"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiMessageCircle />
            <span className="chat-badge">AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`chat-window ${isMinimized ? 'minimized' : ''}`}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '600px'
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="chat-avatar">
                <div className="avatar-circle">МФ</div>
              </div>
              <div className="chat-title">
                <h3>Максим Ферштапенович</h3>
                <span className="chat-status">
                  <span className="status-dot"></span>
                  Онлайн
                </span>
              </div>
              <div className="chat-actions">
                <button 
                  className="chat-action-btn"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Развернуть" : "Свернуть"}
                >
                  <FiMinimize2 />
                </button>
                <button 
                  className="chat-action-btn"
                  onClick={() => setIsOpen(false)}
                  title="Закрыть"
                >
                  <FiX />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="chat-messages">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                      {msg.role === 'assistant' && (
                        <div className="message-avatar">МФ</div>
                      )}
                      <div className="message-content">
                        <div className="message-bubble">
                          <ReactMarkdown
                            components={{
                              a: ({node, ...props}) => (
                                <a 
                                  {...props} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="chat-link"
                                />
                              ),
                              code: ({node, inline, ...props}) => (
                                inline 
                                  ? <code className="inline-code" {...props} />
                                  : <code className="block-code" {...props} />
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                        
                        {/* App Suggestions */}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="app-suggestions">
                            {msg.suggestions.map((app) => (
                              <div 
                                key={app.appId}
                                className="suggestion-card"
                                onClick={() => handleAppClick(app.appId)}
                              >
                                <img src={app.iconUrl} alt={app.name} />
                                <div className="suggestion-info">
                                  <strong>{app.name}</strong>
                                  <span>{app.reason}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="message-avatar user">👤</div>
                      )}
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="message assistant">
                      <div className="message-avatar">МФ</div>
                      <div className="message-content">
                        <div className="message-bubble typing">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chat-input-container">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Спроси Максима..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                  <button 
                    className="chat-send-btn"
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                  >
                    <FiSend />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
