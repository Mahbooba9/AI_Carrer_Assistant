import React, { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when chat opens
  useEffect(() => {
    if (isOpen && !historyLoaded) {
      loadChatHistory();
    }
  }, [isOpen, historyLoaded]);

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getHistory();
      const historyMessages = response.data.messages.map((msg, index) => ({
        id: `history-${index}`,
        sender: 'user',
        text: msg.question,
        timestamp: new Date(msg.timestamp),
      })).concat(response.data.messages.map((msg, index) => ({
        id: `history-bot-${index}`,
        sender: 'bot',
        text: msg.answer,
        timestamp: new Date(msg.timestamp),
        isCareerRelated: msg.isCareerRelated,
      })));

      // Sort by timestamp and add welcome message if no history
      const sortedMessages = historyMessages.sort((a, b) => a.timestamp - b.timestamp);
      
      if (sortedMessages.length === 0) {
        sortedMessages.push({
          id: 1,
          sender: 'bot',
          text: 'Hi! 👋 I\'m your AI Career Assistant. Ask me anything about resumes, jobs, interviews, or career development!',
          timestamp: new Date(),
        });
      }

      setMessages(sortedMessages);
      setHistoryLoaded(true);
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Fallback to default message
      setMessages([{
        id: 1,
        sender: 'bot',
        text: 'Hi! 👋 I\'m your AI Career Assistant. Ask me anything about resumes, jobs, interviews, or career development!',
        timestamp: new Date(),
      }]);
      setHistoryLoaded(true);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await chatAPI.ask(inputValue);

      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.data.answer,
        timestamp: new Date(),
        isCareerRelated: response.data.isCareerRelated,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: `error-${Date.now()}`,
        sender: 'bot',
        text: `Sorry, I encountered an error: ${error.response?.data?.message || error.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button (Floating) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-2xl z-40 transition-all duration-300"
        title="Chat with AI Assistant"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Career Assistant Bot</h3>
              <p className="text-sm opacity-90">Ask your doubts</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 w-6 h-6 rounded flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-300 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                  <span className="inline-block animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}