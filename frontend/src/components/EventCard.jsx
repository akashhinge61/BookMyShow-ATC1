import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, GitCompare, Check } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

export default function EventCard({ event }) {
  const { addToCompare, removeFromCompare, isComparing } = useCompare();
  const comparing = isComparing(event.id);

  const handleCompareToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (comparing) {
      removeFromCompare(event.id);
    } else {
      addToCompare(event);
    }
  };

  // Human readable category names
  const categoryNames = {
    movies: 'Movie',
    comedy: 'Comedy',
    concerts: 'Concert',
    sports: 'Sports',
    plays: 'Play',
    activities: 'Activity'
  };

  const formattedPrice = Number(event.price).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR'
  });

  return (
    <div className="group flex-shrink-0 w-44 md:w-52 bg-[#15171B] rounded-xl overflow-hidden border border-gray-800 hover:border-brand/40 transition-all duration-300 shadow-lg flex flex-col relative">
      
      {/* Smart Compare Toggle Pin */}
      <button
        onClick={handleCompareToggle}
        className={`absolute top-2 right-2 z-10 p-1.5 rounded-full shadow-md backdrop-blur-md transition-all duration-200 border ${
          comparing 
            ? 'bg-brand text-white border-brand scale-110' 
            : 'bg-black/60 text-gray-300 border-white/10 hover:bg-black/80 hover:text-white'
        }`}
        title={comparing ? "Remove from Smart Compare" : "Add to Smart Compare"}
      >
        {comparing ? <Check className="w-3.5 h-3.5" /> : <GitCompare className="w-3.5 h-3.5" />}
      </button>

      {/* AI Match Badge (if present) */}
      {event.matchPercentage && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-[#1A1115] border border-brand/50 px-2 py-0.5 rounded-full shadow-lg backdrop-blur-md">
          <Sparkles className="w-2.5 h-2.5 text-brand animate-pulse" />
          <span className="text-[10px] font-bold text-brand">{event.matchPercentage}% Match</span>
        </div>
      )}

      {/* Card Click Wrap */}
      <Link to={`/events/${event.id}`} className="flex-1 flex flex-col">
        {/* Poster Wrapper */}
        <div className="relative h-64 md:h-72 overflow-hidden bg-gray-900">
          <img
            src={event.poster_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          {/* Bottom Overlay containing Rating */}
          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center px-2 justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-white">{Number(event.rating).toFixed(1)}/10</span>
            </div>
            <span className="text-[10px] text-gray-400">
              {event.rating_count > 1000 ? `${(event.rating_count / 1000).toFixed(1)}k` : event.rating_count} votes
            </span>
          </div>
        </div>

        {/* Details Area */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            {/* Title */}
            <h4 className="text-sm font-bold text-[#F5F5F7] line-clamp-1 group-hover:text-brand transition-colors duration-200" title={event.title}>
              {event.title}
            </h4>
            {/* Category and Genre */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.25 bg-gray-800 text-gray-400 rounded-sm">
                {categoryNames[event.category_id] || 'Event'}
              </span>
              <span className="text-[10px] text-gray-400 truncate">{event.genre}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-gray-800/60 pt-2">
            <span className="text-[10px] text-gray-500 font-semibold">{event.language}</span>
            <span className="text-xs font-bold text-brand">{formattedPrice}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
