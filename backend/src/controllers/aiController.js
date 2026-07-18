import pool from '../config/db.js';
import { getAIOccasionCollection, getAIComparison } from '../services/geminiService.js';

// Occasion categories list
const OCCASIONS = [
  'For You',
  'Date Night',
  'Weekend Plans',
  'Need a Laugh',
  'Live Music Tonight',
  'Under ₹500',
  'Under 2 Hours',
  'Trending Near You',
  'Friends Hangout',
  'Family Night',
  'After Office Escape',
  'Rainy Day Picks',
  'Birthday Plans',
  'Kids Friendly'
];

/**
 * Dynamic occasion ranker.
 * Orders the collections dynamically based on user preferences, current day, and city.
 */
function rankOccasions(preferences, currentCity) {
  const list = [...OCCASIONS];
  const dayOfWeek = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6; // Fri, Sat, Sun
  
  const favoriteCategories = preferences.favorite_categories || [];
  const budgetLimit = Number(preferences.budget_preference) || 1000;

  const scoreMap = {};
  list.forEach(occ => {
    scoreMap[occ] = 0;

    // Day of week adjustments
    if (isWeekend) {
      if (['Weekend Plans', 'Date Night', 'Live Music Tonight', 'Birthday Plans', 'Friends Hangout'].includes(occ)) {
        scoreMap[occ] += 30;
      }
    } else {
      // Weekdays
      if (['After Office Escape', 'Under 2 Hours', 'Need a Laugh', 'Under ₹500'].includes(occ)) {
        scoreMap[occ] += 30;
      }
    }

    // User interest adjustments
    if (favoriteCategories.includes('comedy') && occ === 'Need a Laugh') {
      scoreMap[occ] += 25;
    }
    if (favoriteCategories.includes('concerts') && occ === 'Live Music Tonight') {
      scoreMap[occ] += 25;
    }
    if (favoriteCategories.includes('movies') && occ === 'For You') {
      scoreMap[occ] += 20;
    }
    if (budgetLimit <= 500 && occ === 'Under ₹500') {
      scoreMap[occ] += 25;
    }
  });

  // Sort collections by score descending
  return list.sort((a, b) => (scoreMap[b] || 0) - (scoreMap[a] || 0));
}

// Fetch occasion-based collections dynamically
export async function getOccasionCollections(req, res) {
  try {
    const userId = req.headers['x-user-id'] || 'guest-test-user-id';
    const city = req.query.city || 'Mumbai';

    // 1. Fetch user preferences
    let preferences = {
      favorite_categories: ['movies', 'comedy', 'concerts'],
      preferred_languages: ['English', 'Hindi'],
      preferred_cities: [city],
      budget_preference: 1000.00
    };

    const prefResult = await pool.query('SELECT * FROM preferences WHERE user_id = $1', [userId]);
    if (prefResult.rowCount > 0) {
      preferences = prefResult.rows[0];
    }

    // 2. Fetch all events in this city
    const eventsResult = await pool.query(
      'SELECT * FROM events WHERE venue_city = $1 ORDER BY event_date ASC, rating DESC',
      [city]
    );
    const cityEvents = eventsResult.rows;

    if (cityEvents.length === 0) {
      return res.json([]);
    }

    // 3. Rank occasions based on preferences/time
    const orderedOccasions = rankOccasions(preferences, city);

    // 4. Build collections
    const collections = [];

    // Optimize performance: use Gemini for top 3 collections, local fallback for the rest
    for (let i = 0; i < orderedOccasions.length; i++) {
      const occasion = orderedOccasions[i];
      let filteredEvents = [];

      // Filter events matching the occasion logic
      switch (occasion) {
        case 'For You':
          // Match favorite categories or high rating
          filteredEvents = cityEvents.filter(e => 
            preferences.favorite_categories?.includes(e.category_id) || e.rating >= 8.5
          );
          break;
        case 'Date Night':
          // Movies, concerts, plays, evening times
          filteredEvents = cityEvents.filter(e => 
            ['movies', 'concerts', 'plays'].includes(e.category_id) && 
            !e.genre?.toLowerCase().includes('horror')
          );
          break;
        case 'Weekend Plans':
          // Everything goes, prioritized by weekend dates if available
          filteredEvents = cityEvents;
          break;
        case 'Need a Laugh':
          filteredEvents = cityEvents.filter(e => 
            e.category_id === 'comedy' || e.genre?.toLowerCase().includes('comedy')
          );
          break;
        case 'Live Music Tonight':
          filteredEvents = cityEvents.filter(e => 
            e.category_id === 'concerts' || e.genre?.toLowerCase().includes('music')
          );
          break;
        case 'Under ₹500':
          filteredEvents = cityEvents.filter(e => Number(e.price) <= 500);
          break;
        case 'Under 2 Hours':
          filteredEvents = cityEvents.filter(e => e.duration_mins && e.duration_mins <= 120);
          break;
        case 'Trending Near You':
          filteredEvents = cityEvents.filter(e => e.is_trending === true);
          break;
        case 'Friends Hangout':
          filteredEvents = cityEvents.filter(e => 
            ['comedy', 'sports', 'activities'].includes(e.category_id)
          );
          break;
        case 'Family Night':
          // Exclude horror, target G-rated movies, activities, plays
          filteredEvents = cityEvents.filter(e => 
            !e.genre?.toLowerCase().includes('horror') && 
            ['movies', 'plays', 'activities'].includes(e.category_id)
          );
          break;
        case 'After Office Escape':
          // Evening events
          filteredEvents = cityEvents.filter(e => {
            const hour = parseInt(e.event_time?.split(':')[0] || '18');
            return hour >= 16;
          });
          break;
        case 'Rainy Day Picks':
          // Indoor categories: movies, comedy, plays, activities (workshops, gaming)
          filteredEvents = cityEvents.filter(e => e.category_id !== 'sports');
          break;
        case 'Birthday Plans':
          // Premium price tags or music concerts
          filteredEvents = cityEvents.filter(e => Number(e.price) >= 800 || e.category_id === 'concerts');
          break;
        case 'Kids Friendly':
          // Workshops or movies
          filteredEvents = cityEvents.filter(e => 
            ['activities', 'movies'].includes(e.category_id) && 
            !e.genre?.toLowerCase().includes('horror') && 
            !e.genre?.toLowerCase().includes('thriller')
          );
          break;
      }

      // If no matching events, skip this collection to avoid empty state rows on home
      if (filteredEvents.length === 0) continue;

      // Slice to top 8 items per row
      const displayEvents = filteredEvents.slice(0, 8);

      // Call Gemini for the top 3 rows, run local scoring for the rest
      const useGemini = i < 3;
      let collectionDetails;

      if (useGemini) {
        collectionDetails = await getAIOccasionCollection(occasion, displayEvents, preferences);
      } else {
        // Run local scoring logic
        const favoriteCategories = preferences.favorite_categories || [];
        const preferredLanguages = preferences.preferred_languages || [];
        const budgetLimit = Number(preferences.budget_preference) || 1000;
        
        let localDesc = 'Specially selected local matches.';
        if (occasion === 'Under ₹500') localDesc = 'Budget-friendly entertainment that keeps wallet happy.';
        if (occasion === 'Under 2 Hours') localDesc = 'Short, action-packed events perfect for a quick escape.';
        if (occasion === 'Need a Laugh') localDesc = 'Guaranteed laughter from the best standup talent.';
        if (occasion === 'Trending Near You') localDesc = 'Popular events making headlines in the city.';
        if (occasion === 'Live Music Tonight') localDesc = 'Awesome concerts and melodies to brighten your evening.';
        if (occasion === 'Family Night') localDesc = 'Wholesome family events loved by both kids and adults.';
        if (occasion === 'Rainy Day Picks') localDesc = 'Top cozy indoor choices for a rainy day.';
        if (occasion === 'Kids Friendly') localDesc = 'Educational and entertaining workshops and movies.';

        const matches = displayEvents.map(event => {
          let score = 55;
          if (favoriteCategories.includes(event.category_id)) score += 20;
          if (preferredLanguages.some(l => event.language?.includes(l))) score += 15;
          if (Number(event.price) <= budgetLimit) score += 10;
          score = Math.max(60, Math.min(98, score));

          return {
            eventId: event.id,
            matchPercentage: score,
            reason: `Highly-rated ${event.genre} event happening in ${event.venue_city}.`
          };
        });

        collectionDetails = {
          description: localDesc,
          matches
        };
      }

      // Merge calculations back to full event details
      const eventsWithScores = displayEvents.map(event => {
        const scoreMatch = collectionDetails.matches.find(m => m.eventId === event.id);
        return {
          ...event,
          matchPercentage: scoreMatch ? scoreMatch.matchPercentage : 75,
          aiReason: scoreMatch ? scoreMatch.reason : 'Fits popular choices near you.'
        };
      });

      // Sort display events by match percentage descending
      eventsWithScores.sort((a, b) => b.matchPercentage - a.matchPercentage);

      collections.push({
        occasion,
        description: collectionDetails.description,
        events: eventsWithScores
      });
    }

    res.json(collections);
  } catch (err) {
    console.error('Error generating occasion collections:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Side-by-side Compare Corner endpoint
export async function compareEvents(req, res) {
  try {
    const { eventIds } = req.body; // Array of integers
    const userId = req.headers['x-user-id'] || 'guest-test-user-id';

    if (!Array.isArray(eventIds) || eventIds.length === 0) {
      return res.status(400).json({ error: 'eventIds array is required' });
    }

    const ids = eventIds.map(Number);

    // Fetch the target events
    const result = await pool.query(
      'SELECT * FROM events WHERE id = ANY($1::int[])',
      [ids]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No matching events found' });
    }

    // Fetch user preferences
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

    const comparisonData = await getAIComparison(result.rows, preferences);

    // Merge comparison data (Best For, Pros, Cons, Match %) back to event details
    const comparedEvents = result.rows.map(event => {
      const cmp = comparisonData.comparisons.find(c => c.eventId === event.id);
      return {
        ...event,
        matchPercentage: cmp ? cmp.matchPercentage : 70,
        bestFor: cmp ? cmp.bestFor : 'General Audiences',
        pros: cmp ? cmp.pros : ['Popular rating', 'Great venue'],
        cons: cmp ? cmp.cons : ['Standard tickets limit']
      };
    });

    res.json({
      events: comparedEvents,
      recommendationSummary: comparisonData.recommendationSummary,
      recommendedEventId: comparisonData.recommendedEventId
    });
  } catch (err) {
    console.error('Error comparing events:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
