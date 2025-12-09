import React, { useEffect, useRef, useState } from 'react';

import { CustomerDetails, Message } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { SHOP_NAME } from '../constants';

interface ChatInterfaceProps {
  customer: CustomerDetails;
  onLogout: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ customer, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat
  useEffect(() => {
    try {
      chatSessionRef.current = createChatSession(customer.name);
      // Add initial greeting from bot
      const greeting: Message = {
        id: 'init-1',
        role: 'model',
        text: `Hello ${customer.name}! Lovely to meet you. I'm Aria from ${SHOP_NAME}. \n\nHow can I help you today? I can assist with pricing for blouses, kurtis, suits, or give you an estimate on delivery times.`,
        timestamp: new Date(),
      };
      setMessages([greeting]);
    } catch (e) {
      console.error("Failed to init chat", e);
      setMessages([{
        id: 'err-1',
        role: 'model',
        text: "I'm having trouble connecting to the boutique server. Please check your API key configuration.",
        timestamp: new Date()
      }]);
    }
  }, [customer.name]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !chatSessionRef.current || isTyping) return;

    const userText = input.trim();
    setInput('');
    setIsTyping(true);

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Create placeholder for bot message
    const botMsgId = (Date.now() + 1).toString();
    const botPlaceholder: Message = {
      id: botMsgId,
      role: 'model',
      text: '',
      timestamp: new Date(),
      isStreaming: true
    };
    setMessages(prev => [...prev, botPlaceholder]);

    try {
      await sendMessageStream(chatSessionRef.current, userText, (streamedText) => {
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId 
            ? { ...msg, text: streamedText } 
            : msg
        ));
      });
      
      // Mark streaming as done
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { ...msg, isStreaming: false } 
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { ...msg, text: "I apologize, I'm having trouble retrieving that information right now. Please try again.", isStreaming: false } 
          : msg
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white font-serif font-bold text-lg border-2 border-white">
                SP
            </div>
            <div>
                <h2 className="font-serif font-bold text-lg leading-none">{SHOP_NAME}</h2>
                <div className="flex items-center space-x-1 mt-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-xs text-slate-300 font-sans">Aria is Online</span>
                </div>
            </div>
        </div>
        <button 
            onClick={onLogout}
            className="text-xs text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-2 transition-colors"
        >
            End Session
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 scrollbar-hide relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm mt-auto mx-2
                    ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-rose-100 text-rose-600'}`}>
                    {msg.role === 'user' ? 'You' : 'Ai'}
                </div>

                {/* Bubble */}
                <div 
                    className={`relative p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                        ? 'bg-slate-800 text-white rounded-br-none' 
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                    }`}
                >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-4 ml-1 bg-rose-400 animate-pulse align-middle"></span>
                    )}
                    <span className={`text-[10px] absolute bottom-1 ${msg.role === 'user' ? 'left-2 text-slate-400' : 'right-2 text-slate-300'}`}>
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-end gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about prices, fabrics, or delivery..."
                className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 px-3 text-slate-700 placeholder-slate-400"
                rows={1}
            />
            <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="mb-1 p-2.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
            </button>
        </form>
        <div className="text-center mt-2">
             <p className="text-[10px] text-slate-400">
                StitchPerfect AI can make mistakes. Please verify final quotes in-store.
             </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
