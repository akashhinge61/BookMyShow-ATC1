import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, User, Menu, X, LogOut, Ticket, Sliders, Sparkles, Sun, Moon, Monitor, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout, loginWithGoogle } = useAuth();
  const { preferredCity, changeCity } = usePreferences();
  const { theme, setTheme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [recentCities, setRecentCities] = useState([]);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const popularCities = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai', 'Ahmedabad', 'Kolkata'];
  
  const allCities = [
    'Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 
    'Chennai', 'Ahmedabad', 'Kolkata', 'Nagpur', 'Nashik', 
    'Goa', 'Indore', 'Lucknow', 'Surat', 'Jaipur', 
    'Bhopal', 'Kochi', 'Mysuru', 'Chandigarh', 'Patna'
  ].sort();

  // Load recent cities from localStorage
  useEffect(() => {
    const recents = JSON.parse(localStorage.getItem('recent_cities') || '[]');
    setRecentCities(recents);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleCitySelect = (city) => {
    changeCity(city);
    
    // Save to recents (max 4 unique cities)
    const updatedRecents = [city, ...recentCities.filter(c => c !== city)].slice(0, 4);
    setRecentCities(updatedRecents);
    localStorage.setItem('recent_cities', JSON.stringify(updatedRecents));
    
    setLocationModalOpen(false);
    setCitySearchQuery('');
  };

  const handleMockLogin = () => {
    const email = `user_${Math.floor(Math.random() * 900)}@gmail.com`;
    const name = `Explorer ${Math.floor(Math.random() * 900)}`;
    loginWithGoogle({ id: 'mock-user-google-id', email, name });
  };

  // Filter cities based on search query
  const filteredCities = allCities.filter(city => 
    city.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  return (
    <header className="bg-[#1F2125] dark:bg-[#1A1C20] text-white border-b border-gray-800 sticky top-0 z-50 transition-colors duration-200">
      {/* Top Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-1.5 flex-shrink-0 select-none">
          <span className="font-extrabold text-xl tracking-tight text-white font-sans">
            book<span className="text-brand font-black">my</span>show
          </span>
          <span className="bg-brand/10 border border-brand/20 text-brand text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider flex items-center gap-0.5 ml-1">
            AI <Sparkles className="w-2.5 h-2.5" />
          </span>
        </Link>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative hidden sm:block">
          <input
            type="text"
            placeholder="Search for Movies, Plays, Concerts, Sports and Activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#33353D] dark:bg-[#252830] text-gray-200 text-xs pl-10 pr-4 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand border border-transparent focus:border-brand/40 transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
        </form>

        {/* Action Widgets */}
        <div className="flex items-center gap-4">
          
          {/* City Location selector button */}
          <button
            onClick={() => setLocationModalOpen(true)}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-brand transition-colors font-semibold py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10"
          >
            <MapPin className="w-3.5 h-3.5 text-brand" />
            <span>{preferredCity}</span>
            <span className="text-[10px] text-gray-500">▼</span>
          </button>

          {/* Theme Selector Button */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-400" /> : 
               theme === 'dark' ? <Moon className="w-4 h-4 text-brand" /> : 
               <Monitor className="w-4 h-4 text-blue-400" />}
            </button>

            {themeDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setThemeDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-32 bg-[#1A1C20] border border-gray-800 rounded-lg shadow-xl py-1 z-20 text-xs animate-slide-up">
                  <button
                    onClick={() => { setTheme('light'); setThemeDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-white/5 ${theme === 'light' ? 'text-brand font-bold' : 'text-gray-300'}`}
                  >
                    <Sun className="w-3.5 h-3.5" /> Light
                  </button>
                  <button
                    onClick={() => { setTheme('dark'); setThemeDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-white/5 ${theme === 'dark' ? 'text-brand font-bold' : 'text-gray-300'}`}
                  >
                    <Moon className="w-3.5 h-3.5" /> Dark
                  </button>
                  <button
                    onClick={() => { setTheme('system'); setThemeDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-white/5 ${theme === 'system' ? 'text-brand font-bold' : 'text-gray-300'}`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> System
                  </button>
                </div>
              </>
            )}
          </div>

          {/* User Signin / Settings controls */}
          <div className="hidden md:flex items-center gap-3">
            {user && user.email ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white">
                  <User className="w-4 h-4 text-brand" />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="bg-gray-800 hover:bg-gray-700 text-xs px-3 py-1.5 rounded text-gray-300 border border-gray-700 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleMockLogin}
                className="bg-brand hover:bg-brand-dark text-xs px-4 py-1.5 rounded font-semibold text-white shadow-md hover:shadow-brand/20 transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* Secondary Navbar Row (Categories bar) */}
      <div className="bg-[#121214] dark:bg-[#0F1012] text-xs font-semibold border-t border-gray-800/40 py-2.5 hidden md:block transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6 text-gray-300">
            <Link to="/movies" className="hover:text-white transition-colors">Movies</Link>
            <Link to="/comedy" className="hover:text-white transition-colors">Comedy Shows</Link>
            <Link to="/concerts" className="hover:text-white transition-colors">Concerts</Link>
            <Link to="/plays" className="hover:text-white transition-colors">Plays</Link>
            <Link to="/sports" className="hover:text-white transition-colors">Sports</Link>
            <Link to="/activities" className="hover:text-white transition-colors">Activities</Link>
          </div>

          <div className="flex items-center gap-5 text-gray-400 font-medium">
            <Link to="/bookings" className="hover:text-white flex items-center gap-1 transition-colors">
              <Ticket className="w-3.5 h-3.5 text-brand" />
              My Bookings
            </Link>
            <Link to="/profile" className="hover:text-white flex items-center gap-1 transition-colors">
              <Sliders className="w-3.5 h-3.5 text-brand" />
              AI Preferences
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1F2125] dark:bg-[#1A1C20] border-t border-gray-800 py-4 px-4 space-y-4 fade-in">
          
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search movies, comedy, activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#33353D] dark:bg-[#252830] text-gray-200 text-xs pl-10 pr-4 py-2.5 rounded-md focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          </form>

          {/* Category Navigation Links */}
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-300">
            <Link to="/movies" onClick={() => setMobileMenuOpen(false)} className="bg-[#121214] p-2.5 rounded text-center hover:bg-gray-800">Movies</Link>
            <Link to="/comedy" onClick={() => setMobileMenuOpen(false)} className="bg-[#121214] p-2.5 rounded text-center hover:bg-gray-800">Comedy Shows</Link>
            <Link to="/concerts" onClick={() => setMobileMenuOpen(false)} className="bg-[#121214] p-2.5 rounded text-center hover:bg-gray-800">Concerts</Link>
            <Link to="/plays" onClick={() => setMobileMenuOpen(false)} className="bg-[#121214] p-2.5 rounded text-center hover:bg-gray-800">Plays</Link>
            <Link to="/sports" onClick={() => setMobileMenuOpen(false)} className="bg-[#121214] p-2.5 rounded text-center hover:bg-gray-800">Sports</Link>
            <Link to="/activities" onClick={() => setMobileMenuOpen(false)} className="bg-[#121214] p-2.5 rounded text-center hover:bg-gray-800">Activities</Link>
          </div>

          <hr className="border-gray-800" />

          {/* User Links */}
          <div className="flex flex-col gap-2.5 text-xs text-gray-300">
            <Link to="/bookings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-1.5 hover:text-white">
              <Ticket className="w-4 h-4 text-brand" />
              My Bookings
            </Link>
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-1.5 hover:text-white">
              <Sliders className="w-4 h-4 text-brand" />
              AI Preferences
            </Link>
          </div>

          <hr className="border-gray-800" />

          {/* Mobile login panel */}
          <div className="pt-2">
            {user && user.email ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Logged in: <strong>{user.name}</strong></span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-gray-800 text-gray-300 border border-gray-700 text-xs px-3 py-1.5 rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  handleMockLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-brand text-white font-bold text-xs py-2.5 rounded shadow-lg"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      {/* SEARCHABLE LOCATION PICKER MODAL OVERLAY */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1F2125] dark:bg-[#1A1C20] border border-gray-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-slide-up text-white">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center gap-4">
              <div className="flex-grow relative">
                <input
                  type="text"
                  placeholder="Search for your city..."
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  className="w-full bg-[#33353D] dark:bg-[#252830] text-sm text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand border border-transparent focus:border-brand/40"
                  autoFocus
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
              <button
                onClick={() => { setLocationModalOpen(false); setCitySearchQuery(''); }}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 max-h-[60vh] no-scrollbar">
              
              {/* Recent Locations */}
              {recentCities.length > 0 && !citySearchQuery && (
                <div className="space-y-2.5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Recent Locations
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {recentCities.map(city => (
                      <button
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        className="px-3.5 py-2 rounded-full text-xs font-bold border border-gray-800 bg-[#252830] text-gray-200 hover:border-brand hover:text-brand transition-all flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3 text-brand" /> {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Cities list */}
              {!citySearchQuery && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500">Popular Cities</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {popularCities.map(city => {
                      const isCurrent = city === preferredCity;
                      return (
                        <button
                          key={city}
                          onClick={() => handleCitySelect(city)}
                          className={`p-3 rounded-xl border font-bold text-xs transition-all flex flex-col items-center justify-center gap-1.5 ${
                            isCurrent
                              ? 'bg-brand/10 border-brand text-brand shadow-lg shadow-brand/5'
                              : 'bg-[#252830] border-gray-800/80 text-gray-200 hover:border-gray-700'
                          }`}
                        >
                          <div className={`p-2 rounded-full ${isCurrent ? 'bg-brand text-white' : 'bg-[#33353D] text-gray-400'} transition-all`}>
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span>{city}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Complete matching/filtered list */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {citySearchQuery ? `Search Results (${filteredCities.length})` : 'All Cities'}
                </h5>
                
                {filteredCities.length === 0 ? (
                  <p className="text-center py-6 text-xs text-gray-500 font-bold">No cities found matching "{citySearchQuery}"</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {filteredCities.map(city => {
                      const isCurrent = city === preferredCity;
                      return (
                        <button
                          key={city}
                          onClick={() => handleCitySelect(city)}
                          className={`px-3 py-2.5 rounded-lg border text-left text-xs font-semibold truncate transition-colors ${
                            isCurrent
                              ? 'bg-brand border-brand text-white'
                              : 'bg-[#252830]/60 hover:bg-[#252830] border-gray-850 text-gray-300 hover:text-white'
                          }`}
                        >
                          {city}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </header>
  );
}
