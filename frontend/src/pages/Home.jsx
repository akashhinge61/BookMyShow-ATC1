import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Heart, Calendar, ArrowRight, Flame, Film, Laugh, Music, Trophy, Coins, Clock, Users, Home as HomeIcon, Moon, CloudRain, Gift, Baby, ChevronRight, Award, Percent, MapPin } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { RowSkeleton } from '../components/SkeletonLoader';

const occasionDetailsMap = {
  'Weekend Plans': { icon: 'Calendar', bgClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  'Date Night': { icon: 'Heart', bgClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  'Family Time': { icon: 'Home', bgClass: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  'Friends Night Out': { icon: 'Users', bgClass: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  'Solo Escape': { icon: 'Sparkles', bgClass: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  'Office Break': { icon: 'Moon', bgClass: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  'Live Music Tonight': { icon: 'Music', bgClass: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
  'Comedy Evening': { icon: 'Laugh', bgClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  'Budget Plans': { icon: 'Coins', bgClass: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20' },
  'Luxury Experiences': { icon: 'Award', bgClass: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
  'Rainy Day Picks': { icon: 'CloudRain', bgClass: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
  'Kids Activities': { icon: 'Baby', bgClass: 'bg-lime-500/10 text-lime-500 border-lime-500/20' },
  'Sports Fan Picks': { icon: 'Trophy', bgClass: 'bg-red-500/10 text-red-500 border-red-500/20' },
  'Romantic Evening': { icon: 'Heart', bgClass: 'bg-pink-600/10 text-pink-600 border-pink-600/20' },
  'Festival Specials': { icon: 'Gift', bgClass: 'bg-amber-600/10 text-amber-600 border-amber-600/20' },
  'Trending Near You': { icon: 'Flame', bgClass: 'bg-red-600/10 text-red-600 border-red-600/20' }
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
    case 'Trophy': return <Trophy className={className} />;
    case 'Award': return <Award className={className} />;
    default: return <Sparkles className={className} />;
  }
};

export default function Home() {
  const { user } = useAuth();
  const { preferredCity, preferences } = usePreferences();
  
  const [collections, setCollections] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCollection, setActiveCollection] = useState(null);

  const carouselSlides = [
    {
      id: 6,
      title: 'Diljit Dosanjh: Dil-Luminati India Tour',
      subtitle: 'Experience the magic of Punjabi Pop live in massive stadium scales!',
      bgUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
      tag: 'Concert'
    },
    {
      id: 8,
      title: 'IPL: RCB vs Mumbai Indians',
      subtitle: 'The ultimate T20 cricket clash at the Wankhede Stadium!',
      bgUrl: 'https://images.unsplash.com/photo-1540747737956-3787233e5ad0?w=1200&auto=format&fit=crop&q=80',
      tag: 'Sports'
    },
    {
      id: 4,
      title: 'Kalki 2898 AD: The IMAX 3D Experience',
      subtitle: 'Witness the mythological sci-fi epic on the grandest screens.',
      bgUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
      tag: 'Movie'
    }
  ];

  const mockOffers = [
    { id: 1, title: 'BOGO Offer', desc: 'Buy 1 Get 1 Free on movie tickets using IDFC FIRST Cards', code: 'IDFCBOGO', color: 'from-[#A855F7]/30 to-[#6B21A8]/20' },
    { id: 2, title: 'Axis Bank Blockbuster', desc: 'Flat 20% off on all tickets up to ₹200 on Axis Neo Cards', code: 'AXISNEO20', color: 'from-[#EF4444]/30 to-[#B91C1C]/20' },
    { id: 3, title: 'GPay Weekly Special', desc: 'Get cashback up to ₹150 using UPI GPay transactions', code: 'GPAYSHOW', color: 'from-[#10B981]/30 to-[#047857]/20' }
  ];

  const mockVenues = [
    { name: 'Nita Mukesh Ambani Cultural Centre (NMACC)', area: 'Bandra Kurla Complex', tag: 'Premium Plays & Musicals' },
    { name: 'Prithvi Theatre', area: 'Juhu, Vile Parle', tag: 'Classic Art & Drama' },
    { name: 'Wankhede Cricket Stadium', area: 'Churchgate', tag: 'IPL Matches & Sports' },
    { name: 'DY Patil Stadium', area: 'Nerul, Navi Mumbai', tag: 'Stadium Pop Concerts' },
    { name: 'Bal Gandharva Rang Mandir', area: 'Bandra West', tag: 'Comedy Shows & Plays' }
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

        // Auto-select first collection on load
        if (resColl.data.length > 0) {
          setActiveCollection(resColl.data[0]);
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

  // Auto carousel rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Sync activeCollection whenpreferredCity changes and triggers reload
  useEffect(() => {
    if (collections.length > 0) {
      setActiveCollection(collections[0]);
    }
  }, [collections]);

  // Filter lists
  const trendingEvents = events.filter(e => e.is_trending);
  
  // Curated lists based on preferences
  const favCategories = preferences.favorite_categories || [];
  const recommendedMovies = events.filter(e => 
    e.category_id === 'movies' && (favCategories.includes('movies') || e.rating >= 8.5)
  );

  const movies = events.filter(e => e.category_id === 'movies');
  const comedy = events.filter(e => e.category_id === 'comedy');
  const concerts = events.filter(e => e.category_id === 'concerts');
  const sports = events.filter(e => e.category_id === 'sports');
  const activities = events.filter(e => e.category_id === 'activities');
  const plays = events.filter(e => e.category_id === 'plays');

  const liveEvents = [...concerts, ...plays, ...activities].slice(0, 10);
  
  const recommendedForYou = events.filter(e => {
    const matchesCategory = favCategories.includes(e.category_id);
    const matchesBudget = Number(e.price) <= (preferences.budget_preference || 1000);
    return matchesCategory && matchesBudget;
  }).slice(0, 10);

  const comingSoon = events.filter(e => {
    // Mocking coming soon by slicing late events
    return e.id % 2 === 0;
  }).slice(0, 8);

  return (
    <div className="pb-20 bg-white dark:bg-[#0B0C0E] text-gray-900 dark:text-[#F5F5F7] transition-colors duration-200">
      
      {/* 1. Hero Carousel Banner */}
      <div className="relative h-64 md:h-[420px] overflow-hidden bg-black select-none">
        {carouselSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-10" />
            <img
              src={slide.bgUrl}
              alt={slide.title}
              className="w-full h-full object-cover object-center opacity-85"
            />
            <div className="absolute inset-y-0 left-0 max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-center z-20 text-white">
              <span className="bg-brand text-[10px] md:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded w-fit mb-3">
                {slide.tag}
              </span>
              <h2 className="text-2xl md:text-5xl font-black max-w-xl leading-tight font-sans">
                {slide.title}
              </h2>
              <p className="text-gray-300 text-xs md:text-base mt-2 max-w-md">
                {slide.subtitle}
              </p>
              <Link
                to="/search"
                className="mt-6 bg-brand hover:bg-brand-dark text-white font-bold text-xs md:text-sm px-6 py-3 rounded-lg shadow-lg w-fit transition-transform hover:scale-[1.02] active:scale-95"
              >
                Discover Events
              </Link>
            </div>
          </div>
        ))}

        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2.5 z-20">
          {carouselSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentSlide ? 'bg-brand w-6' : 'bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Layout Container */}
      <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-12 space-y-16">
        
        {/* 2. SOLUTION 1: AI Occasion Selection Hub */}
        {loading ? (
          <div className="space-y-6">
            <div className="h-6 w-48 bg-gray-250 dark:bg-gray-800 rounded animate-pulse" />
            <RowSkeleton count={4} />
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-[#15171B] border border-gray-200 dark:border-gray-850 rounded-xl text-gray-400 text-xs">
            No active events found in this city. Select another location in the navbar.
          </div>
        ) : (
          <section className="space-y-8 bg-gray-50/50 dark:bg-[#121316]/20 p-5 rounded-2xl border border-gray-200/60 dark:border-gray-850/60 shadow-inner">
            <div className="pb-2 flex justify-between items-end border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="text-md md:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 font-sans uppercase tracking-tight">
                  <Sparkles className="w-5 h-5 text-brand animate-pulse" />
                  AI Personalization Hub
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select an occasion category below to preview your top-curated recommendations.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Option Selector Grid of Occasion Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {collections.map(coll => {
                  const active = activeCollection?.occasion === coll.occasion;
                  const details = occasionDetailsMap[coll.occasion] || { icon: 'Sparkles', bgClass: 'bg-gray-800 text-gray-400 border-gray-700' };
                  return (
                    <button
                      key={coll.occasion}
                      onClick={() => setActiveCollection(coll)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center gap-2.5 transition-all select-none hover:scale-[1.03] duration-250 cursor-pointer ${
                        active
                          ? 'bg-brand/10 border-brand text-brand shadow-lg shadow-brand/5 scale-[1.02]'
                          : 'bg-white dark:bg-[#15171B] border-gray-200 dark:border-gray-850 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className={`p-1.5 rounded-lg border ${active ? 'bg-brand/20 border-brand/30 text-brand' : `${details.bgClass}`}`}>
                          <IconComponent name={details.icon} className="w-4 h-4" />
                        </div>
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse mt-1.5" />
                        )}
                      </div>
                      <span className="text-[10px] font-black leading-tight text-left block w-full mt-1.5 truncate">
                        {coll.occasion}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Reveal details card below selection */}
              {activeCollection && (
                <div className="bg-white dark:bg-[#15171B]/35 rounded-2xl p-5 md:p-6 space-y-6 border border-gray-200 dark:border-gray-850 shadow-md animate-fade-in">
                  
                  {/* Occasion details banner header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800/80 pb-4">
                    <div>
                      <h4 className="text-sm md:text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand animate-pulse" />
                        Personalized Occasion: {activeCollection.occasion}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-semibold">{activeCollection.description}</p>
                    </div>
                    <Link
                      to={`/occasion/${encodeURIComponent(activeCollection.occasion)}`}
                      className="text-xs text-brand hover:text-brand-dark font-extrabold flex items-center gap-0.5 whitespace-nowrap self-end sm:self-center bg-brand/10 border border-brand/20 rounded-lg px-3 py-1.5"
                    >
                      See All Matches
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Curated matched events display row */}
                  <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar custom-scrollbar scroll-smooth">
                    {activeCollection.events.map(event => (
                      <div key={event.id} className="flex flex-col space-y-2.5 bg-gray-50/50 dark:bg-[#1C1E22]/35 border border-gray-250 dark:border-gray-850 p-2 rounded-2xl relative group">
                        <EventCard event={event} />
                        {/* Match reason bubble */}
                        <div className="px-1 py-1 text-[9px] text-gray-500 dark:text-gray-400 italic flex items-start gap-1 leading-normal border-t border-gray-150 dark:border-gray-800/40 pt-2 w-44 md:w-52 select-none">
                          <Sparkles className="w-3 h-3 text-brand flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{event.aiReason || 'Highly matches your categories.'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>
          </section>
        )}

        {/* 3. Trending Movies */}
        {movies.length > 0 && trendingEvents.filter(e => e.category_id === 'movies').length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-bold font-sans">Trending Movies</h3>
              <Link to="/movies" className="text-brand text-xs font-semibold hover:underline">See All</Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar custom-scrollbar">
              {trendingEvents.filter(e => e.category_id === 'movies').map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Recommended Movies */}
        {recommendedMovies.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg md:text-xl font-bold font-sans">Recommended Movies</h3>
                <Sparkles className="w-4 h-4 text-brand" />
              </div>
              <Link to="/movies" className="text-brand text-xs font-semibold hover:underline">See All</Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar custom-scrollbar">
              {recommendedMovies.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* 5. Live Events */}
        {liveEvents.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-bold font-sans">Live Events Nearby</h3>
              <span className="text-gray-400 text-xs font-semibold">Concerts, Plays, Workshops</span>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar custom-scrollbar">
              {liveEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* 6. Comedy Shows */}
        {comedy.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-bold font-sans">Laughter Therapy: Comedy Shows</h3>
              <Link to="/comedy" className="text-brand text-xs font-semibold hover:underline">See All</Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar custom-scrollbar">
              {comedy.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* 7. Concerts */}
        {concerts.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-bold font-sans">Music Festivals & Concerts</h3>
              <Link to="/concerts" className="text-brand text-xs font-semibold hover:underline">See All</Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar custom-scrollbar">
              {concerts.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* 8. Sports */}
        {sports.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-bold font-sans">Live Matches & Sports Tournaments</h3>
              <Link to="/sports" className="text-brand text-xs font-semibold hover:underline">See All</Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar custom-scrollbar">
              {sports.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* 9. Activities */}
        {activities.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-bold font-sans">Workshops & Outdoor Activities</h3>
              <Link to="/activities" className="text-brand text-xs font-semibold hover:underline">See All</Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar custom-scrollbar">
              {activities.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* 10. Plays */}
        {plays.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-bold font-sans">Theatre Plays & Stage Drama</h3>
              <Link to="/plays" className="text-brand text-xs font-semibold hover:underline">See All</Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar custom-scrollbar">
              {plays.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* 11. Recommended For You */}
        {recommendedForYou.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg md:text-xl font-bold font-sans">Recommended For You</h3>
                <Sparkles className="w-4 h-4 text-brand" />
              </div>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar custom-scrollbar">
              {recommendedForYou.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* 12. Offers Row */}
        <section className="space-y-4">
          <h3 className="text-lg md:text-xl font-bold font-sans">Exciting Offers & Discounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockOffers.map(offer => (
              <div
                key={offer.id}
                className={`p-5 rounded-2xl border border-gray-200 dark:border-gray-800/80 bg-gradient-to-br ${offer.color} flex flex-col justify-between h-36`}
              >
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black text-brand flex items-center gap-1">
                    <Percent className="w-3 h-3" /> {offer.title}
                  </span>
                  <h4 className="text-xs font-bold font-sans leading-normal text-gray-850 dark:text-gray-200">{offer.desc}</h4>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-gray-500 font-black">CODE: {offer.code}</span>
                  <button className="text-[10px] font-black text-brand uppercase tracking-wider hover:underline">
                    Claim Offer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 13. Coming Soon */}
        {comingSoon.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-lg md:text-xl font-bold font-sans">Coming Soon</h3>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar custom-scrollbar">
              {comingSoon.map(event => (
                <div key={event.id} className="relative filter grayscale hover:grayscale-0 transition-all duration-300">
                  <EventCard event={event} />
                  <div className="absolute inset-0 bg-black/45 pointer-events-none rounded-xl flex items-center justify-center">
                    <span className="bg-black/85 text-[10px] font-bold text-white px-2 py-1 rounded">COMING SOON</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 14. Popular Venues */}
        <section className="space-y-4 pb-10">
          <h3 className="text-lg md:text-xl font-bold font-sans">Popular Venues in {preferredCity}</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar custom-scrollbar">
            {mockVenues.map((venue, idx) => (
              <div
                key={idx}
                className="w-64 bg-gray-50 dark:bg-[#15171B] border border-gray-200 dark:border-gray-800 p-5 rounded-2xl flex-shrink-0 shadow-md space-y-3"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-gray-900 dark:text-white line-clamp-1">{venue.name}</h4>
                  <p className="text-[10px] text-gray-450 dark:text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand" /> {venue.area}, {preferredCity}
                  </p>
                </div>
                <span className="inline-block text-[9px] bg-brand/10 text-brand border border-brand/20 rounded font-black px-2 py-0.5 uppercase">
                  {venue.tag}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
