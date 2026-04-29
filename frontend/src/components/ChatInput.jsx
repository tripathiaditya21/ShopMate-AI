import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSendMessage(query);
      setQuery('');
    }
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask ShopMate AI for recommendations..."
            disabled={isLoading}
            className="w-full bg-slate-800 text-slate-100 placeholder:text-slate-400 rounded-full pl-6 pr-14 py-4 border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-2 p-2.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} className="ml-0.5" />
            )}
          </button>
        </form>
        <p className="text-center text-xs text-slate-500 mt-3">
          ShopMate AI can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
