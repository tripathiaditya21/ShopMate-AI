import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ messages, isLoading }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 animate-fade-in">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
            <span className="text-3xl">🛍️</span>
          </div>
          <h2 className="text-xl font-medium text-slate-300">Welcome to ShopMate AI</h2>
          <p className="text-sm max-w-md text-center">
            Ask me for product recommendations! I analyze live trends and remember your preferences to find the perfect items for you.
          </p>
        </div>
      ) : (
        <div className="space-y-6 pb-4">
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} isAi={msg.isAi} />
          ))}
          {isLoading && (
            <div className="flex gap-4 p-6 rounded-2xl w-full max-w-4xl mx-auto animate-fade-in bg-slate-800/50">
               <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                 <span className="animate-pulse">✨</span>
               </div>
               <div className="px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-none shadow-sm flex items-center">
                 <div className="dot-typing"></div>
               </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
