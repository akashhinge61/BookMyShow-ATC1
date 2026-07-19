import pool from '../config/db.js';
import { getAIOccasionCollection, getAIComparison } from '../services/geminiService.js';

// Occasion categories list
const OCCASIONS = [
  'Weekend Plans',
  'Date Night',
  'Family Time',
  'Friends Night Out',
  'Solo Escape',
  'Office Break',
  'Live Music Tonight',
  'Comedy Evening',
  'Budget Plans',
  'Luxury Experiences',
  'Rainy Day Picks',
  'Kids Activities',
  'Sports Fan Picks',
  'Romantic Evening',
  'Festival Specials',
  'Trending Near You'
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
      if (['Weekend Plans', 'Date Night', 'Live Music Tonight', 'Romantic Evening', 'Friends Night Out'].includes(occ)) {
        scoreMap[occ] += 30;
      }
    } else {
      // Weekdays
      if (['Office Break', 'Solo Escape', 'Comedy Evening', 'Budget Plans'].includes(occ)) {
        scoreMap[occ] += 30;
      }
    }

    // User interest adjustments
    if (favoriteCategories.includes('comedy') && occ === 'Comedy Evening') {
      scoreMap[occ] += 25;
    }
    if (favoriteCategories.includes('concerts') && occ === 'Live Music Tonight') {
      scoreMap[occ] += 25;
    }
    if (favoriteCategories.includes('movies') && ['Date Night', 'Romantic Evening'].includes(occ)) {
      scoreMap[occ] += 20;
    }
    if (favoriteCategories.includes('sports') && occ === 'Sports Fan Picks') {
      scoreMap[occ] += 30;
    }
    if (budgetLimit <= 500 && occ === 'Budget Plans') {
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
        case 'Weekend Plans':
          // Prioritize weekend dates
          filteredEvents = cityEvents;
          break;
        case 'Date Night':
          // Movies, concerts, plays, evening times, exclude horror
          filteredEvents = cityEvents.filter(e => 
            ['movies', 'concerts', 'plays'].includes(e.category_id) && 
            !e.genre?.toLowerCase().includes('horror')
          );
          break;
        case 'Family Time':
          // Exclude horror/thriller, target movies, plays, activities
          filteredEvents = cityEvents.filter(e => 
            !e.genre?.toLowerCase().includes('horror') && 
            !e.genre?.toLowerCase().includes('thriller') &&
            ['movies', 'plays', 'activities'].includes(e.category_id)
          );
          break;
        case 'Friends Night Out':
          filteredEvents = cityEvents.filter(e => 
            ['comedy', 'sports', 'activities'].includes(e.category_id)
          );
          break;
        case 'Solo Escape':
          filteredEvents = cityEvents.filter(e => 
            ['activities', 'plays', 'movies'].includes(e.category_id)
          );
          break;
        case 'Office Break':
          // Evening events starting at or after 4 PM (16:00)
          filteredEvents = cityEvents.filter(e => {
            const hour = parseInt(e.event_time?.split(':')[0] || '18');
            return hour >= 16;
          });
          break;
        case 'Live Music Tonight':
          filteredEvents = cityEvents.filter(e => 
            e.category_id === 'concerts' || e.genre?.toLowerCase().includes('music') || e.genre?.toLowerCase().includes('pop')
          );
          break;
        case 'Comedy Evening':
          filteredEvents = cityEvents.filter(e => 
            e.category_id === 'comedy' || e.genre?.toLowerCase().includes('comedy')
          );
          break;
        case 'Budget Plans':
          filteredEvents = cityEvents.filter(e => Number(e.price) <= 500);
          break;
        case 'Luxury Experiences':
          filteredEvents = cityEvents.filter(e => Number(e.price) >= 1200 || e.category_id === 'concerts');
          break;
        case 'Rainy Day Picks':
          // Indoor categories only
          filteredEvents = cityEvents.filter(e => e.category_id !== 'sports' && !e.genre?.toLowerCase().includes('cycling'));
          break;
        case 'Kids Activities':
          filteredEvents = cityEvents.filter(e => 
            ['activities', 'movies'].includes(e.category_id) && 
            !e.genre?.toLowerCase().includes('horror') && 
            !e.genre?.toLowerCase().includes('thriller')
          );
          break;
        case 'Sports Fan Picks':
          filteredEvents = cityEvents.filter(e => e.category_id === 'sports');
          break;
        case 'Romantic Evening':
          filteredEvents = cityEvents.filter(e => 
            (['movies', 'concerts', 'plays'].includes(e.category_id) && e.genre?.toLowerCase().includes('romance')) ||
            (e.category_id === 'concerts' && Number(e.price) >= 900)
          );
          break;
        case 'Festival Specials':
          filteredEvents = cityEvents.filter(e => 
            ['plays', 'concerts'].includes(e.category_id) || e.genre?.toLowerCase().includes('musical')
          );
          break;
        case 'Trending Near You':
          filteredEvents = cityEvents.filter(e => e.is_trending === true);
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
        if (occasion === 'Budget Plans') localDesc = 'Budget-friendly entertainment that keeps your wallet happy.';
        if (occasion === 'Comedy Evening') localDesc = 'Guaranteed laughter from the best standup talent.';
        if (occasion === 'Trending Near You') localDesc = 'Popular events making headlines in the city.';
        if (occasion === 'Live Music Tonight') localDesc = 'Awesome concerts and melodies to brighten your evening.';
        if (occasion === 'Family Time') localDesc = 'Wholesome family events loved by both kids and adults.';
        if (occasion === 'Rainy Day Picks') localDesc = 'Top cozy indoor choices for a rainy day.';
        if (occasion === 'Kids Activities') localDesc = 'Educational and entertaining workshops and movies.';
        if (occasion === 'Romantic Evening') localDesc = 'Magical candlelight events and movies for two.';
        if (occasion === 'Sports Fan Picks') localDesc = 'High-octane stadium action and derby matches.';
        if (occasion === 'Luxury Experiences') localDesc = 'Premium VIP seating shows and elite theatrical events.';

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
