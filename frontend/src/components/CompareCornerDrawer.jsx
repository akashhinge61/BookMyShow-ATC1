import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompare, X, Trash2 } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

export default function CompareCornerDrawer() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-[#16171B]/95 border-t border-brand/40 shadow-2xl backdrop-blur-md z-40 animate-slide-up transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Summary Title */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-brand/10 text-brand">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
              Compare Corner 
              <span className="bg-brand/20 text-brand text-xs font-semibold px-2 py-0.5 rounded-full">
                {compareList.length}/3 selected
              </span>
            </h5>
            <p className="text-[11px] text-gray-400 hidden sm:block">Compare pricing, venues, durations, and AI match scores.</p>
          </div>
        </div>

        {/* Middle Side: Event Thumbnails */}
        <div className="flex items-center gap-3">
          {compareList.map(event => (
            <div 
              key={event.id}
              className="relative w-12 h-16 rounded border border-gray-700 bg-gray-900 group shadow-md"
            >
              <img 
                src={event.poster_url} 
                alt={event.title}
                className="w-full h-full object-cover rounded"
              />
              <button
                onClick={() => removeFromCompare(event.id)}
                className="absolute -top-1.5 -right-1.5 bg-black border border-gray-700 text-gray-400 hover:text-white rounded-full p-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
          
          {/* Empty placeholders */}
          {Array.from({ length: 3 - compareList.length }).map((_, i) => (
            <div 
              key={i}
              className="w-12 h-16 rounded border border-dashed border-gray-700 flex items-center justify-center text-gray-600 bg-black/20 text-[10px]"
            >
              + Slot
            </div>
          ))}
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={clearCompare}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-2 transition-colors border border-transparent hover:border-gray-800 rounded-lg"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
          
          <button
            onClick={() => navigate('/compare')}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold shadow-lg transition-all ${
              compareList.length >= 2
                ? 'bg-brand hover:bg-brand-dark text-white cursor-pointer hover:shadow-brand/20 hover:scale-[1.02]'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            }`}
            disabled={compareList.length < 2}
          >
            Compare Now
          </button>
        </div>

      </div>
    </div>
  );
}
