import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [bookingEvent, setBookingEvent] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [ticketPrice, setTicketPrice] = useState(0);

  const setBookingDetails = (event, date, time) => {
    setBookingEvent(event);
    setBookingDate(date);
    setBookingTime(time);
    setTicketPrice(Number(event.price));
    setSelectedSeats([]); // reset seats
  };

  const updateSeats = (seats) => {
    setSelectedSeats(seats);
  };

  const clearBooking = () => {
    setBookingEvent(null);
    setBookingDate('');
    setBookingTime('');
    setSelectedSeats([]);
    setTicketPrice(0);
  };

  const seatsCount = selectedSeats.length;
  const subtotal = ticketPrice * seatsCount;
  const convenienceFee = seatsCount > 0 ? 45 * seatsCount : 0;
  const gst = convenienceFee * 0.18;
  const totalAmount = subtotal + convenienceFee + gst;

  return (
    <BookingContext.Provider value={{
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
      setBookingDetails,
      updateSeats,
      clearBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
