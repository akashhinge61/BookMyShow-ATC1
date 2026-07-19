import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { RowSkeleton } from '../components/SkeletonLoader';

export default function CategoryPage({ categoryId }) {
  const { user } = useAuth();
  const { preferredCity } = usePreferences();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [maxBudget, setMaxBudget] = useState(1000);

  // Metadata arrays derived from results
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);

  const categoryNames = {
    movies: 'Movies',
    comedy: 'Comedy Shows',
    concerts: 'Concerts',
    plays: 'Plays',
    sports: 'Sports Matches',
    activities: 'Activities'
  };

  useEffect(() => {
    async function fetchEvents() {
      if (!user) return;
      try {
        setLoading(true);
        // Build filters query
        let url = `/api/events?category=${categoryId}&city=${preferredCity}`;
        if (selectedGenre) url += `&genre=${encodeURIComponent(selectedGenre)}`;
        if (selectedLanguage) url += `&language=${encodeURIComponent(selectedLanguage)}`;
        if (maxBudget) url += `&budget=${maxBudget}`;

        const res = await axios.get(url, {
          headers: { 'x-user-id': user.id }
        });

        // Set events
        setEvents(res.data);

        // Derive dynamic genres and languages for filters
        if (!selectedGenre && !selectedLanguage) {
          const uniqueGenres = [...new Set(res.data.map(e => e.genre).filter(Boolean))];
          const uniqueLangs = [...new Set(res.data.map(e => e.language).filter(Boolean))];
          setGenres(uniqueGenres);
          setLanguages(uniqueLangs);
        }
      } catch (err) {
        console.error('Failed to load category events:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [categoryId, preferredCity, selectedGenre, selectedLanguage, maxBudget, user]);

  // Reset filters when switching category
  useEffect(() => {
    setSelectedGenre('');
    setSelectedLanguage('');
    setMaxBudget(1000);
  }, [categoryId]);

  return (
    <div className="bg-white dark:bg-[#0B0C0E] min-h-screen text-gray-900 dark:text-white py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Page Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
          <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            Explore {categoryNames[categoryId]} in {preferredCity}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold">Discover top-rated entertainment curated for you.</p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24 h-fit bg-gray-50 dark:bg-[#15171B] border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-md">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-800">
              <SlidersHorizontal className="w-4 h-4 text-brand" />
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Filters</h4>
            </div>

            {/* Genre Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400">Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-white dark:bg-[#202227] text-xs text-gray-800 dark:text-gray-250 rounded border border-gray-200 dark:border-gray-800 p-2.5 focus:outline-none focus:ring-1 focus:ring-brand font-bold cursor-pointer"
              >
                <option value="">All Genres</option>
                {genres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-white dark:bg-[#202227] text-xs text-gray-800 dark:text-gray-250 rounded border border-gray-200 dark:border-gray-800 p-2.5 focus:outline-none focus:ring-1 focus:ring-brand font-bold cursor-pointer"
              >
                <option value="">All Languages</option>
                {languages.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Budget Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-bold uppercase text-gray-400">
                <span>Max Ticket Price</span>
                <span className="text-brand font-bold">₹{maxBudget}</span>
              </div>
              <input
                type="range"
                min="100"
                max="4000"
                step="50"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-brand bg-gray-850 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                <span>₹100</span>
                <span>₹4,000</span>
              </div>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={() => {
                setSelectedGenre('');
                setSelectedLanguage('');
                setMaxBudget(1000);
              }}
              className="w-full bg-gray-800 hover:bg-gray-700 text-xs py-2.5 rounded-lg font-bold text-gray-300 transition-colors"
            >
              Reset Filters
            </button>

          </div>

          {/* Events Grid Area */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <RowSkeleton count={6} />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 bg-[#15171B] border border-gray-800 rounded-xl space-y-3">
                <Sparkles className="w-12 h-12 text-gray-600 mx-auto" />
                <h5 className="text-base font-bold text-white">No shows match your filter criteria</h5>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">Try resetting filters or adjusting your budget limits to explore all active listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 fade-in">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
