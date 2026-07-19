import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let ai = null;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log('Gemini API initialized successfully.');
  } catch (err) {
    console.warn('Failed to initialize Gemini AI client:', err.message);
  }
} else {
  console.warn('GEMINI_API_KEY is not set or placeholder. Operating in intelligent fallback mode.');
}

/**
 * Intelligent local scoring fallback engine.
 * Generates match scores and descriptions using local heuristics.
 */
function getLocalScoresAndDescriptions(events, preferences, occasion) {
  const favoriteCategories = preferences.favorite_categories || [];
  const preferredLanguages = preferences.preferred_languages || [];
  const preferredCities = preferences.preferred_cities || [];
  const budgetLimit = Number(preferences.budget_preference) || 1000;
  const preferredTime = preferences.time_preference || 'evening';

  // Return a custom header description per occasion
  let collectionDescription = 'Handpicked entertainment chosen just for you.';
  switch (occasion) {
    case 'For You':
      collectionDescription = 'Personalized suggestions matching your top categories and languages.';
      break;
    case 'Date Night':
      collectionDescription = 'Cozy, romantic, and engaging experiences perfect for a special evening.';
      break;
    case 'Weekend Plans':
      collectionDescription = 'Exciting weekend events to recharge and make memories.';
      break;
    case 'Family Night':
      collectionDescription = 'Wholesome entertainment suitable for all ages and family sizes.';
      break;
    case 'Friends Hangout':
      collectionDescription = 'Fun, interactive, and high-energy outings perfect for your group.';
      break;
    case 'Need a Laugh':
      collectionDescription = 'Top-rated standup comedy and hilarious plays to brighten your day.';
      break;
    case 'After Office Escape':
      collectionDescription = 'Relaxing evening escapes to decompress after a hard day\'s work.';
      break;
    case 'Live Music Tonight':
      collectionDescription = 'Captivating live concerts, bands, and acoustic rooftop nights.';
      break;
    case 'Under ₹500':
      collectionDescription = 'Pocket-friendly entertainment options that don\'t compromise on fun.';
      break;
    case 'Under 2 Hours':
      collectionDescription = 'Quick and thrilling experiences perfect for a tight schedule.';
      break;
    case 'Trending Near You':
      collectionDescription = 'The hottest events capturing everyone\'s attention in your city.';
      break;
    case 'Hidden Gems':
      collectionDescription = 'Highly rated but lesser-known events worth discovering.';
      break;
    case 'Rainy Day Picks':
      collectionDescription = 'Cosy indoor escape rooms, plays, and movies to keep you dry.';
      break;
    case 'Birthday Plans':
      collectionDescription = 'Premium shows and unforgettable experiences to celebrate your special day.';
      break;
    case 'Kids Friendly':
      collectionDescription = 'Exciting, educational, and safe workshops and movies for kids.';
      break;
  }

  const results = events.map(event => {
    let score = 50; // Base score

    // 1. Category match
    if (favoriteCategories.includes(event.category_id)) {
      score += 20;
    }

    // 2. Language match
    if (preferredLanguages.some(lang => event.language?.toLowerCase().includes(lang.toLowerCase()))) {
      score += 15;
    }

    // 3. City match
    if (preferredCities.some(city => event.venue_city?.toLowerCase() === city.toLowerCase())) {
      score += 15;
    }

    // 4. Budget match
    if (Number(event.price) <= budgetLimit) {
      score += 10;
    } else {
      score -= 10; // penalty for over-budget
    }

    // 5. Rating influence
    score += Math.round((Number(event.rating) - 7.5) * 5); // +5 for 8.5, -5 for 6.5

    // Clamp score between 60 and 98 for realistic matching feel
    score = Math.max(60, Math.min(98, score));

    // Dynamic reasons based on match attributes
    let reason = `Matches your preference for ${event.genre} events.`;
    if (favoriteCategories.includes(event.category_id) && Number(event.price) <= budgetLimit) {
      reason = `Matches your favorite category '${event.category_id}' and fits your budget of ₹${budgetLimit}.`;
    } else if (Number(event.price) <= 500 && occasion === 'Under ₹500') {
      reason = `Unbeatable price of ₹${Number(event.price)} makes this an absolute steal.`;
    } else if (event.duration_mins <= 120 && occasion === 'Under 2 Hours') {
      reason = `A short ${event.duration_mins}-minute escape that fits perfectly into your day.`;
    } else if (event.rating >= 9.0) {
      reason = `Highly recommended with a premium ${event.rating}/10 user rating in the city.`;
    } else if (preferredCities.some(city => event.venue_city?.toLowerCase() === city.toLowerCase())) {
      reason = `Conveniently taking place right here in ${event.venue_city}.`;
    }

    return {
      eventId: event.id,
      matchPercentage: score,
      reason
    };
  });

  return {
    description: collectionDescription,
    matches: results
  };
}

/**
 * Generates AI-personalized Occasion Collection.
 * Uses Gemini if available; otherwise falls back to smart local matching.
 */
export async function getAIOccasionCollection(occasion, events, preferences) {
  // If AI is not available, run fallback directly
  if (!ai) {
    return getLocalScoresAndDescriptions(events, preferences, occasion);
  }

  // Pre-filter events locally to reduce token count and prompt size (top 15 events only)
  const candidateEvents = events.slice(0, 15).map(e => ({
    id: e.id,
    title: e.title,
    category: e.category_id,
    genre: e.genre,
    price: e.price,
    duration: e.duration_mins,
    language: e.language,
    rating: e.rating,
    city: e.venue_city
  }));

  const userProfile = {
    favoriteCategories: preferences.favorite_categories,
    preferredLanguages: preferences.preferred_languages,
    preferredCities: preferences.preferred_cities,
    budgetPreference: preferences.budget_preference,
    timePreference: preferences.time_preference,
    additionalPreferences: preferences.additional_preferences || {}
  };

  const prompt = `
You are a booking coordinator assistant at BookMyShow.
Filter and score the following events for the occasion: "${occasion}".
Consider this user profile:
${JSON.stringify(userProfile, null, 2)}

Candidate Events list:
${JSON.stringify(candidateEvents, null, 2)}

Provide:
1. A concise, witty, or enticing "description" tagline (1 sentence) suitable for this occasion row on the home page.
2. A list of "matches". For each match, provide "eventId", "matchPercentage" (integer 50-100 reflecting how well the event fits both the occasion and the user's preferences), and a short "reason" (1 sentence explaining why this event fits the user's occasion/interests, citing price/language/genre/duration/rating).

Return ONLY a valid JSON object matching this schema:
{
  "description": "tagline text",
  "matches": [
    { "eventId": 1, "matchPercentage": 92, "reason": "reason text" }
  ]
}
Do NOT include markdown block markers like \`\`\`json or text explanation. Return raw JSON.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt
    });

    let rawText = response.text || '';
    // Clean up potential markdown formatting if returned
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(rawText);
    
    if (result.description && Array.isArray(result.matches)) {
      return result;
    }
    throw new Error('Invalid JSON structure returned by Gemini');
  } catch (err) {
    console.warn(`Gemini collection generation failed for "${occasion}", calling fallback:`, err.message);
    return getLocalScoresAndDescriptions(events, preferences, occasion);
  }
}

/**
 * Compares 2-3 events side-by-side.
 * Uses Gemini if available; otherwise falls back to smart local comparisons.
 */
export async function getAIComparison(events, preferences) {
  const userProfile = {
    favoriteCategories: preferences.favorite_categories,
    preferredLanguages: preferences.preferred_languages,
    preferredCities: preferences.preferred_cities,
    budgetPreference: preferences.budget_preference,
    timePreference: preferences.time_preference,
    additionalPreferences: preferences.additional_preferences || {}
  };

  const candidateEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    category: e.category_id,
    genre: e.genre,
    price: e.price,
    duration: e.duration_mins,
    language: e.language,
    rating: e.rating,
    venue: e.venue_name,
    city: e.venue_city,
    time: e.event_time,
    date: e.event_date
  }));

  if (!ai) {
    // Local Fallback Comparison Generator
    const items = events.map(e => {
      // Calculate local match percentage
      let score = 55;
      if (preferences.favorite_categories?.includes(e.category_id)) score += 20;
      if (preferences.preferred_languages?.some(l => e.language?.includes(l))) score += 15;
      if (Number(e.price) <= Number(preferences.budget_preference)) score += 10;
      score = Math.max(65, Math.min(96, score));

      // Simple pros and cons
      const pros = [];
      const cons = [];
      
      if (e.rating >= 9.0) pros.push('Critically acclaimed with 9+ ratings.');
      if (Number(e.price) <= 500) {
        pros.push('Highly affordable price point.');
      } else {
        cons.push('Higher pricing compared to general events.');
      }

      if (e.duration_mins < 120) {
        pros.push('Compact duration, easy to attend.');
      } else {
        cons.push('Longer duration requires dedicated time block.');
      }

      if (preferences.favorite_categories?.includes(e.category_id)) {
        pros.push('Fits your top category preference.');
      } else {
        cons.push('Outside your primary category preference.');
      }

      return {
        eventId: e.id,
        matchPercentage: score,
        bestFor: e.category_id === 'movies' ? 'Movie buffs seeking premium visual content' : 
                 e.category_id === 'comedy' ? 'Group night out for non-stop laughter' :
                 'Live entertainment enthusiasts',
        pros: pros.length ? pros : ['Engaging venue atmosphere'],
        cons: cons.length ? cons : ['Limited availability slots']
      };
    });

    // Pick best item
    const sorted = [...items].sort((a, b) => b.matchPercentage - a.matchPercentage);
    const bestItem = events.find(e => e.id === sorted[0].eventId);

    return {
      comparisons: items,
      recommendationSummary: `Based on your favorite entertainment interests, we recommend choosing "${bestItem.title}". It scores highest on your preferences with a ${sorted[0].matchPercentage}% AI Match.`,
      recommendedEventId: bestItem.id
    };
  }

  const prompt = `
You are an expert entertainment concierge agent at BookMyShow.
Compare the following events side-by-side for this user:
User Profile:
${JSON.stringify(userProfile, null, 2)}

Events to Compare:
${JSON.stringify(candidateEvents, null, 2)}

Generate:
1. An array of "comparisons" mapping to each event. For each event comparison, return:
   - "eventId" (integer matching event id)
   - "matchPercentage" (integer 50-100 indicating how well it fits user preferences)
   - "bestFor" (short string describing the ideal crowd for this event)
   - "pros" (array of 2-3 short strings describing pros of this event relative to user profile)
   - "cons" (array of 1-2 short strings describing cons of this event relative to user profile)
2. "recommendationSummary": A short paragraph (2-3 sentences) explaining which of the events is the absolute best recommendation for the user and why.
3. "recommendedEventId": The eventId (integer) of the recommended event.

Return ONLY a valid JSON object matching this schema:
{
  "comparisons": [
    {
      "eventId": 1,
      "matchPercentage": 88,
      "bestFor": "text",
      "pros": ["pro 1", "pro 2"],
      "cons": ["con 1"]
    }
  ],
  "recommendationSummary": "summary text",
  "recommendedEventId": 1
}
Do NOT include markdown formatting like \`\`\`json. Return raw JSON.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt
    });

    let rawText = response.text || '';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(rawText);
    if (Array.isArray(result.comparisons) && result.recommendationSummary && result.recommendedEventId) {
      return result;
    }
    throw new Error('Invalid comparison structure returned by Gemini');
  } catch (err) {
    console.warn('Gemini comparison failed, calling fallback:', err.message);
    // Construct local fallback on error
    return getAIComparisonFallback(events, preferences);
  }
}

// Separate helper for error fallback to avoid duplicate code
function getAIComparisonFallback(events, preferences) {
  const items = events.map(e => {
    let score = 55;
    if (preferences.favorite_categories?.includes(e.category_id)) score += 20;
    if (preferences.preferred_languages?.some(l => e.language?.includes(l))) score += 15;
    if (Number(e.price) <= Number(preferences.budget_preference)) score += 10;
    score = Math.max(65, Math.min(96, score));

    return {
      eventId: e.id,
      matchPercentage: score,
      bestFor: e.category_id === 'movies' ? 'Movie fans looking for cinematic comfort' : 'Event goers seeking live performance thrills',
      pros: ['Great central location venue', 'Highly interactive performance reviews'],
      cons: ['Slightly higher ticket service charge']
    };
  });
  const sorted = [...items].sort((a, b) => b.matchPercentage - a.matchPercentage);
  const bestItem = events.find(e => e.id === sorted[0].eventId);

  return {
    comparisons: items,
    recommendationSummary: `Based on your favorite entertainment interests, we recommend choosing "${bestItem.title}". It scores highest on your preferences with a ${sorted[0].matchPercentage}% AI Match.`,
    recommendedEventId: bestItem.id
  };
}

/**
 * Generates an AI Explanation on why a single event matches the user profile.
 */
export async function getSingleEventAIReason(event, preferences) {
  if (!ai) {
    // Generate intelligent local reason
    const favs = preferences.favorite_categories || [];
    const isFav = favs.includes(event.category_id);
    const fitBudget = Number(event.price) <= (Number(preferences.budget_preference) || 1000);
    
    if (isFav && fitBudget) {
      return `This fits your interest in ${event.genre} events and sits comfortably below your budget of ₹${preferences.budget_preference}.`;
    }
    if (isFav) {
      return `Recommended because you enjoy ${event.category_id} events, offering a top-rated performance by skilled artists.`;
    }
    if (fitBudget) {
      return `A budget-friendly escape priced at only ₹${Number(event.price)} with a highly-rated ${event.rating}/10 user approval rating.`;
    }
    return `A solid entertainment choice in ${event.venue_city} showing high booking interest from local audiences today.`;
  }

  const prompt = `
Explain why the following event matches this user profile:
Event:
- Title: ${event.title}
- Category: ${event.category_id}
- Genre: ${event.genre}
- Price: ₹${event.price}
- Rating: ${event.rating}
- Venue City: ${event.venue_city}

User Profile:
- Favorite Categories: ${JSON.stringify(preferences.favorite_categories)}
- Preferred Languages: ${JSON.stringify(preferences.preferred_languages)}
- Budget Preference: ₹${preferences.budget_preference}
- Additional Personalization Metrics: ${JSON.stringify(preferences.additional_preferences || {})}

Write a short, engaging, 1-2 sentence explanation in the second person ("This matches your preference because...") highlighting specific overlaps. Do not output JSON, just return raw text. Keep it brief.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt
    });
    return (response.text || '').trim();
  } catch (err) {
    console.warn('Gemini single reason failed, fallback to local:', err.message);
    const favs = preferences.favorite_categories || [];
    const isFav = favs.includes(event.category_id);
    return isFav 
      ? `This matches your preference for ${event.category_id} shows and has an outstanding rating of ${event.rating}/10.`
      : `Recommended choice in ${event.venue_city} matching the popular trending selections this week.`;
  }
}
