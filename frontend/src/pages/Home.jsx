import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Heart, Calendar, ArrowRight, Flame, Film, Laugh, Music, Trophy, Coins, Clock, Users, Home as HomeIcon, Moon, CloudRain, Gift, Baby, ChevronRight, Award, Percent } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { RowSkeleton } from '../components/SkeletonLoader';

const occasionDetailsMap = {
  'Weekend Plans': { icon: 'Calendar', gradient: 'from-[#10B981]/20 to-[#047857]/5' },
  'Date Night': { icon: 'Heart', gradient: 'from-[#F43F5E]/20 to-[#BE123C]/5' },
  'Family Time': { icon: 'Home', gradient: 'from-[#F97316]/20 to-[#C2410C]/5' },
  'Friends Night Out': { icon: 'Users', gradient: 'from-[#06B6D4]/20 to-[#0369A1]/5' },
  'Solo Escape': { icon: 'Sparkles', gradient: 'from-[#A855F7]/20 to-[#6B21A8]/5' },
  'Office Break': { icon: 'Moon', gradient: 'from-[#6366F1]/20 to-[#4338CA]/5' },
  'Live Music Tonight': { icon: 'Music', gradient: 'from-[#06B6D4]/20 to-[#0891B2]/5' },
  'Comedy Evening': { icon: 'Laugh', gradient: 'from-[#F59E0B]/20 to-[#B45309]/5' },
  'Budget Plans': { icon: 'Coins', gradient: 'from-[#14B8A6]/20 to-[#0F766E]/5' },
  'Luxury Experiences': { icon: 'Award', gradient: 'from-[#EC4899]/20 to-[#BE185D]/5' },
  'Rainy Day Picks': { icon: 'CloudRain', gradient: 'from-[#64748B]/20 to-[#334155]/5' },
  'Kids Activities': { icon: 'Baby', gradient: 'from-[#84CC16]/20 to-[#4D7C0F]/5' },
  'Sports Fan Picks': { icon: 'Trophy', gradient: 'from-[#EF4444]/20 to-[#B91C1C]/5' },
  'Romantic Evening': { icon: 'Heart', gradient: 'from-[#EC4899]/25 to-[#9D174D]/5' },
  'Festival Specials': { icon: 'Gift', gradient: 'from-[#F59E0B]/25 to-[#9A3412]/5' },
  'Trending Near You': { icon: 'Flame', gradient: 'from-[#EF4444]/20 to-[#B91C1C]/5' }
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
        
        {/* 2. SOLUTION 1: AI Occasion Collections (Horizontally Scrolling rows of Occasions) */}
        {loading ? (
          <div className="space-y-6">
            <div className="h-6 w-48 bg-gray-250 dark:bg-gray-800 rounded animate-pulse" />
            <RowSkeleton count={4} />
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-10 bg-[#15171B] border border-gray-850 rounded-xl text-gray-400 text-xs">
            No active events found in this city. Select another location in the navbar.
          </div>
        ) : (
          <section className="space-y-8">
            <div className="border-b border-gray-200 dark:border-gray-800 pb-3 flex justify-between items-end">
              <div>
                <h3 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 font-sans uppercase tracking-tight">
                  <Sparkles className="w-5 h-5 text-brand animate-pulse" />
                  AI Occasion Curation
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hyper-personalized curation shelves driven by your preferences.</p>
              </div>
            </div>

            {/* Horizontal rows for each active occasion */}
            <div className="space-y-12">
              {collections.slice(0, 5).map(collection => {
                const details = occasionDetailsMap[collection.occasion] || { icon: 'Sparkles', gradient: 'from-gray-800 to-gray-900' };
                return (
                  <div key={collection.occasion} className="space-y-4">
                    {/* Occasion Header */}
                    <div className="flex justify-between items-center bg-gray-100/50 dark:bg-brand/5 p-4 border border-gray-200/60 dark:border-brand/25 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-brand/10 text-brand">
                          <IconComponent name={details.icon} className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white font-sans">{collection.occasion}</h4>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">{collection.description}</p>
                        </div>
                      </div>
                      <Link 
                        to={`/occasion/${encodeURIComponent(collection.occasion)}`} 
                        className="text-brand text-xs font-bold hover:underline flex items-center gap-0.5 select-none"
                      >
                        See All <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Events list */}
                    <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar custom-scrollbar scroll-smooth">
                      {collection.events.map(event => (
                        <div key={event.id} className="flex flex-col space-y-2.5 bg-gray-50/50 dark:bg-[#15171B]/35 border border-gray-200 dark:border-gray-850 p-2 rounded-2xl relative group">
                          <EventCard event={event} />
                          {/* Match reason bubble */}
                          <div className="px-1 py-1 text-[9px] text-gray-500 dark:text-gray-400 italic flex items-start gap-1 leading-normal border-t border-gray-100 dark:border-gray-800/40 pt-2 w-44 md:w-52">
                            <Sparkles className="w-3 h-3 text-brand flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{event.aiReason || 'Highly matches your categories.'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
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
