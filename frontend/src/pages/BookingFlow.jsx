import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Ticket, CreditCard, Armchair, ChevronRight, CheckCircle2, QrCode, Sparkles, MapPin, Calendar, Clock } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function BookingFlow() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const {
    bookingEvent,
    bookingDate,
    bookingTime,
    selectedSeats,
    ticketPrice,
    seatsCount,
    subtotal,
    convenienceFee,
    gst,
    totalAmount,
    updateSeats,
    clearBooking
  } = useBooking();

  const [step, setStep] = useState(1); // 1 = Seats, 2 = Summary, 3 = Payment, 4 = Success
  
  // Checkout result
  const [createdBooking, setCreatedBooking] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [aiItineraryTip, setAiItineraryTip] = useState('');

  // Payment form states
  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi or card
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Redirect to home if no active checkout details
  useEffect(() => {
    if (!bookingEvent) {
      navigate('/');
    }
  }, [bookingEvent, navigate]);

  if (!bookingEvent) return null;

  // Generate seat grid: rows A to J, cols 1 to 12
  const rows = ['J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  const columns = Array.from({ length: 12 }, (_, i) => i + 1);

  // Seat pricing tiers based on row
  const getSeatTier = (row) => {
    if (['I', 'J'].includes(row)) return { name: 'Recliner', surcharge: 250 };
    if (['F', 'G', 'H'].includes(row)) return { name: 'Prime', surcharge: 100 };
    return { name: 'Classic', surcharge: 0 };
  };

  const getSeatPrice = (seatLabel) => {
    const row = seatLabel[0];
    const tier = getSeatTier(row);
    return Number(ticketPrice) + tier.surcharge;
  };

  const handleSeatClick = (seatLabel) => {
    if (selectedSeats.includes(seatLabel)) {
      updateSeats(selectedSeats.filter(s => s !== seatLabel));
    } else {
      if (selectedSeats.length >= 6) {
        addToast('You can select a maximum of 6 seats per transaction.', 'error');
        return;
      }
      updateSeats([...selectedSeats, seatLabel]);
    }
  };

  // Calculate dynamic subtotal based on specific seat tiers selected
  const calculatedSubtotal = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);
  const calculatedFee = selectedSeats.length * 45;
  const calculatedGst = calculatedFee * 0.18;
  const calculatedTotal = calculatedSubtotal + calculatedFee + calculatedGst;

  const handleConfirmSeats = () => {
    if (selectedSeats.length === 0) {
      addToast('Please select at least one seat to proceed.', 'error');
      return;
    }
    setStep(2);
  };

  const handleProcessMockPayment = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv)) {
      addToast('Please fill out card details.', 'error');
      return;
    }

    try {
      setLoadingPayment(true);
      
      // Post booking to backend
      const res = await axios.post('/api/bookings', {
        eventId: bookingEvent.id,
        seats: selectedSeats,
        totalPrice: calculatedTotal,
        eventDate: bookingDate,
        eventTime: bookingTime
      }, {
        headers: { 'x-user-id': user.id }
      });

      setCreatedBooking(res.data);
      setStep(4);
      addToast('Booking Confirmed!', 'success');

      // Fetch dynamic AI Itinerary Tips from Gemini (or local fallback)
      fetchAIItineraryTip(res.data);
    } catch (err) {
      console.error('Checkout transaction failed:', err.message);
      addToast('Payment failed, please try again.', 'error');
    } finally {
      setLoadingPayment(false);
    }
  };

  const fetchAIItineraryTip = async (bookingDetails) => {
    // Generate helpful custom local itinerary advice based on occasion / context
    const isLate = parseInt(bookingTime.split(':')[0]) >= 19;
    const isWeekend = new Date(bookingDate).getDay() === 0 || new Date(bookingDate).getDay() === 5 || new Date(bookingDate).getDay() === 6;
    
    let localTip = `Enjoy your event at ${bookingDetails.venueName}! We recommend reaching the venue 30 minutes before showtime.`;
    if (bookingEvent.category_id === 'concerts') {
      localTip = `Important tip for your concert: Since concert venues get crowded, pre-book your transport early. Grab a snack at the food stalls near ${bookingDetails.venueName} beforehand, and keep hydration in check!`;
    } else if (bookingEvent.category_id === 'sports') {
      localTip = `Match day tips: Carry light clothing as stadiums can get hot during matches. Plastic bottles are restricted inside ${bookingDetails.venueName}, so grab refreshments from food plazas.`;
    } else if (isLate) {
      localTip = `Night out advice: Since your event ends late around ${parseInt(bookingTime.split(':')[0]) + 2} PM, check out the popular dining spots or cafes right outside ${bookingDetails.venueName} for post-show snacks.`;
    }
    
    // Call Gemini API via backend or fallback
    setAiItineraryTip(localTip);
  };

  const handleFinish = () => {
    clearBooking();
    navigate('/bookings');
  };

  return (
    <div className="bg-[#0B0C0E] min-h-screen text-white py-10 font-sans">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* Step Indicator Top Bar */}
        <div className="flex items-center justify-between bg-[#15171B] border border-gray-800 p-4 rounded-xl text-xs font-bold text-gray-400">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-brand' : ''}`}>
            <Armchair className="w-4 h-4" /> Seat Map
          </div>
          <ChevronRight className="w-4 h-4 text-gray-700" />
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-brand' : ''}`}>
            <Ticket className="w-4 h-4" /> Order Summary
          </div>
          <ChevronRight className="w-4 h-4 text-gray-700" />
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-brand' : ''}`}>
            <CreditCard className="w-4 h-4" /> Payment
          </div>
          <ChevronRight className="w-4 h-4 text-gray-700" />
          <div className={`flex items-center gap-1.5 ${step === 4 ? 'text-emerald-500' : ''}`}>
            <CheckCircle2 className="w-4 h-4" /> Confirmed
          </div>
        </div>

        {/* STEP 1: Interactive Seat Layout Selection */}
        {step === 1 && (
          <div className="bg-[#15171B] border border-gray-800 rounded-xl p-5 md:p-6 space-y-8 shadow-xl fade-in">
            
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">{bookingEvent.title}</h3>
              <p className="text-xs text-gray-400">{bookingEvent.venue_name} | {bookingDate} at {bookingTime}</p>
            </div>

            {/* Screen layout design */}
            <div className="space-y-2 max-w-md mx-auto">
              <div className="h-1.5 bg-gray-700 rounded shadow-md w-full relative" />
              <p className="text-[10px] text-center uppercase tracking-widest text-gray-500">All eyes this way (Screen)</p>
            </div>

            {/* Matrix of Seats */}
            <div className="overflow-x-auto py-4">
              <div className="flex flex-col gap-2 min-w-[500px] items-center">
                {rows.map(row => {
                  const tier = getSeatTier(row);
                  return (
                    <div key={row} className="flex items-center gap-3.5">
                      <span className="text-[10px] font-bold text-gray-500 w-3">{row}</span>
                      
                      <div className="flex gap-2">
                        {columns.map(col => {
                          const label = `${row}${col}`;
                          const selected = selectedSeats.includes(label);
                          // Mock some random pre-booked seats
                          const isBooked = (parseInt(row.charCodeAt(0)) * col) % 7 === 0;

                          return (
                            <button
                              key={col}
                              onClick={() => !isBooked && handleSeatClick(label)}
                              disabled={isBooked}
                              className={`w-6 h-6 text-[8px] font-extrabold rounded flex items-center justify-center border transition-all ${
                                isBooked
                                  ? 'bg-[#22242A] border-[#2E3139] text-[#444855] cursor-not-allowed'
                                  : selected
                                  ? 'bg-brand border-brand text-white shadow shadow-brand/10'
                                  : 'bg-[#15171B] hover:bg-gray-800 border-gray-800 text-gray-400 hover:text-white'
                              }`}
                              title={`${label} - ${tier.name} (₹${Number(ticketPrice) + tier.surcharge})`}
                            >
                              {col}
                            </button>
                          );
                        })}
                      </div>

                      <span className="text-[10px] font-bold text-gray-500 w-3">{row}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend block */}
            <div className="flex flex-wrap justify-center gap-6 text-[10px] uppercase font-bold text-gray-400 pt-4 border-t border-gray-800/60">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#15171B] border border-gray-800 block" /> Available
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-brand border border-brand block" /> Selected
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#22242A] border border-[#2E3139] block" /> Booked
              </div>
            </div>

            {/* Row actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <div>
                <span className="text-[10px] font-bold text-gray-500 block uppercase">Selected Seats ({selectedSeats.length})</span>
                <span className="text-sm font-bold text-white truncate max-w-[200px] block">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                </span>
              </div>
              <button
                onClick={handleConfirmSeats}
                className="bg-brand hover:bg-brand-dark text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-lg"
              >
                Confirm Seats
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: Checkout Order Summary breakdown */}
        {step === 2 && (
          <div className="bg-[#15171B] border border-gray-800 rounded-xl p-5 md:p-6 space-y-6 shadow-xl fade-in">
            <h3 className="text-base font-bold text-white border-b border-gray-800 pb-3 uppercase">Order Summary</h3>

            {/* Ticket Info */}
            <div className="flex items-start gap-4">
              <img src={bookingEvent.poster_url} alt={bookingEvent.title} className="w-14 h-20 object-cover rounded border border-gray-800" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-white text-sm">{bookingEvent.title}</h4>
                <p className="text-gray-400">{bookingEvent.venue_name}</p>
                <p className="text-gray-400 font-semibold">{bookingDate} | {bookingTime}</p>
                <p className="text-brand font-bold">Seats: {selectedSeats.join(', ')} ({selectedSeats.length} Tickets)</p>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="bg-[#1F2125] p-4 rounded-xl border border-gray-800 text-xs space-y-3.5">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal (Tickets)</span>
                <span className="font-bold text-white">₹{calculatedSubtotal}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Convenience Fee (₹45 / Ticket)</span>
                <span className="font-bold text-white">₹{calculatedFee}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Integrated GST (18% of fee)</span>
                <span className="font-bold text-white">₹{calculatedGst.toFixed(2)}</span>
              </div>
              <hr className="border-gray-800" />
              <div className="flex justify-between font-bold text-sm">
                <span>Total Amount Payable</span>
                <span className="text-brand font-black">₹{calculatedTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Summary Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800/80">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-gray-400 hover:text-white px-4 py-2"
              >
                Back to Seats
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-brand hover:bg-brand-dark text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-lg"
              >
                Proceed to Payment
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: Checkout Mock Payment input */}
        {step === 3 && (
          <div className="bg-[#15171B] border border-gray-800 rounded-xl p-5 md:p-6 space-y-6 shadow-xl fade-in">
            <h3 className="text-base font-bold text-white border-b border-gray-800 pb-3 uppercase">Secure Payment Selection</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Payment selector widgets */}
              <div className="space-y-2 flex flex-col">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`w-full text-left p-3.5 rounded-lg text-xs font-bold border transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-brand/10 border-brand text-brand'
                      : 'bg-[#202227] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  UPI payment (QR/GPay)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full text-left p-3.5 rounded-lg text-xs font-bold border transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-brand/10 border-brand text-brand'
                      : 'bg-[#202227] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  Credit / Debit Card
                </button>
              </div>

              {/* Specific Method form details */}
              <div className="md:col-span-2 space-y-4">
                {paymentMethod === 'upi' ? (
                  <div className="bg-[#1F2125] p-5 rounded-xl border border-gray-800 text-center space-y-3.5">
                    <QrCode className="w-24 h-24 text-gray-400 mx-auto animate-pulse" />
                    <p className="text-[11px] text-gray-400">Mock UPI QR Code generated. Submit payments by clicking Pay Now directly.</p>
                  </div>
                ) : (
                  <div className="bg-[#1F2125] p-5 rounded-xl border border-gray-800 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Card Number</label>
                      <input
                        type="text"
                        placeholder="1111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-[#15171B] border border-gray-800 text-xs p-2.5 rounded text-white focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="12/29"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-[#15171B] border border-gray-800 text-xs p-2.5 rounded text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">CVV</label>
                        <input
                          type="password"
                          placeholder="123"
                          maxLength="3"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-[#15171B] border border-gray-800 text-xs p-2.5 rounded text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Submit Action block */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-gray-400 hover:text-white px-4 py-2"
              >
                Back to Summary
              </button>
              <button
                onClick={handleProcessMockPayment}
                disabled={loadingPayment}
                className="bg-brand hover:bg-brand-dark text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5"
              >
                {loadingPayment ? 'Processing...' : `Pay ₹${calculatedTotal.toFixed(2)}`}
              </button>
            </div>

          </div>
        )}

        {/* STEP 4: Checkout Success Confirmation page */}
        {step === 4 && createdBooking && (
          <div className="bg-[#15171B] border border-gray-800 rounded-xl p-5 md:p-8 space-y-8 shadow-xl text-center fade-in">
            
            <div className="space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black uppercase text-white tracking-widest">Booking Confirmed!</h3>
              <p className="text-xs text-gray-400">Your tickets are locked and confirmed. Have a great experience!</p>
            </div>

            <hr className="border-gray-800" />

            {/* Ticket Core details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-xl mx-auto">
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-gray-500">Booking Reference</span>
                  <h5 className="text-sm font-bold text-white">{createdBooking.booking_reference}</h5>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-gray-500">Event Title</span>
                  <h5 className="text-sm font-bold text-brand leading-snug">{bookingEvent.title}</h5>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-gray-500">Seats & Price</span>
                  <h5 className="text-xs font-bold text-white">
                    {createdBooking.seats?.join(', ')} ({createdBooking.seats?.length} Tickets) | Total: ₹{createdBooking.total_price}
                  </h5>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Calendar className="w-4 h-4 text-brand" />
                    {new Date(bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-4 h-4 text-brand" />
                    {bookingTime}
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-gray-400 pt-2">
                  <MapPin className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                  <span>{createdBooking.venueName || bookingEvent.venue_name}</span>
                </div>
              </div>

              {/* QR Code section */}
              <div className="bg-[#202227] p-5 rounded-xl border border-gray-800 flex flex-col items-center justify-center space-y-2">
                <QrCode className="w-28 h-28 text-white" />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Scan at Entrance</span>
              </div>

            </div>

            <hr className="border-gray-800" />

            {/* AI Custom Itinerary Advice Tip widget */}
            {aiItineraryTip && (
              <div className="p-5 rounded-xl border border-brand/20 bg-gradient-to-br from-brand/10 to-[#15171B] space-y-2 text-left max-w-xl mx-auto">
                <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-brand animate-pulse" />
                  AI Itinerary Advice
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  "{aiItineraryTip}"
                </p>
              </div>
            )}

            <button
              onClick={handleFinish}
              className="bg-brand hover:bg-brand-dark text-white font-bold text-xs px-8 py-3 rounded-lg shadow-lg"
            >
              Done (View Tickets)
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
