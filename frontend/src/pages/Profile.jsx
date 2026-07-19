import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sliders, Sparkles, User, Mail, Heart, Star, LogOut, CheckSquare, Settings, EyeOff, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useToast } from '../context/ToastContext';
import EventCard from '../components/EventCard';

export default function Profile() {
  const { user, logout, loginWithGoogle } = useAuth();
  const { preferences, savePreferences } = usePreferences();
  const { addToast } = useToast();

  const [savedEvents, setSavedEvents] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [activeTab, setActiveTab] = useState('categories'); // 'categories', 'personalization', 'filters', 'saved'

  // Core preferences states
  const [favCategories, setFavCategories] = useState([]);
  const [prefLanguages, setPrefLanguages] = useState([]);
  const [budgetVal, setBudgetVal] = useState(1000);
  const [timeVal, setTimeVal] = useState('evening');

  // Additional advanced preferences states
  const [favGenres, setFavGenres] = useState('');
  const [favActors, setFavActors] = useState('');
  const [favDirectors, setFavDirectors] = useState('');
  const [favArtists, setFavArtists] = useState('');
  const [favSports, setFavSports] = useState('');
  const [favComedians, setFavComedians] = useState('');
  const [favVenues, setFavVenues] = useState('');
  const [blockedGenres, setBlockedGenres] = useState('');
  const [blockedActors, setBlockedActors] = useState('');
  
  const [travelDistance, setTravelDistance] = useState(15);
  const [moodPreference, setMoodPreference] = useState('Any');
  const [runtimePref, setRuntimePref] = useState('Any');
  const [preferredDays, setPreferredDays] = useState([]); // ['Fri', 'Sat', 'Sun']
  
  // Toggles state
  const [toggles, setToggles] = useState({
    weekend_only: false,
    family_friendly: false,
    kids_friendly: false,
    date_night: false,
    friends: false,
    solo: false,
    indoor: false,
    outdoor: false,
    accessibility: false,
    parking: false,
    food: false,
    premium_seating: false,
    hidden_gems: false,
    trending: false
  });

  const categoriesOptions = [
    { id: 'movies', label: 'Movies' },
    { id: 'comedy', label: 'Comedy Shows' },
    { id: 'concerts', label: 'Concerts' },
    { id: 'plays', label: 'Plays' },
    { id: 'sports', label: 'Sports Matches' },
    { id: 'activities', label: 'Activities' }
  ];

  const languagesOptions = [
    'English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 
    'Kannada', 'Malayalam', 'Punjabi', 'Gujarati', 'Bengali', 
    'Odia', 'Urdu', 'Assamese', 'Konkani', 'Nepali', 
    'Tulu', 'Sindhi', 'Dogri', 'Kashmiri', 'Bhojpuri'
  ];

  const moodOptions = ['Any', 'Exciting', 'Calm', 'Spooky', 'Romantic', 'Hilarious', 'Intellectual'];
  const dayOptions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    if (preferences) {
      setFavCategories(preferences.favorite_categories || []);
      setPrefLanguages(preferences.preferred_languages || []);
      setBudgetVal(Number(preferences.budget_preference) || 1000);
      setTimeVal(preferences.time_preference || 'evening');

      const addPrefs = preferences.additional_preferences || {};
      setFavGenres(addPrefs.favorite_genres || '');
      setFavActors(addPrefs.favorite_actors || '');
      setFavDirectors(addPrefs.favorite_directors || '');
      setFavArtists(addPrefs.favorite_artists || '');
      setFavSports(addPrefs.favorite_sports || '');
      setFavComedians(addPrefs.favorite_comedians || '');
      setFavVenues(addPrefs.favorite_venues || '');
      setBlockedGenres(addPrefs.blocked_genres || '');
      setBlockedActors(addPrefs.blocked_actors || '');
      
      setTravelDistance(Number(addPrefs.travel_distance) || 15);
      setMoodPreference(addPrefs.mood || 'Any');
      setRuntimePref(addPrefs.runtime || 'Any');
      setPreferredDays(addPrefs.preferred_days || []);

      setToggles({
        weekend_only: !!addPrefs.weekend_only,
        family_friendly: !!addPrefs.family_friendly,
        kids_friendly: !!addPrefs.kids_friendly,
        date_night: !!addPrefs.date_night,
        friends: !!addPrefs.friends,
        solo: !!addPrefs.solo,
        indoor: !!addPrefs.indoor,
        outdoor: !!addPrefs.outdoor,
        accessibility: !!addPrefs.accessibility,
        parking: !!addPrefs.parking,
        food: !!addPrefs.food,
        premium_seating: !!addPrefs.premium_seating,
        hidden_gems: !!addPrefs.hidden_gems,
        trending: !!addPrefs.trending
      });
    }
  }, [preferences]);

  useEffect(() => {
    async function fetchSaved() {
      if (!user) return;
      try {
        setLoadingSaved(true);
        const res = await axios.get('/api/user/saved', {
          headers: { 'x-user-id': user.id }
        });
        setSavedEvents(res.data);
      } catch (err) {
        console.error('Failed to fetch saved events:', err.message);
      } finally {
        setLoadingSaved(false);
      }
    }
    fetchSaved();
  }, [user]);

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    
    const additionalPreferences = {
      favorite_genres: favGenres,
      favorite_actors: favActors,
      favorite_directors: favDirectors,
      favorite_artists: favArtists,
      favorite_sports: favSports,
      favorite_comedians: favComedians,
      favorite_venues: favVenues,
      blocked_genres: blockedGenres,
      blocked_actors: blockedActors,
      travel_distance: travelDistance,
      mood: moodPreference,
      runtime: runtimePref,
      preferred_days: preferredDays,
      ...toggles
    };

    await savePreferences({
      favoriteCategories: favCategories,
      preferredLanguages: prefLanguages,
      preferredCities: preferences.preferred_cities || ['Mumbai'],
      budgetPreference: Number(budgetVal),
      timePreference: timeVal,
      additionalPreferences
    });
  };

  const toggleCategoryBadge = (catId) => {
    setFavCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const toggleLanguageBadge = (lang) => {
    setPrefLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const toggleDayBadge = (day) => {
    setPreferredDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleToggleChange = (key) => {
    setToggles(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleMockSignIn = () => {
    const email = `user_${Math.floor(Math.random() * 900)}@gmail.com`;
    loginWithGoogle({
      id: 'mock-user-google-id',
      email,
      name: 'Google Explorer'
    });
    addToast('Signed in successfully!', 'success');
  };

  if (!user) return null;

  return (
    <div className="bg-[#0B0C0E] dark:bg-[#0B0C0E] min-h-screen text-white py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Profile Card + Signin Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#15171B] dark:bg-[#15171B] border border-gray-800 rounded-xl p-5 text-center space-y-4 shadow-xl">
            {/* User Avatar */}
            <div className="w-20 h-20 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand text-2xl font-black mx-auto shadow-md">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <div>
              <h3 className="text-base font-bold text-white">{user.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{user.email || 'Guest Account'}</p>
            </div>

            <hr className="border-gray-800" />

            <div className="flex justify-between items-center text-xs text-gray-400 text-left px-2">
              <span>Account Type:</span>
              <span className="font-bold text-brand uppercase">{user.email ? 'Google Member' : 'Guest Session'}</span>
            </div>

            {user.email ? (
              <button
                onClick={logout}
                className="w-full bg-gray-800 hover:bg-gray-700 text-xs font-bold py-2.5 rounded-lg border border-gray-700/60 transition-colors"
              >
                Logout
              </button>
            ) : (
              <div className="space-y-2 pt-2">
                <p className="text-[10px] text-gray-400">Sign in with mock google credentials to synchronize preference files permanently.</p>
                <button
                  onClick={handleMockSignIn}
                  className="w-full bg-brand hover:bg-brand-dark text-white font-bold text-xs py-2.5 rounded-lg shadow-md transition-all animate-pulse"
                >
                  Mock Google Login
                </button>
              </div>
            )}
          </div>

          {/* Prompt banner detailing AI logic */}
          <div className="p-5 rounded-xl border border-brand/20 bg-gradient-to-br from-brand/10 to-[#15171B] space-y-2.5 text-xs shadow-lg">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand animate-pulse" />
              Advanced Personalization
            </h4>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Our database matches your preferences immediately. Choosing actors, genres, and mood filters recalculates match scores across collections. Blocked actors and genres apply strict visual filters to prevent unwanted events from showing.
            </p>
          </div>
        </div>

        {/* Right Column: Preference Form & Tabs */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Tab Selection */}
          <div className="flex border-b border-gray-800 overflow-x-auto no-scrollbar gap-2">
            <button
              onClick={() => setActiveTab('categories')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'categories' ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Categories & Languages
            </button>
            <button
              onClick={() => setActiveTab('personalization')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'personalization' ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Favorites & Blocklists
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'filters' ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Budgets & Occasions
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'saved' ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Saved Events ({savedEvents.length})
            </button>
          </div>

          {activeTab !== 'saved' ? (
            <form onSubmit={handlePreferencesSubmit} className="bg-[#15171B] border border-gray-800 rounded-xl p-5 md:p-6 shadow-xl space-y-8">
              
              {/* TAB 1: Categories & Languages */}
              {activeTab === 'categories' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
                    <Sliders className="w-5 h-5 text-brand" />
                    <h4 className="text-sm font-bold text-white uppercase">Categories & Languages</h4>
                  </div>

                  {/* Favorite Categories */}
                  <div className="space-y-3">
                    <label className="font-bold uppercase text-gray-400 text-xs block">Favorite Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {categoriesOptions.map(cat => {
                        const active = favCategories.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategoryBadge(cat.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                              active
                                ? 'bg-brand/25 border-brand text-brand shadow-lg shadow-brand/5'
                                : 'bg-[#202227] border-gray-800 text-gray-400 hover:border-gray-700'
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Languages (20+) */}
                  <div className="space-y-3">
                    <label className="font-bold uppercase text-gray-400 text-xs block">Preferred Languages (20+ list)</label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-800/80 rounded-xl bg-[#0B0C0E]/50">
                      {languagesOptions.map(lang => {
                        const active = prefLanguages.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleLanguageBadge(lang)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                              active
                                ? 'bg-brand/25 border-brand text-brand shadow-lg'
                                : 'bg-[#202227] border-gray-800 text-gray-400 hover:border-gray-700'
                            }`}
                          >
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Favorites & Blocklists */}
              {activeTab === 'personalization' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
                    <Settings className="w-5 h-5 text-brand" />
                    <h4 className="text-sm font-bold text-white uppercase">Personalization & Blocklists</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                    {/* Fav Genres */}
                    <div className="space-y-2">
                      <label className="font-bold text-gray-400 block uppercase">Favorite Genres</label>
                      <input
                        type="text"
                        placeholder="e.g. Action, Comedy, Romance"
                        value={favGenres}
                        onChange={(e) => setFavGenres(e.target.value)}
                        className="w-full bg-[#202227] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>

                    {/* Fav Actors */}
                    <div className="space-y-2">
                      <label className="font-bold text-gray-400 block uppercase">Favorite Actors</label>
                      <input
                        type="text"
                        placeholder="e.g. Prabhas, Shah Rukh Khan"
                        value={favActors}
                        onChange={(e) => setFavActors(e.target.value)}
                        className="w-full bg-[#202227] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>

                    {/* Fav Directors */}
                    <div className="space-y-2">
                      <label className="font-bold text-gray-400 block uppercase">Favorite Directors</label>
                      <input
                        type="text"
                        placeholder="e.g. Christopher Nolan, Nag Ashwin"
                        value={favDirectors}
                        onChange={(e) => setFavDirectors(e.target.value)}
                        className="w-full bg-[#202227] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>

                    {/* Fav Artists */}
                    <div className="space-y-2">
                      <label className="font-bold text-gray-400 block uppercase">Favorite Artists / Singers</label>
                      <input
                        type="text"
                        placeholder="e.g. Diljit Dosanjh, Arijit Singh"
                        value={favArtists}
                        onChange={(e) => setFavArtists(e.target.value)}
                        className="w-full bg-[#202227] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>

                    {/* Fav Sports */}
                    <div className="space-y-2">
                      <label className="font-bold text-gray-400 block uppercase">Favorite Sports / Leagues</label>
                      <input
                        type="text"
                        placeholder="e.g. Cricket T20, Pro Kabaddi"
                        value={favSports}
                        onChange={(e) => setFavSports(e.target.value)}
                        className="w-full bg-[#202227] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>

                    {/* Fav Comedians */}
                    <div className="space-y-2">
                      <label className="font-bold text-gray-400 block uppercase">Favorite Comedians</label>
                      <input
                        type="text"
                        placeholder="e.g. Zakir Khan, Abhishek Upmanyu"
                        value={favComedians}
                        onChange={(e) => setFavComedians(e.target.value)}
                        className="w-full bg-[#202227] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>

                    {/* Fav Venues */}
                    <div className="space-y-2">
                      <label className="font-bold text-gray-400 block uppercase">Favorite Auditoriums / Stadiums</label>
                      <input
                        type="text"
                        placeholder="e.g. NMACC, Prithvi Theatre, Wankhede"
                        value={favVenues}
                        onChange={(e) => setFavVenues(e.target.value)}
                        className="w-full bg-[#202227] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>

                    {/* Mood Preference */}
                    <div className="space-y-2">
                      <label className="font-bold text-gray-400 block uppercase">Preferred Mood</label>
                      <select
                        value={moodPreference}
                        onChange={(e) => setMoodPreference(e.target.value)}
                        className="w-full bg-[#202227] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                      >
                        {moodOptions.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Blocklist elements */}
                  <div className="pt-4 border-t border-gray-800 space-y-4">
                    <h5 className="font-bold text-xs text-red-400 uppercase flex items-center gap-1.5">
                      <EyeOff className="w-4 h-4" /> Strict Exclusions (Blocked Content)
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                      <div className="space-y-2">
                        <label className="font-bold text-gray-400 block uppercase">Block Genres</label>
                        <input
                          type="text"
                          placeholder="e.g. Horror, Violence"
                          value={blockedGenres}
                          onChange={(e) => setBlockedGenres(e.target.value)}
                          className="w-full bg-[#202227] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-red-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-bold text-gray-400 block uppercase">Block Actors / Performers</label>
                        <input
                          type="text"
                          placeholder="e.g. Specific comedian names"
                          value={blockedActors}
                          onChange={(e) => setBlockedActors(e.target.value)}
                          className="w-full bg-[#202227] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-red-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Budgets & Occasions */}
              {activeTab === 'filters' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
                    <ShieldCheck className="w-5 h-5 text-brand" />
                    <h4 className="text-sm font-bold text-white uppercase">Budgets, Distance & Occasions</h4>
                  </div>

                  {/* Sliders layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Budget slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold uppercase text-gray-400">
                        <span>Max Ticket Price</span>
                        <span className="text-brand">₹{budgetVal}</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="4000"
                        step="50"
                        value={budgetVal}
                        onChange={(e) => setBudgetVal(Number(e.target.value))}
                        className="w-full accent-brand bg-gray-850 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Distance slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold uppercase text-gray-400">
                        <span>Max Travel Distance</span>
                        <span className="text-brand">{travelDistance} KM</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={travelDistance}
                        onChange={(e) => setTravelDistance(Number(e.target.value))}
                        className="w-full accent-brand bg-gray-850 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Timing choices & Days of week */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Timing radio choice */}
                    <div className="space-y-3">
                      <label className="font-bold uppercase text-gray-400 block">Preferred Time of Day</label>
                      <div className="grid grid-cols-4 gap-2.5 text-center">
                        {['morning', 'afternoon', 'evening', 'night'].map(t => {
                          const active = timeVal === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setTimeVal(t)}
                              className={`py-2 rounded-lg font-bold border capitalize transition-all ${
                                active
                                  ? 'bg-brand text-white border-brand shadow-md'
                                  : 'bg-[#202227] border-gray-800 text-gray-400 hover:border-gray-700'
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Days of Week */}
                    <div className="space-y-3">
                      <label className="font-bold uppercase text-gray-400 block">Preferred Days</label>
                      <div className="flex flex-wrap gap-2">
                        {dayOptions.map(day => {
                          const active = preferredDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDayBadge(day)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                active
                                  ? 'bg-brand text-white border-brand shadow-sm'
                                  : 'bg-[#202227] border-gray-800 text-gray-400 hover:border-gray-700'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 14 Personalization Switch Checkboxes */}
                  <div className="space-y-3 pt-4 border-t border-gray-800">
                    <label className="font-bold uppercase text-gray-400 text-xs block">Event Suitability Toggles</label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs pt-1">
                      {[
                        { key: 'weekend_only', label: 'Weekend Only' },
                        { key: 'family_friendly', label: 'Family Friendly' },
                        { key: 'kids_friendly', label: 'Kids Friendly' },
                        { key: 'date_night', label: 'Ideal for Date Night' },
                        { key: 'friends', label: 'Great with Friends' },
                        { key: 'solo', label: 'Solo Experience' },
                        { key: 'indoor', label: 'Indoor Venues Only' },
                        { key: 'outdoor', label: 'Outdoor Venues Only' },
                        { key: 'accessibility', label: 'Wheelchair / Accessibility Access' },
                        { key: 'parking', label: 'Parking Space Available' },
                        { key: 'food', label: 'Food & Beverage Outlets' },
                        { key: 'premium_seating', label: 'Premium Recliner Seating Only' },
                        { key: 'hidden_gems', label: 'Search Hidden Gems (Low vote count)' },
                        { key: 'trending', label: 'Trending Near Me Only' }
                      ].map(item => (
                        <label key={item.key} className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-800 bg-[#202227]/40 hover:bg-[#202227]/80 cursor-pointer select-none transition-colors">
                          <input
                            type="checkbox"
                            checked={toggles[item.key]}
                            onChange={() => handleToggleChange(item.key)}
                            className="w-4 h-4 rounded text-brand accent-brand bg-gray-800 border-gray-700 focus:ring-brand"
                          />
                          <span className="text-gray-300 font-semibold">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-dark text-white font-bold text-xs py-3.5 rounded-lg shadow-lg hover:shadow-brand/20 transition-all scale-[1.01] hover:scale-[1.02]"
              >
                Save AI Personalization Settings
              </button>

            </form>
          ) : (
            /* Bookmarks Section */
            <div className="space-y-6">
              <h3 className="text-base font-bold uppercase tracking-wider text-gray-200 border-l-2 border-brand pl-2.5 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-brand" />
                Saved Events
              </h3>
              
              {loadingSaved ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-64 bg-gray-850 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : savedEvents.length === 0 ? (
                <div className="text-center py-16 bg-[#15171B] border border-gray-800 rounded-xl text-gray-400 text-xs">
                  No saved events found. Bookmark shows and events to access them here.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 animate-fade-in">
                  {savedEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
