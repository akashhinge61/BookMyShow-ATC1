import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL environment variable is missing.');
  process.exit(1);
}

const categories = [
  { id: 'movies', name: 'Movies' },
  { id: 'comedy', name: 'Comedy Shows' },
  { id: 'concerts', name: 'Concerts' },
  { id: 'sports', name: 'Sports' },
  { id: 'plays', name: 'Plays' },
  { id: 'activities', name: 'Activities' }
];

const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune'];

// Helper to generate future dates
const getFutureDate = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

const rawEvents = [
  // MOVIES
  {
    title: 'Inception: 4K Remastered',
    category_id: 'movies',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60',
    banner_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=60',
    rating: 8.8,
    rating_count: 12400,
    venue_name: 'PVR IMAX',
    price: 350.00,
    duration_mins: 148,
    language: 'English',
    days_ahead: 1,
    event_time: '19:30',
    genre: 'Sci-Fi/Thriller',
    is_trending: true,
    cast: [
      { name: 'Leonardo DiCaprio', role: 'Cobb' },
      { name: 'Joseph Gordon-Levitt', role: 'Arthur' },
      { name: 'Elliot Page', role: 'Ariadne' }
    ],
    reviews: [
      { user: 'Amit K.', rating: 9, text: 'Visual masterpiece. The remastered audio is incredible!' },
      { user: 'Sneha R.', rating: 8, text: 'Still mind-bending after all these years. Must watch in IMAX!' }
    ]
  },
  {
    title: 'Kantara: The Legend',
    category_id: 'movies',
    description: 'When greedy officers threaten the mystique of a village forest, a rebel Shiva rises to protect the sacred soil and the divine spirits of his ancestors.',
    poster_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=60',
    banner_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=60',
    rating: 9.1,
    rating_count: 45200,
    venue_name: 'Cinepolis',
    price: 180.00,
    duration_mins: 150,
    language: 'Hindi',
    days_ahead: 2,
    event_time: '21:00',
    genre: 'Action/Drama',
    is_trending: true,
    cast: [
      { name: 'Rishab Shetty', role: 'Shiva' },
      { name: 'Sapthami Gowda', role: 'Leela' }
    ],
    reviews: [
      { user: 'Rohan M.', rating: 10, text: 'The climax sequence left me goosebumps. Epic performance!' }
    ]
  },
  {
    title: 'Silent Whispers: Day One',
    category_id: 'movies',
    description: 'Experience the day the world went quiet. A survival horror thriller detailing the initial arrival of the sound-sensitive alien creatures in the bustling metropolis.',
    poster_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60',
    banner_url: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1200&auto=format&fit=crop&q=60',
    rating: 7.9,
    rating_count: 8900,
    venue_name: 'INOX Insignia',
    price: 499.00,
    duration_mins: 99,
    language: 'English',
    days_ahead: 3,
    event_time: '18:00',
    genre: 'Horror/Thriller',
    is_trending: false,
    cast: [
      { name: "Lupita Nyong'o", role: 'Sam' },
      { name: 'Joseph Quinn', role: 'Eric' }
    ],
    reviews: [
      { user: 'Varun S.', rating: 8, text: 'Incredibly intense. Short, tight pacing and solid jump scares.' }
    ]
  },

  // COMEDY
  {
    title: 'Anubhav Singh Bassi Live: Kisi Ko Batana Mat',
    category_id: 'comedy',
    description: 'Get ready for an evening of relentless laughter as Bassi shares hilarious stories from his school, college, and hosteller days. His raw energy and observational humor are unmatched!',
    poster_url: 'https://images.unsplash.com/photo-1585699324551-f6c309eed262?w=500&auto=format&fit=crop&q=60',
    banner_url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=1200&auto=format&fit=crop&q=60',
    rating: 9.4,
    rating_count: 15600,
    venue_name: 'NCPA Tata Theatre',
    price: 999.00,
    duration_mins: 90,
    language: 'Hindi',
    days_ahead: 4,
    event_time: '19:00',
    genre: 'Standup Comedy',
    is_trending: true,
    cast: [
      { name: 'Anubhav Singh Bassi', role: 'Comedian' }
    ],
    reviews: [
      { user: 'Karthik P.', rating: 10, text: 'Non-stop laughing! His storytelling is exceptionally relatable.' }
    ]
  },
  {
    title: 'Jokes Apart: Cozy Open Mic Special',
    category_id: 'comedy',
    description: 'Catch the best upcoming standup comics in the city testing their new material. A night full of raw, unfiltered jokes and surprise seasoned guest spots!',
    poster_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60',
    banner_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&auto=format&fit=crop&q=60',
    rating: 8.2,
    rating_count: 420,
    venue_name: 'The Comedy Club Cafe',
    price: 250.00,
    duration_mins: 75,
    language: 'English/Hindi',
    days_ahead: 1,
    event_time: '20:30',
    genre: 'Standup Comedy',
    is_trending: false,
    cast: [
      { name: 'Multiple Artists', role: 'Standup Performers' }
    ],
    reviews: [
      { user: 'Dev M.', rating: 8, text: 'Great vibe, cheap tickets. Under ₹500, perfect weekend hangout!' }
    ]
  },

  // CONCERTS
  {
    title: 'A.R. Rahman Live: Symphony of Hope',
    category_id: 'concerts',
    description: 'The legendary Mozart of Madras returns live on stage with a massive symphony orchestra, performing his greatest hits spanning three decades. A spectacular visual and musical extravaganza.',
    poster_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=60',
    banner_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=60',
    rating: 9.6,
    rating_count: 22800,
    venue_name: 'DY Patil Stadium',
    price: 1999.00,
    duration_mins: 180,
    language: 'Multilingual',
    days_ahead: 6,
    event_time: '18:00',
    genre: 'Symphony/Bollywood',
    is_trending: true,
    cast: [
      { name: 'A.R. Rahman', role: 'Lead Maestro' },
      { name: 'Jonita Gandhi', role: 'Vocalist' },
      { name: 'Haricharan', role: 'Vocalist' }
    ],
    reviews: [
      { user: 'Siddharth S.', rating: 10, text: 'Unbelievable atmosphere! Hearing Kun Faya Kun live was a spiritual journey.' }
    ]
  },
  {
    title: 'Acoustic Indie Nights: Rooftop Session',
    category_id: 'concerts',
    description: 'Unwind under the stars with cozy acoustic guitar tunes and soothing vocals from independent singer-songwriters. Includes a free drink on entry!',
    poster_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
    banner_url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=1200&auto=format&fit=crop&q=60',
    rating: 8.9,
    rating_count: 840,
    venue_name: 'Skyline Terrace Lounge',
    price: 450.00,
    duration_mins: 110,
    language: 'English/Hindi',
    days_ahead: 3,
    event_time: '19:30',
    genre: 'Acoustic/Indie Pop',
    is_trending: false,
    cast: [
      { name: 'Kabir & The Strings', role: 'Indie Band' }
    ],
    reviews: [
      { user: 'Radhika G.', rating: 9, text: 'Perfect date night spot. Quiet, beautiful music, and lovely breeze.' }
    ]
  },

  // SPORTS
  {
    title: 'IPL: Royal Challengers Bengaluru vs Mumbai Indians',
    category_id: 'sports',
    description: 'Watch the titans collide in this high-octane T20 match-up! Experience the electrifying atmosphere of the stadium, the roaring fans, and standard IPL entertainment live.',
    poster_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60',
    banner_url: 'https://images.unsplash.com/photo-1540747737956-3787233e5ad0?w=1200&auto=format&fit=crop&q=60',
    rating: 9.3,
    rating_count: 31200,
    venue_name: 'M. Chinnaswamy Stadium',
    price: 1500.00,
    duration_mins: 210,
    language: 'English/Hindi',
    days_ahead: 5,
    event_time: '19:00',
    genre: 'Cricket T20',
    is_trending: true,
    cast: [
      { name: 'Virat Kohli', role: 'Captain RCB' },
      { name: 'Hardik Pandya', role: 'Captain MI' }
    ],
    reviews: [
      { user: 'Rakesh B.', rating: 10, text: 'The energy at Chinnaswamy is completely unmatched! Fantastic match!' }
    ]
  },
  {
    title: 'ISL Football: Bengaluru FC vs Kerala Blasters',
    category_id: 'sports',
    description: 'The South Indian derby in the Indian Super League returns. Cheer for your favorite football stars as they fight for absolute supremacy on the pitch.',
    poster_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60',
    banner_url: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=1200&auto=format&fit=crop&q=60',
    rating: 8.5,
    rating_count: 5300,
    venue_name: 'Kanteerava Stadium',
    price: 300.00,
    duration_mins: 100,
    language: 'English',
    days_ahead: 2,
    event_time: '19:30',
    genre: 'Football / ISL',
    is_trending: false,
    cast: [
      { name: 'Sunil Chhetri', role: 'Forward BFC' }
    ],
    reviews: [
      { user: 'Adithya V.', rating: 9, text: 'West Block Blues made the stadium roar. Value for money tickets!' }
    ]
  },

  // PLAYS
  {
    title: 'Mughal-E-Azam: The Grand Stage Musical',
    category_id: 'plays',
    description: "Feroz Abbas Khan's theatrical tribute to the legendary cinematic masterpiece. Featuring grand sets, intricate costumes designed by Manish Malhotra, and classical live singing.",
    poster_url: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=500&auto=format&fit=crop&q=60',
    banner_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&auto=format&fit=crop&q=60',
    rating: 9.5,
    rating_count: 8100,
    venue_name: 'Jamshed Bhabha Theatre: NCPA',
    price: 1800.00,
    duration_mins: 150,
    language: 'Urdu/Hindi',
    days_ahead: 7,
    event_time: '18:30',
    genre: 'Musical/Drama',
    is_trending: true,
    cast: [
      { name: 'Priyanka Barve', role: 'Anarkali' },
      { name: 'Shahab Ali', role: 'Salim' }
    ],
    reviews: [
      { user: 'Leela S.', rating: 10, text: 'Pure art. The live classical singing is absolutely mesmerizing.' }
    ]
  },
  {
    title: 'The Play That Goes Wrong: Comedy Classic',
    category_id: 'plays',
    description: 'A hilarious Olivier Award-winning comedy about an amateur drama society trying to stage a murder mystery, where everything that can go wrong, does go wrong!',
    poster_url: 'https://images.unsplash.com/photo-1503095391755-112d0527c7e5?w=500&auto=format&fit=crop&q=60',
    banner_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&auto=format&fit=crop&q=60',
    rating: 9.0,
    rating_count: 2400,
    venue_name: 'St. Andrews Auditorium',
    price: 500.00,
    duration_mins: 120,
    language: 'English',
    days_ahead: 4,
    event_time: '17:00',
    genre: 'Slapstick Comedy Play',
    is_trending: false,
    cast: [
      { name: 'Rohan Joshi', role: 'Inspector Carter' }
    ],
    reviews: [
      { user: 'Sanjay T.', rating: 9, text: "Haven't laughed this hard in a theatre. Excellent physical comedy!" }
    ]
  },

  // ACTIVITIES
  {
    title: 'Clay Pottery & Glazing Workshop',
    category_id: 'activities',
    description: 'Learn the meditative art of wheel throwing and hand-building under the guidance of master potters. Take home your own hand-crafted, glazed clay planter or cup.',
    poster_url: 'https://images.unsplash.com/photo-1565192647048-f997ded87958?w=500&auto=format&fit=crop&q=60',
    banner_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=60',
    rating: 9.2,
    rating_count: 1100,
    venue_name: 'The Clay Studio',
    price: 499.00,
    duration_mins: 90,
    language: 'English',
    days_ahead: 1,
    event_time: '11:00',
    genre: 'Art & Craft Workshop',
    is_trending: false,
    cast: [
      { name: 'Anjali Shah', role: 'Master Potter' }
    ],
    reviews: [
      { user: 'Preeti D.', rating: 9, text: 'Extremely peaceful and tactile. Great setup and friendly teachers.' }
    ]
  },
  {
    title: 'Neon Paint & Wine Social Mixer',
    category_id: 'activities',
    description: 'An immersive social paint night where you paint glowing masterpieces using fluorescent paint under blacklight, while enjoying complimentary wine and upbeat ambient lounge tunes.',
    poster_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format&fit=crop&q=60',
    banner_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&auto=format&fit=crop&q=60',
    rating: 8.8,
    rating_count: 530,
    venue_name: 'Drip & Paint Lounge',
    price: 1200.00,
    duration_mins: 120,
    language: 'English/Hindi',
    days_ahead: 3,
    event_time: '18:00',
    genre: 'Painting / Social Mixer',
    is_trending: false,
    cast: [
      { name: 'Rohan Mehra', role: 'Art Facilitator' }
    ],
    reviews: [
      { user: 'Megha L.', rating: 9, text: 'Awesome vibes, delicious wine. Highly recommended for couples/friends!' }
    ]
  },
  {
    title: 'Virtual Reality Escape Room: Sci-Fi Odyssey',
    category_id: 'activities',
    description: 'Step into the future. Put on a state-of-the-art VR headset and solve space-themed, mind-bending puzzles with your team of up to 4 players. You only have 60 minutes to escape!',
    poster_url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=500&auto=format&fit=crop&q=60',
    banner_url: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=1200&auto=format&fit=crop&q=60',
    rating: 9.1,
    rating_count: 670,
    venue_name: 'HyperVR Arena',
    price: 750.00,
    duration_mins: 60,
    language: 'English',
    days_ahead: 2,
    event_time: '14:00',
    genre: 'Immersive VR Game',
    is_trending: true,
    cast: [
      { name: 'AI System Command', role: 'Narrator' }
    ],
    reviews: [
      { user: 'Sanjay P.', rating: 10, text: 'Mind-blowing immersion. It feels like you are actually floating in space.' }
    ]
  }
];

async function seedDatabase() {
  console.log('Seeding Database...');

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();

    try {
      // 1. Clean existing records
      console.log('Cleaning existing database records...');
      await client.query('DELETE FROM bookings');
      await client.query('DELETE FROM saved_events');
      await client.query('DELETE FROM preferences');
      await client.query('DELETE FROM events');
      await client.query('DELETE FROM users');
      await client.query('DELETE FROM categories');

      // Reset sequences
      await client.query('ALTER SEQUENCE IF EXISTS events_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE IF EXISTS bookings_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE IF EXISTS saved_events_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE IF EXISTS preferences_id_seq RESTART WITH 1');

      // 2. Insert Categories
      console.log('Inserting categories...');
      for (const cat of categories) {
        await client.query(
          'INSERT INTO categories (id, name) VALUES ($1, $2)',
          [cat.id, cat.name]
        );
      }

      // 3. Insert Events across all cities
      console.log('Inserting events across cities...');
      let eventCount = 0;
      for (const city of cities) {
        for (const raw of rawEvents) {
          const title = `${raw.title} (${city})`;
          const eventDate = getFutureDate(raw.days_ahead);

          await client.query(
            `INSERT INTO events (
              title, category_id, description, poster_url, banner_url, 
              rating, rating_count, venue_name, venue_city, price, 
              duration_mins, language, event_date, event_time, "cast", 
              genre, reviews, is_trending
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
            [
              title,
              raw.category_id,
              raw.description,
              raw.poster_url,
              raw.banner_url,
              raw.rating,
              raw.rating_count,
              `${raw.venue_name}, ${city}`,
              city,
              raw.price,
              raw.duration_mins,
              raw.language,
              eventDate,
              raw.event_time,
              JSON.stringify(raw.cast),
              raw.genre,
              JSON.stringify(raw.reviews),
              raw.is_trending
            ]
          );
          eventCount++;
        }
      }
      console.log(`Successfully seeded ${eventCount} events across 4 cities.`);

      // 4. Create standard Test User
      console.log('Creating standard test user...');
      const guestUserId = 'guest-test-user-id';
      await client.query(
        `INSERT INTO users (id, email, name) 
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING`,
        [guestUserId, 'guest@bookmyshow.ai', 'Guest Explorer']
      );

      // 5. Seed preferences for Test User
      console.log('Setting default preferences for test user...');
      await client.query(
        `INSERT INTO preferences (
          user_id, favorite_categories, preferred_languages, preferred_cities, budget_preference, time_preference
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          guestUserId,
          JSON.stringify(['movies', 'comedy', 'concerts']),
          JSON.stringify(['English', 'Hindi']),
          JSON.stringify(['Mumbai', 'Bengaluru']),
          800.00,
          'evening'
        ]
      );

      console.log('Database seeding completed successfully!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
