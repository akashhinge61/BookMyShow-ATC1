import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, User, Menu, X, LogOut, Ticket, Sliders, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export default function Navbar() {
  const { user, logout, loginWithGoogle } = useAuth();
  const { preferredCity, changeCity } = usePreferences();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune'];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleCityChange = (e) => {
    changeCity(e.target.value);
  };

  const handleMockLogin = () => {
    const email = `user_${Math.floor(Math.random() * 900)}@gmail.com`;
    const name = `Explorer ${Math.floor(Math.random() * 900)}`;
    loginWithGoogle({ id: 'mock-user-google-id', email, name });
  };

  return (
    <header className="bg-[#1F2125] text-white border-b border-gray-800 sticky top-0 z-50">
      {/* Top Navbar Row */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
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
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg relative hidden sm:block">
          <input
            type="text"
            placeholder="Search for Movies, Plays, Concerts, Sports and Activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#33353D] text-gray-200 text-xs pl-10 pr-4 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand border border-transparent focus:border-brand/40"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
        </form>

        {/* Action Widgets */}
        <div className="flex items-center gap-4">
          
          {/* City Location dropdown selector */}
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <MapPin className="w-3.5 h-3.5 text-brand" />
            <select
              value={preferredCity}
              onChange={handleCityChange}
              className="bg-transparent text-gray-200 focus:outline-none cursor-pointer font-semibold py-1 pr-1 hover:text-white"
            >
              {cities.map((city) => (
                <option key={city} value={city} className="bg-[#1F2125] text-white">
                  {city}
                </option>
              ))}
            </select>
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
                  className="bg-gray-800 hover:bg-gray-700 text-xs px-3 py-1.5 rounded text-gray-300 border border-gray-700 hover:text-white"
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
      <div className="bg-[#121214] text-xs font-semibold border-t border-gray-800/40 py-2.5 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6 text-gray-300">
            <Link to="/movies" className="hover:text-white transition-colors">Movies</Link>
            <Link to="/comedy" className="hover:text-white transition-colors">Comedy Shows</Link>
            <Link to="/concerts" className="hover:text-white transition-colors">Concerts</Link>
            <Link to="/plays" className="hover:text-white transition-colors">Plays</Link>
            <Link to="/sports" className="hover:text-white transition-colors">Sports</Link>
            <Link to="/activities" className="hover:text-white transition-colors">Activities</Link>
          </div>

          <div className="flex items-center gap-5 text-gray-400 font-medium">
            <Link to="/bookings" className="hover:text-white flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5 text-brand" />
              My Bookings
            </Link>
            <Link to="/profile" className="hover:text-white flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-brand" />
              AI Preferences
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1F2125] border-t border-gray-800 py-4 px-4 space-y-4 fade-in">
          
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search movies, comedy, activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#33353D] text-gray-200 text-xs pl-10 pr-4 py-2.5 rounded-md focus:outline-none"
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

    </header>
  );
}
