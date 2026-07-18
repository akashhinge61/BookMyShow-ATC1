import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search as SearchIcon, SlidersHorizontal, Trash2, HelpCircle } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { RowSkeleton } from '../components/SkeletonLoader';

export default function Search() {
  const { user } = useAuth();
  const { preferredCity } = usePreferences();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search states
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [maxBudget, setMaxBudget] = useState(1500);

  // Results
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic filter arrays
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  // Fetch categories on load
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await axios.get('/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories:', err.message);
      }
    }
    loadCategories();
  }, []);

  // Fetch search results
  useEffect(() => {
    async function executeSearch() {
      if (!user) return;
      try {
        setLoading(true);
        let url = `/api/events?city=${preferredCity}`;
        
        const q = searchParams.get('q') || '';
        if (q) url += `&search=${encodeURIComponent(q)}`;
        if (category) url += `&category=${category}`;
        if (selectedLanguage) url += `&language=${encodeURIComponent(selectedLanguage)}`;
        if (selectedDate) url += `&date=${selectedDate}`;
        if (maxBudget) url += `&budget=${maxBudget}`;

        const res = await axios.get(url, {
          headers: { 'x-user-id': user.id }
        });
        setEvents(res.data);

        // Extract languages dynamically if not already filtered
        if (!selectedLanguage) {
          const uniqueLangs = [...new Set(res.data.map(e => e.language).filter(Boolean))];
          setLanguages(uniqueLangs);
        }
      } catch (err) {
        console.error('Search failed:', err.message);
      } finally {
        setLoading(false);
      }
    }

    executeSearch();
  }, [searchParams, category, selectedLanguage, selectedDate, maxBudget, preferredCity, user]);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    setSearchParams(keyword ? { q: keyword } : {});
  };

  const handleResetFilters = () => {
    setKeyword('');
    setCategory('');
    setSelectedLanguage('');
    setSelectedDate('');
    setMaxBudget(1500);
    setSearchParams({});
  };

  return (
    <div className="bg-[#0B0C0E] min-h-screen text-white py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        
        {/* Text Search Bar form */}
        <form onSubmit={handleTextSubmit} className="relative w-full max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search for movies, concerts, comedy gigs..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-[#15171B] border border-gray-800 focus:border-brand/50 text-sm text-gray-200 pl-12 pr-24 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand shadow-lg"
          />
          <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
          <button
            type="submit"
            className="absolute right-2 top-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-md transition-all"
          >
            Search
          </button>
        </form>

        {/* Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-4">
          
          {/* Filters Sidebar */}
          <div className="bg-[#15171B] border border-gray-800 p-5 rounded-xl space-y-6 h-fit lg:sticky lg:top-24">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-gray-200">
                <SlidersHorizontal className="w-4 h-4 text-brand" />
                Refine Search
              </span>
              <button onClick={handleResetFilters} className="text-[10px] font-bold text-gray-400 hover:text-white flex items-center gap-0.5">
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#202227] text-xs text-gray-200 rounded border border-gray-800 p-2 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-[#202227] text-xs text-gray-200 rounded border border-gray-800 p-2 focus:outline-none"
              >
                <option value="">All Languages</option>
                {languages.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400">Date Range</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#202227] text-xs text-gray-200 rounded border border-gray-800 p-2 focus:outline-none font-semibold"
              >
                <option value="">Any Date</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="weekend">This Weekend</option>
              </select>
            </div>

            {/* Budget Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-bold uppercase text-gray-400">
                <span>Budget Limit</span>
                <span className="text-brand">₹{maxBudget}</span>
              </div>
              <input
                type="range"
                min="100"
                max="4000"
                step="50"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-brand bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                <span>₹100</span>
                <span>₹4,000</span>
              </div>
            </div>

          </div>

          {/* Results grid */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase">
              {loading ? 'Searching...' : `Search Results (${events.length})`}
            </h4>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <RowSkeleton count={6} />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 bg-[#15171B] border border-gray-800 rounded-xl space-y-3">
                <HelpCircle className="w-12 h-12 text-gray-600 mx-auto" />
                <h5 className="text-base font-bold text-white">No results found</h5>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">We couldn't find any events matching your terms. Try search shortcuts or resetting filters.</p>
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
