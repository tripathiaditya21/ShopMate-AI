import React from 'react';
import ProductCard from './ProductCard';
import { User, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const MessageBubble = ({ message, isAi }) => {
  return (
    <div className={cn(
      "flex gap-4 p-6 rounded-2xl w-full max-w-4xl mx-auto animate-fade-in",
      isAi ? "bg-slate-800/50" : "bg-transparent flex-row-reverse"
    )}>
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
        isAi ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-200"
      )}>
        {isAi ? <Sparkles size={20} /> : <User size={20} />}
      </div>
      
      <div className={cn(
        "flex flex-col gap-4 max-w-[80%]",
        !isAi && "items-end"
      )}>
        <div className={cn(
          "px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm",
          isAi 
            ? "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none" 
            : "bg-indigo-600 text-white rounded-tr-none"
        )}>
          {message.text}
        </div>

        {isAi && message.products && message.products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {message.products.map((product, idx) => (
              <ProductCard key={idx} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
