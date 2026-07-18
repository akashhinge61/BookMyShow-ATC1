import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sliders, Sparkles, User, Mail, ShieldAlert, Heart, Star, LogOut, CheckSquare } from 'lucide-react';
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

  // Preference form states
  const [favCategories, setFavCategories] = useState([]);
  const [prefLanguages, setPrefLanguages] = useState([]);
  const [budgetVal, setBudgetVal] = useState(1000);
  const [timeVal, setTimeVal] = useState('evening');

  const categoriesOptions = [
    { id: 'movies', label: 'Movies' },
    { id: 'comedy', label: 'Comedy Shows' },
    { id: 'concerts', label: 'Concerts' },
    { id: 'plays', label: 'Plays' },
    { id: 'sports', label: 'Sports' },
    { id: 'activities', label: 'Activities' }
  ];

  const languagesOptions = ['English', 'Hindi', 'Kannada', 'Urdu', 'Multilingual'];

  useEffect(() => {
    if (preferences) {
      setFavCategories(preferences.favorite_categories || []);
      setPrefLanguages(preferences.preferred_languages || []);
      setBudgetVal(Number(preferences.budget_preference) || 1000);
      setTimeVal(preferences.time_preference || 'evening');
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
    await savePreferences({
      favoriteCategories: favCategories,
      preferredLanguages: prefLanguages,
      preferredCities: preferences.preferred_cities || ['Mumbai'],
      budgetPreference: Number(budgetVal),
      timePreference: timeVal
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
    <div className="bg-[#0B0C0E] min-h-screen text-white py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card + Signin Info */}
        <div className="space-y-6">
          
          <div className="bg-[#15171B] border border-gray-800 rounded-xl p-5 text-center space-y-4 shadow-xl">
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
                  className="w-full bg-brand hover:bg-brand-dark text-white font-bold text-xs py-2.5 rounded-lg shadow-md transition-all"
                >
                  Mock Google Login
                </button>
              </div>
            )}

          </div>

          {/* Prompt banner detailing AI logic */}
          <div className="p-5 rounded-xl border border-brand/20 bg-gradient-to-br from-brand/10 to-[#15171B] space-y-2 text-xs">
            <h4 className="font-bold text-white flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-brand animate-pulse" />
              How AI uses preferences
            </h4>
            <p className="text-gray-400 leading-relaxed">
              When updating preferences, Gemini recalculates match scores across categories immediately. Favorited categories bubble to the top of occasion collection shelves, and prices above budget thresholds receive high matching penalties.
            </p>
          </div>

        </div>

        {/* Middle/Right Column: Preference Form & Bookmarks */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Preferences Edit panel */}
          <div className="bg-[#15171B] border border-gray-800 rounded-xl p-5 md:p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
              <Sliders className="w-5 h-5 text-brand" />
              <h4 className="text-sm font-bold text-white uppercase">AI Personalization Preferences</h4>
            </div>

            <form onSubmit={handlePreferencesSubmit} className="space-y-6 text-xs">
              
              {/* Fav Categories */}
              <div className="space-y-3">
                <label className="font-bold uppercase text-gray-400 block">Favorite Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categoriesOptions.map(cat => {
                    const active = favCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategoryBadge(cat.id)}
                        className={`px-3 py-1.5 rounded-full font-bold border transition-all ${
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

              {/* Fav Languages */}
              <div className="space-y-3">
                <label className="font-bold uppercase text-gray-400 block">Preferred Languages</label>
                <div className="flex flex-wrap gap-2">
                  {languagesOptions.map(lang => {
                    const active = prefLanguages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguageBadge(lang)}
                        className={`px-3 py-1.5 rounded-full font-bold border transition-all ${
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

              {/* Budget slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold uppercase text-gray-400">
                  <span>Max Budget Preference</span>
                  <span className="text-brand">₹{budgetVal}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="3500"
                  step="50"
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(Number(e.target.value))}
                  className="w-full accent-brand bg-gray-850 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

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

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-dark text-white font-bold text-xs py-3 rounded-lg shadow-lg hover:shadow-brand/20 transition-all scale-[1.01]"
              >
                Save Preferences
              </button>

            </form>
          </div>

          {/* Bookmarks Section */}
          <div className="space-y-4">
            <h3 className="text-base font-bold uppercase tracking-wider text-gray-200 border-l-2 border-brand pl-2.5 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-brand" />
              Saved Events
            </h3>
            
            {loadingSaved ? (
              <div className="h-20 bg-gray-850 rounded-xl animate-pulse" />
            ) : savedEvents.length === 0 ? (
              <div className="text-center py-10 bg-[#15171B] border border-gray-800 rounded-xl text-gray-400 text-xs">
                No saved events found. Bookmark shows to access them here.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {savedEvents.map(event => (
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
