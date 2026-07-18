import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Sparkles, Clock, MapPin, Globe, Calendar, GitCompare, Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';
import { DetailSkeleton } from '../components/SkeletonLoader';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCompare, isComparing, removeFromCompare } = useCompare();
  const { setBookingDetails } = useBooking();
  const { addToast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Selected date & showtime states for checkout mapping
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const comparing = event ? isComparing(event.id) : false;

  useEffect(() => {
    async function fetchEventDetails() {
      if (!user) return;
      try {
        setLoading(true);
        const res = await axios.get(`/api/events/${id}`, {
          headers: { 'x-user-id': user.id }
        });
        setEvent(res.data);
        
        // Auto set default show date & showtime
        if (res.data.event_date) {
          const dateStr = typeof res.data.event_date === 'string' 
            ? res.data.event_date.split('T')[0]
            : new Date(res.data.event_date).toISOString().split('T')[0];
          setSelectedDate(dateStr);
        }
        if (res.data.event_time) {
          setSelectedTime(res.data.event_time);
        }

        // Check if event is bookmarked/saved
        const savedRes = await axios.get('/api/user/saved', {
          headers: { 'x-user-id': user.id }
        });
        setIsSaved(savedRes.data.some(e => e.id === Number(id)));
      } catch (err) {
        console.error('Failed to load event details:', err.message);
        addToast('Error loading event details', 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchEventDetails();
  }, [id, user]);

  const handleSaveToggle = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const res = await axios.post('/api/user/saved', { eventId: event.id }, {
        headers: { 'x-user-id': user.id }
      });
      setIsSaved(res.data.saved);
      addToast(res.data.message, 'success');
    } catch (err) {
      console.error('Failed to save event:', err.message);
      addToast('Failed to bookmark event', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCompareToggle = () => {
    if (comparing) {
      removeFromCompare(event.id);
    } else {
      addToCompare(event);
    }
  };

  const handleBookNow = () => {
    if (!selectedDate || !selectedTime) {
      addToast('Please select a valid date and showtime slot.', 'error');
      return;
    }
    // Set checkout parameters in BookingContext
    setBookingDetails(event, selectedDate, selectedTime);
    navigate('/checkout');
  };

  if (loading) return <DetailSkeleton />;
  if (!event) return (
    <div className="text-center py-20 bg-[#0B0C0E]">
      <h3 className="text-xl font-bold text-white">Event not found</h3>
      <button onClick={() => navigate('/')} className="mt-4 bg-brand text-white px-4 py-2 rounded">
        Back to Home
      </button>
    </div>
  );

  const formattedPrice = Number(event.price).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  return (
    <div className="bg-[#0B0C0E] text-white pb-20">
      
      {/* Visual Banner Backdrop (Blurred hero style) */}
      <div className="relative h-64 md:h-[380px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0E] via-[#0B0C0E]/70 to-black/35 z-10" />
        <img
          src={event.banner_url || event.poster_url}
          alt={event.title}
          className="w-full h-full object-cover object-center filter blur-sm scale-105 opacity-40"
        />
        
        {/* Real Content overlay */}
        <div className="absolute inset-0 max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-end gap-6 z-20 pb-6 md:pb-8">
          {/* Floating Poster */}
          <div className="w-36 md:w-56 h-52 md:h-80 rounded-xl overflow-hidden shadow-2xl border border-gray-800 flex-shrink-0 hidden sm:block">
            <img src={event.poster_url} alt={event.title} className="w-full h-full object-cover" />
          </div>

          {/* Details Row */}
          <div className="flex-1 space-y-3">
            <h1 className="text-xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {event.title}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-4 py-1.5 px-3 bg-white/5 border border-white/10 rounded-lg w-fit">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold">{Number(event.rating).toFixed(1)}/10</span>
              </div>
              <span className="text-xs text-gray-400">({event.rating_count.toLocaleString()} votes)</span>
            </div>

            {/* Event Specs Tags */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-300">
              <span className="bg-gray-800 px-2.5 py-1 rounded text-[11px] font-bold text-gray-400 uppercase">
                {event.category_id}
              </span>
              <span className="bg-gray-800 px-2.5 py-1 rounded text-[11px] text-gray-300">
                {event.genre}
              </span>
              <span className="flex items-center gap-1 bg-gray-800/50 px-2.5 py-1 rounded">
                <Clock className="w-3.5 h-3.5" />
                {event.duration_mins} mins
              </span>
              <span className="flex items-center gap-1 bg-gray-800/50 px-2.5 py-1 rounded">
                <Globe className="w-3.5 h-3.5" />
                {event.language}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details, Cast, Venue */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI personalization overlap explanation */}
          {event.aiReason && (
            <div className="p-5 rounded-xl border border-brand/20 bg-gradient-to-br from-brand/10 to-[#161114] space-y-2.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full filter blur-xl" />
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand animate-pulse" />
                AI Discovery Explanation
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed italic">
                "{event.aiReason}"
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-base font-bold uppercase tracking-wider text-gray-200 border-l-2 border-brand pl-2.5">
              About the Event
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Cast/Artists (Circular scroll row) */}
          {event.cast && event.cast.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-gray-200 border-l-2 border-brand pl-2.5">
                Cast & Crew
              </h3>
              <div className="flex gap-6 overflow-x-auto pb-2 no-scrollbar">
                {event.cast.map((actor, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center space-y-1.5 flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-gray-400 uppercase shadow-md">
                      {actor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-[11px] font-semibold text-white block max-w-[80px] truncate">{actor.name}</span>
                    <span className="text-[9px] text-gray-500 block max-w-[80px] truncate">{actor.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Venue & Location coords */}
          <div className="space-y-4">
            <h3 className="text-base font-bold uppercase tracking-wider text-gray-200 border-l-2 border-brand pl-2.5">
              Venue
            </h3>
            <div className="p-4 bg-[#15171B] border border-gray-800 rounded-xl flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold text-white">{event.venue_name}</h5>
                <p className="text-xs text-gray-400 mt-0.5">City: {event.venue_city}</p>
                <p className="text-[10px] text-gray-500 mt-2">Map coordinates: Lat 18.920, Lng 72.825 (Mock Location)</p>
              </div>
            </div>
          </div>

          {/* Reviews list */}
          {event.reviews && event.reviews.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-gray-200 border-l-2 border-brand pl-2.5">
                User Reviews
              </h3>
              <div className="space-y-3">
                {event.reviews.map((rev, idx) => (
                  <div key={idx} className="p-4 bg-[#15171B]/55 border border-gray-800/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-200">{rev.user}</span>
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-400/5 px-2 py-0.5 border border-amber-400/10 rounded">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {rev.rating}/10
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-normal italic">
                      "{rev.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Checkout Slot Pickers & Compare Toggles */}
        <div className="space-y-6">
          
          <div className="bg-[#15171B] border border-gray-800 p-5 rounded-xl space-y-6 shadow-xl sticky top-24">
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500">Ticket Price</span>
                <h4 className="text-2xl font-black text-brand">{formattedPrice}</h4>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">
                Available
              </span>
            </div>

            {/* Show Booking Calendar Slot Selection */}
            <div className="space-y-2.5">
              <label className="text-[11px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Select Date
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#202227] text-xs text-gray-200 rounded-lg p-2.5 border border-gray-800 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer font-semibold"
              >
                <option value={selectedDate}>{new Date(selectedDate || Date.now()).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</option>
                <option value={new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0]}>
                  {new Date(Date.now() + 86400000 * 8).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} (Alternate Slot)
                </option>
              </select>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] uppercase font-bold text-gray-400 flex items-center gap-1 font-sans">
                <Clock className="w-3.5 h-3.5" /> Showtime
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {['13:00', '16:30', '19:00', '21:30'].map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`text-xs py-2 rounded-lg font-bold border transition-all ${
                      selectedTime === time
                        ? 'bg-brand text-white border-brand shadow-lg shadow-brand/10'
                        : 'bg-[#202227] text-gray-300 border-gray-800 hover:bg-gray-800'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Booking Call-To-Action */}
            <button
              onClick={handleBookNow}
              className="w-full bg-brand hover:bg-brand-dark text-white font-bold text-sm py-3 rounded-lg shadow-lg hover:shadow-brand/20 transition-all scale-[1.01] hover:scale-[1.02]"
            >
              Book Tickets
            </button>

            {/* Secondary actions: Save / Compare */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleSaveToggle}
                disabled={saving}
                className="flex items-center justify-center gap-1.5 text-xs bg-gray-800/40 hover:bg-gray-800 text-gray-300 hover:text-white py-2 rounded-lg border border-gray-800/80 transition-colors"
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-brand" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Save Event</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCompareToggle}
                className={`flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border transition-all ${
                  comparing
                    ? 'bg-brand/15 border-brand/50 text-brand font-bold'
                    : 'bg-gray-800/40 hover:bg-gray-800 text-gray-300 hover:text-white border-gray-800/80'
                }`}
              >
                <GitCompare className="w-4 h-4" />
                <span>Compare</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
