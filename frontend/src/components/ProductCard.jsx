import React from 'react';
import { ExternalLink, Tag } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg hover:border-indigo-500/50 transition-all duration-300 animate-slide-up group">
      <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
        <h3 className="text-lg font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
          {product.name}
        </h3>
        <span className="flex shrink-0 items-center gap-1 bg-indigo-500/10 text-indigo-400 text-sm font-medium px-2.5 py-1 rounded-full whitespace-nowrap">
          <Tag size={14} />
          {product.price}
        </span>
      </div>
      <p className="text-slate-400 text-sm leading-relaxed mb-4">
        {product.reason}
      </p>
      <a 
        href={product.url || "#"} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
        View Details <ExternalLink size={14} />
      </a>
    </div>
  );
};

export default ProductCard;
