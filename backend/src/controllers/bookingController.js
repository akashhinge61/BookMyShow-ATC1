import pool from '../config/db.js';

// Create a new Booking
export async function createBooking(req, res) {
  try {
    const userId = req.headers['x-user-id'] || 'guest-test-user-id';
    const { eventId, seats, totalPrice, eventDate, eventTime } = req.body;

    if (!eventId || !seats || !Array.isArray(seats) || seats.length === 0 || !totalPrice || !eventDate || !eventTime) {
      return res.status(400).json({ error: 'Missing required booking parameters' });
    }

    // Double check that event exists
    const eventResult = await pool.query('SELECT title, venue_name FROM events WHERE id = $1', [eventId]);
    if (eventResult.rowCount === 0) {
      return res.status(404).json({ error: 'Selected event not found' });
    }

    // Generate random booking reference (e.g. BMS-7362948)
    const randomRef = 'BMS-' + Math.floor(1000000 + Math.random() * 9000000);

    const queryText = `
      INSERT INTO bookings (booking_reference, user_id, event_id, seats, total_price, event_date, event_time, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed')
      RETURNING *
    `;

    const result = await pool.query(queryText, [
      randomRef,
      userId,
      eventId,
      JSON.stringify(seats),
      Number(totalPrice),
      eventDate,
      eventTime
    ]);

    const booking = result.rows[0];

    res.status(201).json({
      ...booking,
      eventTitle: eventResult.rows[0].title,
      venueName: eventResult.rows[0].venue_name
    });
  } catch (err) {
    console.error('Error creating booking:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Fetch all bookings for a user (upcoming and past)
export async function getBookings(req, res) {
  try {
    const userId = req.headers['x-user-id'] || 'guest-test-user-id';

    const queryText = `
      SELECT b.*, e.title as event_title, e.poster_url, e.venue_name, e.venue_city, e.category_id
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.user_id = $1
      ORDER BY b.booking_date DESC
    `;

    const result = await pool.query(queryText, [userId]);
    const bookings = result.rows;

    const todayStr = new Date().toISOString().split('T')[0];

    // Partition upcoming vs history
    const upcoming = [];
    const history = [];

    bookings.forEach(booking => {
      // Event date is returned as Date object or string (YYYY-MM-DD)
      const eventDateStr = typeof booking.event_date === 'string' 
        ? booking.event_date 
        : booking.event_date.toISOString().split('T')[0];

      if (eventDateStr >= todayStr && booking.status !== 'cancelled') {
        upcoming.push(booking);
      } else {
        history.push(booking);
      }
    });

    res.json({
      upcoming,
      history
    });
  } catch (err) {
    console.error('Error getting bookings list:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Cancel Booking (Mock)
export async function cancelBooking(req, res) {
  try {
    const userId = req.headers['x-user-id'] || 'guest-test-user-id';
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE bookings SET status = \'cancelled\' WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Booking not found or not owned by user' });
    }

    res.json({ message: 'Booking cancelled successfully', booking: result.rows[0] });
  } catch (err) {
    console.error('Error cancelling booking:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
