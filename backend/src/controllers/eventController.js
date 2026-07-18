import pool from '../config/db.js';
import { getSingleEventAIReason } from '../services/geminiService.js';

// Get all categories
export async function getCategories(req, res) {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get filtered list of events
export async function getEvents(req, res) {
  try {
    const {
      search,
      category,
      city,
      language,
      genre,
      budget,
      date,
      trending
    } = req.query;

    let queryText = 'SELECT * FROM events WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (search) {
      queryText += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR venue_name ILIKE $${paramIndex} OR genre ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      queryText += ` AND category_id = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    if (city) {
      queryText += ` AND venue_city = $${paramIndex}`;
      queryParams.push(city);
      paramIndex++;
    }

    if (language) {
      queryText += ` AND language ILIKE $${paramIndex}`;
      queryParams.push(`%${language}%`);
      paramIndex++;
    }

    if (genre) {
      queryText += ` AND genre ILIKE $${paramIndex}`;
      queryParams.push(`%${genre}%`);
      paramIndex++;
    }

    if (budget) {
      queryText += ` AND price <= $${paramIndex}`;
      queryParams.push(Number(budget));
      paramIndex++;
    }

    if (date) {
      const today = new Date().toISOString().split('T')[0];
      if (date === 'today') {
        queryText += ` AND event_date = $${paramIndex}`;
        queryParams.push(today);
        paramIndex++;
      } else if (date === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        queryText += ` AND event_date = $${paramIndex}`;
        queryParams.push(tomorrow.toISOString().split('T')[0]);
        paramIndex++;
      } else if (date === 'weekend') {
        // Fetch events for coming Friday, Saturday, Sunday
        const todayObj = new Date();
        const diff = todayObj.getDay() === 0 ? 0 : 5 - todayObj.getDay(); // distance to Friday
        const fri = new Date(todayObj);
        fri.setDate(todayObj.getDate() + diff);
        const sun = new Date(fri);
        sun.setDate(fri.getDate() + 2);
        
        queryText += ` AND event_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        queryParams.push(fri.toISOString().split('T')[0]);
        queryParams.push(sun.toISOString().split('T')[0]);
        paramIndex += 2;
      } else {
        // Specific date input (YYYY-MM-DD)
        queryText += ` AND event_date = $${paramIndex}`;
        queryParams.push(date);
        paramIndex++;
      }
    }

    if (trending === 'true') {
      queryText += ' AND is_trending = true';
    }

    queryText += ' ORDER BY event_date ASC, rating DESC';

    const result = await pool.query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Error querying events:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get single event detail + include AI single match reason
export async function getEventById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] || 'guest-test-user-id'; // Default guest user

    // Fetch the event
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (eventResult.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const event = eventResult.rows[0];

    // Fetch user preferences for generating custom reasons
    let preferences = {
      favorite_categories: ['movies', 'comedy'],
      preferred_languages: ['English', 'Hindi'],
      preferred_cities: ['Mumbai'],
      budget_preference: 1000.00
    };

    const prefResult = await pool.query('SELECT * FROM preferences WHERE user_id = $1', [userId]);
    if (prefResult.rowCount > 0) {
      preferences = prefResult.rows[0];
    }

    // Generate AI explanation reason
    const aiReason = await getSingleEventAIReason(event, preferences);

    res.json({
      ...event,
      aiReason
    });
  } catch (err) {
    console.error('Error fetching event details:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
