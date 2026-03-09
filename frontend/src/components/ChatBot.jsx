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

  useEffect(() => {
    if (isOpen && !historyLoaded) {
      loadChatHistory();
    }
  }, [isOpen, historyLoaded]);

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getHistory();
      const historyMessages = [];
      
      response.data.messages.forEach((msg, index) => {
        historyMessages.push({
          id: `history-q-${index}`,
          sender: 'user',
          text: msg.question,
          timestamp: new Date(msg.timestamp),
        });
        historyMessages.push({
          id: `history-a-${index}`,
          sender: 'bot',
          text: msg.answer,
          timestamp: new Date(msg.timestamp),
          isCareerRelated: msg.isCareerRelated,
        });
      });

      const sortedMessages = historyMessages.sort((a, b) => a.timestamp - b.timestamp);
      
      if (sortedMessages.length === 0) {
        sortedMessages.push({
          id: 'welcome',
          sender: 'bot',
          text: "Hi! 👋 I'm your AI Career Coach. Ask me anything about resumes, job strategies, or interview prep. I'm focused strictly on your professional success!",
          timestamp: new Date(),
        });
      }

      setMessages(sortedMessages);
      setHistoryLoaded(true);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([{
        id: 'welcome-fallback',
        sender: 'bot',
        text: "Hi! 👋 I'm your AI Career Coach. How can I help you with your career goals today?",
        timestamp: new Date(),
      }]);
      setHistoryLoaded(true);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const question = inputValue.trim();
    if (!question) return;

    const userMsg = { id: `user-${Date.now()}`, sender: 'user', text: question, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await chatAPI.ask(question);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.data.answer || "I'm sorry, I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMsg = {
        id: `error-${Date.now()}`,
        sender: 'bot',
        text: "Connection error. Please check your internet and try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (text) => {
    if (!text) return null;
    return text.toString().split('\n').map((line, idx) => {
      if (line.trim() === '') return <div key={idx} className="h-2" />;
      
      let processedLine = line;
      // Handle bold
      const boldParts = processedLine.split(/(\*\*.*?\*\*)/g);
      const elements = boldParts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="text-indigo-900 font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <div key={idx} className="flex gap-2 mb-1 pl-2">
            <span className="text-indigo-500 font-bold">•</span>
            <span className="flex-1">{elements}</span>
          </div>
        );
      }
      
      if (line.trim().match(/^\d+\./)) {
        const [num, ...rest] = line.split('.');
        return (
          <div key={idx} className="flex gap-2 mb-1">
            <span className="text-indigo-600 font-bold">{num}.</span>
            <span className="flex-1">{rest.join('.').trim()}</span>
          </div>
        );
      }

      return <p key={idx} className="mb-2 last:mb-0 leading-relaxed">{elements}</p>;
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 flex items-center justify-center text-3xl"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="fixed bottom-28 right-8 w-[400px] h-[600px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col z-50 border border-slate-100 overflow-hidden animate-fade-in shadow-indigo-200">
          {/* Header */}
          <div className="bg-indigo-600 p-6 text-white flex justify-between items-center bg-gradient-to-r from-indigo-600 to-violet-600">
            <div>
              <h3 className="text-xl font-black">AI Career Coach</h3>
              <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest opacity-80 italic">Precision Advice</p>
            </div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_#34d399]"></div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' 
                    : 'glass-card !bg-white rounded-2xl rounded-tl-none !p-4 border border-slate-100'
                }`}>
                  <div className={`text-sm ${msg.sender === 'user' ? 'font-medium' : 'text-slate-700'}`}>
                    {renderMessageContent(msg.text)}
                  </div>
                  <span className={`text-[9px] mt-2 block font-bold uppercase opacity-50 ${msg.sender === 'user' ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="glass-card !bg-white rounded-2xl rounded-tl-none !p-4 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your career question..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 transition-all"
            >
              <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}