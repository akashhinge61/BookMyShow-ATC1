import pool from '../config/db.js';

// Retrieve or create User on load/session setup
export async function getOrCreateUser(req, res) {
  try {
    const { userId, email, name } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if user exists
    const checkResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (checkResult.rowCount > 0) {
      return res.json(checkResult.rows[0]);
    }

    // Insert user
    const insertResult = await pool.query(
      'INSERT INTO users (id, email, name) VALUES ($1, $2, $3) RETURNING *',
      [userId, email || null, name || 'Guest Explorer']
    );

    // Seed default preferences for new user
    await pool.query(
      `INSERT INTO preferences (user_id, favorite_categories, preferred_languages, preferred_cities, budget_preference, time_preference)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO NOTHING`,
      [
        userId,
        JSON.stringify(['movies', 'comedy']),
        JSON.stringify(['English', 'Hindi']),
        JSON.stringify(['Mumbai']),
        1000.00,
        'evening'
      ]
    );

    res.json(insertResult.rows[0]);
  } catch (err) {
    console.error('Error in getOrCreateUser:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Fetch user profile preferences
export async function getUserPreferences(req, res) {
  try {
    const userId = req.headers['x-user-id'] || 'guest-test-user-id';
    
    const result = await pool.query('SELECT * FROM preferences WHERE user_id = $1', [userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Preferences not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user preferences:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Save/Update user profile preferences
export async function updateUserPreferences(req, res) {
  try {
    const userId = req.headers['x-user-id'] || 'guest-test-user-id';
    const { 
      favoriteCategories, 
      preferredLanguages, 
      preferredCities, 
      budgetPreference, 
      timePreference,
      additionalPreferences
    } = req.body;

    const query = `
      INSERT INTO preferences (
        user_id, 
        favorite_categories, 
        preferred_languages, 
        preferred_cities, 
        budget_preference, 
        time_preference, 
        additional_preferences, 
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (user_id) DO UPDATE 
      SET favorite_categories = EXCLUDED.favorite_categories,
          preferred_languages = EXCLUDED.preferred_languages,
          preferred_cities = EXCLUDED.preferred_cities,
          budget_preference = EXCLUDED.budget_preference,
          time_preference = EXCLUDED.time_preference,
          additional_preferences = EXCLUDED.additional_preferences,
          updated_at = NOW()
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId,
      JSON.stringify(favoriteCategories || []),
      JSON.stringify(preferredLanguages || []),
      JSON.stringify(preferredCities || []),
      Number(budgetPreference) || 1000.00,
      timePreference || 'evening',
      JSON.stringify(additionalPreferences || {})
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error saving user preferences:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get Bookmarked/Saved Events
export async function getSavedEvents(req, res) {
  try {
    const userId = req.headers['x-user-id'] || 'guest-test-user-id';

    const query = `
      SELECT e.* 
      FROM saved_events se
      JOIN events e ON se.event_id = e.id
      WHERE se.user_id = $1
      ORDER BY se.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting saved events:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Bookmark/Save Event toggle
export async function toggleSavedEvent(req, res) {
  try {
    const userId = req.headers['x-user-id'] || 'guest-test-user-id';
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }

    // Check if already bookmarked
    const check = await pool.query(
      'SELECT id FROM saved_events WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
    );

    if (check.rowCount > 0) {
      // Remove it
      await pool.query(
        'DELETE FROM saved_events WHERE user_id = $1 AND event_id = $2',
        [userId, eventId]
      );
      res.json({ saved: false, message: 'Event unsaved successfully' });
    } else {
      // Save it
      await pool.query(
        'INSERT INTO saved_events (user_id, event_id) VALUES ($1, $2)',
        [userId, eventId]
      );
      res.json({ saved: true, message: 'Event saved successfully' });
    }
  } catch (err) {
    console.error('Error toggling saved event:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
