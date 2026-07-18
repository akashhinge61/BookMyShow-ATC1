import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Heart, Calendar, ArrowRight, Flame, Film, Laugh, Music, Trophy, Coins, Clock, Users, Home as HomeIcon, Moon, CloudRain, Gift, Baby } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { RowSkeleton } from '../components/SkeletonLoader';

const occasionDetailsMap = {
  'For You': { gradient: 'from-[#A855F7]/30 to-[#6B21A8]/10', border: 'border-[#A855F7]/30', text: 'text-purple-400', icon: 'Sparkles' },
  'Date Night': { gradient: 'from-[#F43F5E]/30 to-[#BE123C]/10', border: 'border-[#F43F5E]/30', text: 'text-rose-400', icon: 'Heart' },
  'Weekend Plans': { gradient: 'from-[#10B981]/30 to-[#047857]/10', border: 'border-[#10B981]/30', text: 'text-emerald-400', icon: 'Calendar' },
  'Need a Laugh': { gradient: 'from-[#F59E0B]/30 to-[#B45309]/10', border: 'border-[#F59E0B]/30', text: 'text-amber-400', icon: 'Laugh' },
  'Live Music Tonight': { gradient: 'from-[#06B6D4]/30 to-[#0891B2]/10', border: 'border-[#06B6D4]/30', text: 'text-cyan-400', icon: 'Music' },
  'Under ₹500': { gradient: 'from-[#14B8A6]/30 to-[#0F766E]/10', border: 'border-[#14B8A6]/30', text: 'text-teal-400', icon: 'Coins' },
  'Under 2 Hours': { gradient: 'from-[#3B82F6]/30 to-[#1D4ED8]/10', border: 'border-[#3B82F6]/30', text: 'text-blue-400', icon: 'Clock' },
  'Trending Near You': { gradient: 'from-[#EF4444]/30 to-[#B91C1C]/10', border: 'border-[#EF4444]/30', text: 'text-red-400', icon: 'Flame' },
  'Friends Hangout': { gradient: 'from-[#06B6D4]/30 to-[#0369A1]/10', border: 'border-[#06B6D4]/30', text: 'text-sky-400', icon: 'Users' },
  'Family Night': { gradient: 'from-[#F97316]/30 to-[#C2410C]/10', border: 'border-[#F97316]/30', text: 'text-orange-400', icon: 'Home' },
  'After Office Escape': { gradient: 'from-[#6366F1]/30 to-[#4338CA]/10', border: 'border-[#6366F1]/30', text: 'text-indigo-400', icon: 'Moon' },
  'Rainy Day Picks': { gradient: 'from-[#64748B]/30 to-[#334155]/10', border: 'border-[#64748B]/30', text: 'text-slate-400', icon: 'CloudRain' },
  'Birthday Plans': { gradient: 'from-[#EC4899]/30 to-[#BE185D]/10', border: 'border-[#EC4899]/30', text: 'text-pink-400', icon: 'Gift' },
  'Kids Friendly': { gradient: 'from-[#84CC16]/30 to-[#4D7C0F]/10', border: 'border-[#84CC16]/30', text: 'text-lime-400', icon: 'Baby' }
};

const IconComponent = ({ name, className }) => {
  switch (name) {
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Calendar': return <Calendar className={className} />;
    case 'Laugh': return <Laugh className={className} />;
    case 'Music': return <Music className={className} />;
    case 'Coins': return <Coins className={className} />;
    case 'Clock': return <Clock className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Home': return <HomeIcon className={className} />;
    case 'Moon': return <Moon className={className} />;
    case 'CloudRain': return <CloudRain className={className} />;
    case 'Gift': return <Gift className={className} />;
    case 'Baby': return <Baby className={className} />;
    default: return <Sparkles className={className} />;
  }
};

export default function Home() {
  const { user } = useAuth();
  const { preferredCity } = usePreferences();
  const [collections, setCollections] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeOccasion, setActiveOccasion] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselSlides = [
    {
      id: 6,
      title: 'A.R. Rahman Live in Concert',
      subtitle: 'Symphony of Hope Tour - Experiencing the Magic Live',
      bgUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=60',
      tag: 'Concert'
    },
    {
      id: 8,
      title: 'IPL: RCB vs Mumbai Indians',
      subtitle: 'The ultimate T20 cricket clash at Chinnaswamy',
      bgUrl: 'https://images.unsplash.com/photo-1540747737956-3787233e5ad0?w=1200&auto=format&fit=crop&q=60',
      tag: 'Sports'
    },
    {
      id: 4,
      title: 'Anubhav Singh Bassi: Kisi Ko Batana Mat',
      subtitle: 'Standup Comedy Special - Laugh till you drop',
      bgUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=1200&auto=format&fit=crop&q=60',
      tag: 'Comedy'
    }
  ];

  useEffect(() => {
    async function fetchHomeData() {
      if (!user) return;
      try {
        setLoading(true);
        // Fetch AI collections
        const resColl = await axios.get(`/api/ai/collections?city=${preferredCity}`, {
          headers: { 'x-user-id': user.id }
        });
        setCollections(resColl.data);
        if (resColl.data.length > 0) {
          setActiveOccasion(resColl.data[0].occasion);
        }

        // Fetch standard event lists
        const resEvents = await axios.get(`/api/events?city=${preferredCity}`, {
          headers: { 'x-user-id': user.id }
        });
        setEvents(resEvents.data);
      } catch (err) {
        console.error('Failed to load home data:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeData();
  }, [user, preferredCity]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeCollection = collections.find(c => c.occasion === activeOccasion);

  // Traditional BMS sections logic
  const trendingEvents = events.filter(e => e.is_trending);
  const movies = events.filter(e => e.category_id === 'movies');
  const standup = events.filter(e => e.category_id === 'comedy');
  const concerts = events.filter(e => e.category_id === 'concerts');
  const sports = events.filter(e => e.category_id === 'sports');
  const plays = events.filter(e => e.category_id === 'plays');
  const activities = events.filter(e => e.category_id === 'activities');

  return (
    <div className="pb-16 bg-[#0B0C0E]">
      
      {/* Hero Carousel Banner */}
      <div className="relative h-64 md:h-[400px] overflow-hidden bg-black">
        {carouselSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C0E] via-[#0B0C0E]/50 to-transparent z-10" />
            <img
              src={slide.bgUrl}
              alt={slide.title}
              className="w-full h-full object-cover object-center opacity-85"
            />
            <div className="absolute inset-y-0 left-0 max-w-6xl mx-auto px-6 md:px-12 flex flex-col justify-center z-20 text-white">
              <span className="bg-brand text-[10px] md:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded w-fit mb-3">
                {slide.tag}
              </span>
              <h2 className="text-2xl md:text-5xl font-black max-w-xl leading-tight">
                {slide.title}
              </h2>
              <p className="text-gray-300 text-xs md:text-base mt-2 max-w-md">
                {slide.subtitle}
              </p>
              <Link
                to="/search"
                className="mt-6 bg-brand hover:bg-brand-dark text-white font-bold text-xs md:text-sm px-6 py-2.5 rounded shadow-lg w-fit transition-transform hover:scale-[1.02]"
              >
                Discover Events
              </Link>
            </div>
          </div>
        ))}

        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 z-20">
          {carouselSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentSlide ? 'bg-brand w-5' : 'bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 mt-8 md:mt-12 space-y-16">
        
        {/* Category Navbar Shortcuts */}
        <section className="bg-[#15171B] border border-gray-800 rounded-xl p-4 md:p-6 grid grid-cols-3 sm:grid-cols-6 gap-4 text-center shadow-lg">
          <Link to="/movies" className="flex flex-col items-center gap-2 text-gray-300 hover:text-brand transition-colors">
            <div className="p-3 bg-brand/10 rounded-full"><Film className="w-5 h-5 text-brand" /></div>
            <span className="text-xs font-bold">Movies</span>
          </Link>
          <Link to="/comedy" className="flex flex-col items-center gap-2 text-gray-300 hover:text-brand transition-colors">
            <div className="p-3 bg-amber-500/10 rounded-full"><Laugh className="w-5 h-5 text-amber-500" /></div>
            <span className="text-xs font-bold">Standup</span>
          </Link>
          <Link to="/concerts" className="flex flex-col items-center gap-2 text-gray-300 hover:text-brand transition-colors">
            <div className="p-3 bg-sky-500/10 rounded-full"><Music className="w-5 h-5 text-sky-500" /></div>
            <span className="text-xs font-bold">Concerts</span>
          </Link>
          <Link to="/plays" className="flex flex-col items-center gap-2 text-gray-300 hover:text-brand transition-colors">
            <div className="p-3 bg-rose-500/10 rounded-full"><Film className="w-5 h-5 text-rose-500" /></div>
            <span className="text-xs font-bold">Plays</span>
          </Link>
          <Link to="/sports" className="flex flex-col items-center gap-2 text-gray-300 hover:text-brand transition-colors">
            <div className="p-3 bg-emerald-500/10 rounded-full"><Trophy className="w-5 h-5 text-emerald-500" /></div>
            <span className="text-xs font-bold">Sports</span>
          </Link>
          <Link to="/activities" className="flex flex-col items-center gap-2 text-gray-300 hover:text-brand transition-colors">
            <div className="p-3 bg-purple-500/10 rounded-full"><Sparkles className="w-5 h-5 text-purple-500" /></div>
            <span className="text-xs font-bold">Activities</span>
          </Link>
        </section>

        {/* FEATURE 1: AI Occasion-based discovery hubs (Slide / Click layout) */}
        <section className="space-y-6">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-lg md:text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-brand animate-pulse" />
              Explore by Occasion
            </h3>
            <p className="text-xs text-gray-400 mt-1">Select an occasion to reveal personalized matches powered by Gemini AI.</p>
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-32 h-20 md:w-36 md:h-24 bg-gray-800 rounded-xl animate-pulse flex-shrink-0" />
                ))}
              </div>
              <RowSkeleton count={4} />
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-10 bg-[#15171B] border border-gray-800 rounded-xl text-gray-400 text-xs">
              No active events found in this city. Select another location in the navbar.
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Horizontal Slider / Click tiles for Occasions */}
              <div className="flex gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar custom-scrollbar scroll-smooth">
                {collections.map(coll => {
                  const details = occasionDetailsMap[coll.occasion] || { gradient: 'from-gray-800 to-gray-900', border: 'border-gray-800', text: 'text-gray-400', icon: 'Sparkles' };
                  const active = activeOccasion === coll.occasion;

                  return (
                    <button
                      key={coll.occasion}
                      onClick={() => setActiveOccasion(coll.occasion)}
                      className={`w-32 h-20 md:w-36 md:h-24 flex-shrink-0 rounded-xl border relative overflow-hidden flex flex-col justify-between p-3 cursor-pointer shadow-md select-none transition-all duration-300 scale-[0.98] ${
                        active
                          ? `bg-gradient-to-br ${details.gradient} border-brand shadow-lg shadow-brand/10 scale-100`
                          : 'bg-[#15171B]/50 hover:bg-[#15171B]/95 border-gray-800/80 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className={`p-1.5 rounded-lg ${active ? 'bg-white/10 text-white' : `${details.bgClass || 'bg-gray-800 text-gray-400'}`}`}>
                          <IconComponent name={details.icon} className="w-4 h-4" />
                        </div>
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
                        )}
                      </div>
                      <span className={`text-[10px] md:text-xs font-black text-left block leading-tight ${active ? 'text-white' : 'text-gray-300'}`}>
                        {coll.occasion}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Reveal details row below clicked tile */}
              {activeCollection && (
                <div className="ai-glow-card rounded-xl p-5 md:p-6 space-y-6 border border-brand/20 bg-[#161114]/40 fade-in">
                  
                  {/* Occasion detail banner info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/60 pb-4">
                    <div>
                      <h4 className="text-md md:text-lg font-black text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-brand" />
                        Personalized Occasion: {activeCollection.occasion}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">{activeCollection.description}</p>
                    </div>
                    <Link
                      to={`/search?q=${encodeURIComponent(activeCollection.occasion)}`}
                      className="text-xs text-brand hover:text-brand-light font-bold flex items-center gap-0.5 whitespace-nowrap self-end sm:self-center"
                    >
                      View All
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Dynamic grid display of the events in the selected Occasion */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {activeCollection.events.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>

                </div>
              )}

            </div>
          )}
        </section>

        {/* Familiar stacked BookMyShow shelves below the Hub */}
        <div className="space-y-12">
          
          {/* Trending Row */}
          {trendingEvents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h3 className="text-md md:text-lg font-extrabold text-[#F5F5F7] flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500 animate-pulse" />
                  Trending Near You
                </h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar custom-scrollbar">
                {trendingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Movies Section */}
          {movies.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h3 className="text-md md:text-lg font-extrabold text-[#F5F5F7]">Recommended Movies</h3>
                <Link to="/movies" className="text-xs text-brand font-bold hover:underline flex items-center">View All <ArrowRight className="w-3 h-3 ml-0.5" /></Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar custom-scrollbar">
                {movies.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Standup Comedy */}
          {standup.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h3 className="text-md md:text-lg font-extrabold text-[#F5F5F7]">Comedy Gigs & Shows</h3>
                <Link to="/comedy" className="text-xs text-brand font-bold hover:underline flex items-center">View All <ArrowRight className="w-3 h-3 ml-0.5" /></Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar custom-scrollbar">
                {standup.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Concerts */}
          {concerts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h3 className="text-md md:text-lg font-extrabold text-[#F5F5F7]">Live Concerts & Festivals</h3>
                <Link to="/concerts" className="text-xs text-brand font-bold hover:underline flex items-center">View All <ArrowRight className="w-3 h-3 ml-0.5" /></Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar custom-scrollbar">
                {concerts.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Plays */}
          {plays.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h3 className="text-md md:text-lg font-extrabold text-[#F5F5F7]">Theatre & Plays</h3>
                <Link to="/plays" className="text-xs text-brand font-bold hover:underline flex items-center">View All <ArrowRight className="w-3 h-3 ml-0.5" /></Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar custom-scrollbar">
                {plays.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Sports */}
          {sports.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h3 className="text-md md:text-lg font-extrabold text-[#F5F5F7]">Active Sports Matches</h3>
                <Link to="/sports" className="text-xs text-brand font-bold hover:underline flex items-center">View All <ArrowRight className="w-3 h-3 ml-0.5" /></Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar custom-scrollbar">
                {sports.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {activities.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h3 className="text-md md:text-lg font-extrabold text-[#F5F5F7]">Workshops & Activities</h3>
                <Link to="/activities" className="text-xs text-brand font-bold hover:underline flex items-center">View All <ArrowRight className="w-3 h-3 ml-0.5" /></Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar custom-scrollbar">
                {activities.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
