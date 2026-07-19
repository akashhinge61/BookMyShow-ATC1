import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, SlidersHorizontal, ArrowLeft, Star, Heart } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { RowSkeleton } from '../components/SkeletonLoader';

export default function OccasionPage() {
  const { occasionName } = useParams();
  const { user } = useAuth();
  const { preferredCity } = usePreferences();
  const navigate = useNavigate();

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [maxPrice, setMaxPrice] = useState(4000);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    async function fetchOccasionData() {
      if (!user) return;
      try {
        setLoading(true);
        const res = await axios.get(`/api/ai/collections?city=${preferredCity}`, {
          headers: { 'x-user-id': user.id }
        });
        const matched = res.data.find(c => c.occasion.toLowerCase() === decodeURIComponent(occasionName).toLowerCase());
        setCollection(matched || null);

        if (matched) {
          const uniqueGenres = [...new Set(matched.events.map(e => e.genre).filter(Boolean))];
          setGenres(uniqueGenres);
        }
      } catch (err) {
        console.error('Failed to load occasion data:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOccasionData();
  }, [occasionName, preferredCity, user]);

  if (loading) {
    return (
      <div className="bg-[#0B0C0E] dark:bg-[#0B0C0E] text-white min-h-screen py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="h-6 w-32 bg-gray-800 rounded animate-pulse" />
          <div className="h-24 bg-gray-800 rounded-xl animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
            <RowSkeleton count={8} />
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="bg-[#0B0C0E] dark:bg-[#0B0C0E] text-white min-h-screen flex flex-col items-center justify-center transition-colors duration-200">
        <div className="text-center p-8 bg-[#15171B] border border-gray-800 rounded-2xl max-w-sm space-y-4">
          <Sparkles className="w-12 h-12 text-brand mx-auto animate-pulse" />
          <h3 className="text-lg font-bold">Occasion Collection Not Found</h3>
          <p className="text-xs text-gray-400">We couldn't find any recommendations for "{occasionName}" in {preferredCity} right now.</p>
          <Link to="/" className="inline-block bg-brand hover:bg-brand-dark px-6 py-2 rounded-lg font-bold text-xs">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Filter events based on criteria
  const filteredEvents = collection.events.filter(event => {
    const genreMatch = !selectedGenre || event.genre === selectedGenre;
    const priceMatch = Number(event.price) <= maxPrice;
    return genreMatch && priceMatch;
  });

  return (
    <div className="bg-[#0B0C0E] dark:bg-[#0B0C0E] text-white dark:text-white min-h-screen py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        {/* AI Curation Header Banner */}
        <div className="p-6 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 via-[#1C1115] to-[#15171B] relative overflow-hidden shadow-xl space-y-3">
          <div className="absolute top-0 right-0 w-36 h-36 bg-brand/5 rounded-full filter blur-xl" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand animate-bounce" />
            <span className="text-[10px] bg-brand/20 text-brand border border-brand/35 font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
              AI Personalized Curation
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
            {collection.occasion}
          </h1>
          <p className="text-xs md:text-sm text-gray-200 font-semibold leading-relaxed max-w-3xl">
            {collection.description}
          </p>
        </div>

        {/* Layout Grid: Sidebar filters + Grid content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit bg-[#15171B] border border-gray-800 p-5 rounded-xl space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
              <SlidersHorizontal className="w-4 h-4 text-brand" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Refine Curation</h4>
            </div>

            {/* Genre Filter */}
            {genres.length > 0 && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-gray-400">Genre</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-[#202227] text-xs text-gray-200 rounded border border-gray-800 p-2.5 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                >
                  <option value="">All Genres</option>
                  {genres.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Filter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-bold uppercase text-gray-400">
                <span>Max Ticket Price</span>
                <span className="text-brand font-bold">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="200"
                max="4000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand bg-gray-850 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                <span>₹200</span>
                <span>₹4,000</span>
              </div>
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSelectedGenre('');
                setMaxPrice(4000);
              }}
              className="w-full bg-gray-800 hover:bg-gray-700 text-xs py-2.5 rounded-lg font-bold text-gray-300 transition-colors"
            >
              Reset Filters
            </button>
          </div>

          {/* Cards Grid */}
          <div className="lg:col-span-3">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-20 bg-[#15171B] border border-gray-800 rounded-xl space-y-3">
                <Sparkles className="w-10 h-10 text-gray-600 mx-auto" />
                <h5 className="text-sm font-bold text-white">No matches found</h5>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">Try resetting filters to show all events compiled for this occasion.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
                {filteredEvents.map(event => (
                  <div key={event.id} className="flex flex-col space-y-2.5 bg-[#15171B]/30 p-2 rounded-2xl border border-gray-800/80 hover:border-brand/30 transition-all duration-300 relative group">
                    <EventCard event={event} />
                    
                    {/* AI curation notes below the card */}
                    <div className="px-1.5 pb-2 text-[10px] text-gray-400 italic flex items-start gap-1 leading-normal border-t border-gray-800/40 pt-2 select-none">
                      <Sparkles className="w-3.5 h-3.5 text-brand flex-shrink-0 mt-0.5" />
                      <span>{event.aiReason || 'Handpicked match for you.'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
