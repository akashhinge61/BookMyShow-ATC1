import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Calendar, Clock, MapPin, XCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ImageWithFallback from '../components/ImageWithFallback';

export default function Bookings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookingsList = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await axios.get('/api/bookings', {
        headers: { 'x-user-id': user.id }
      });
      setUpcoming(res.data.upcoming || []);
      setHistory(res.data.history || []);
    } catch (err) {
      console.error('Failed to load bookings:', err.message);
      addToast('Error loading bookings history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsList();
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking? This action is irreversible.')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await axios.delete(`/api/bookings/${bookingId}`, {
        headers: { 'x-user-id': user.id }
      });
      addToast('Booking cancelled successfully', 'success');
      fetchBookingsList(); // refresh
    } catch (err) {
      console.error('Cancellation failed:', err.message);
      addToast('Failed to cancel booking', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  // Helper to format JS dates nicely
  const formatDate = (dateStr) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-IN', options);
  };

  const formattedPrice = (price) => {
    return Number(price).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  };

  if (!user) return null;

  return (
    <div className="bg-[#0B0C0E] min-h-screen text-white py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-10">
        
        {/* Header Title */}
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-xl md:text-3xl font-extrabold flex items-center gap-2">
            <Ticket className="w-7 h-7 text-brand" />
            My Bookings
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage and track your upcoming tickets and past orders.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-28 bg-[#15171B] border border-gray-800 rounded-xl animate-pulse" />
            <div className="h-28 bg-[#15171B] border border-gray-800 rounded-xl animate-pulse" />
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Upcoming Section */}
            <div className="space-y-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-gray-200 border-l-2 border-brand pl-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Upcoming Bookings
              </h3>

              {upcoming.length === 0 ? (
                <div className="text-center py-10 bg-[#15171B] border border-gray-800 rounded-xl text-gray-400 text-xs">
                  No upcoming bookings. Discover shows on the home page and start booking!
                </div>
              ) : (
                <div className="space-y-4">
                  {upcoming.map(ticket => (
                    <div 
                      key={ticket.id}
                      className="p-5 bg-[#15171B] border border-gray-800 hover:border-gray-700/60 rounded-xl flex flex-col md:flex-row gap-5 justify-between shadow-lg fade-in"
                    >
                      {/* Left: Info */}
                      <div className="flex gap-4 items-start">
                        {/* Event Thumbnail */}
                        {ticket.poster_url && (
                          <ImageWithFallback 
                            src={ticket.poster_url} 
                            alt={ticket.event_title} 
                            category={ticket.category_id}
                            title={ticket.event_title}
                            type="poster"
                            className="w-14 h-20 object-cover rounded shadow border border-gray-800 flex-shrink-0"
                          />
                        )}
                        <div className="space-y-1 text-xs">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">Booking Reference: {ticket.booking_reference}</span>
                          <h4 className="text-sm font-bold text-white leading-snug">{ticket.event_title}</h4>
                          
                          <div className="flex flex-wrap items-center gap-3 text-gray-400 pt-1.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-brand" />
                              {formatDate(ticket.event_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-brand" />
                              {ticket.event_time}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-gray-400 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-brand" />
                            <span className="truncate max-w-[250px]">{ticket.venue_name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Pricing & Actions */}
                      <div className="flex flex-row md:flex-col justify-between md:items-end gap-3 border-t md:border-t-0 border-gray-800 pt-3 md:pt-0">
                        <div className="text-left md:text-right text-xs">
                          <span className="text-gray-500 font-bold block">Seats Selected:</span>
                          <span className="text-white font-bold block pt-0.5">
                            {ticket.seats ? ticket.seats.join(', ') : 'N/A'}
                          </span>
                          <span className="text-brand font-black block pt-1 text-sm">{formattedPrice(ticket.total_price)}</span>
                        </div>

                        <button
                          onClick={() => handleCancelBooking(ticket.id)}
                          disabled={cancellingId === ticket.id}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 font-bold border border-red-950 bg-red-950/20 px-3.5 py-1.5 rounded-lg hover:bg-red-950/40 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History Section */}
            <div className="space-y-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-gray-200 border-l-2 border-brand pl-2.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-500" />
                Booking History
              </h3>

              {history.length === 0 ? (
                <div className="text-center py-6 bg-[#15171B]/55 border border-gray-800/80 rounded-xl text-gray-500 text-xs">
                  No past bookings.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map(ticket => (
                    <div 
                      key={ticket.id}
                      className="p-4 bg-[#15171B]/50 border border-gray-850/80 rounded-lg flex items-center justify-between text-xs text-gray-400 gap-4"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-gray-200">{ticket.event_title}</h4>
                        <p className="text-[10px] text-gray-500">Ref: {ticket.booking_reference} | Date: {formatDate(ticket.event_date)} | {ticket.event_time}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold block text-gray-300">{formattedPrice(ticket.total_price)}</span>
                        <span className={`text-[10px] font-bold block pt-0.5 capitalize ${ticket.status === 'cancelled' ? 'text-red-500' : 'text-gray-500'}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
