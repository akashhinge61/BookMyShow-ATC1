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

const cities = [
  'Mumbai', 'Pune', 'Delhi', 'Bengaluru', 'Hyderabad', 
  'Chennai', 'Ahmedabad', 'Kolkata', 'Nagpur', 'Nashik', 
  'Goa', 'Indore', 'Lucknow', 'Surat', 'Jaipur', 
  'Bhopal', 'Kochi', 'Mysuru', 'Chandigarh', 'Patna'
];

// Helper to generate future dates
const getFutureDate = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

const rawEvents = [
  // ------------------ MOVIES (5) ------------------
  {
    title: 'Kalki 2898 AD',
    category_id: 'movies',
    description: 'A modern avatar of Vishnu, a mythical figure, is believed to have descended to Earth to protect the world from evil forces in a futuristic setting.',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
    rating: 8.9,
    rating_count: 85200,
    venue_name: 'PVR Inox IMAX',
    price: 380.00,
    duration_mins: 180,
    language: 'Hindi',
    days_ahead: 1,
    event_time: '18:15',
    genre: 'Sci-Fi/Action',
    is_trending: true,
    cast: [
      { name: 'Prabhas', role: 'Bhairava' },
      { name: 'Amitabh Bachchan', role: 'Ashwatthama' },
      { name: 'Deepika Padukone', role: 'Sumati' }
    ],
    reviews: [
      { user: 'Rahul V.', rating: 10, text: 'Visually stunning! A spectacular mixture of Mahabharat myth and futuristic sci-fi.' },
      { user: 'Priya S.', rating: 8, text: 'Amitabh Bachchan stole the show. Great action sequences!' }
    ],
    metadata: {
      critics_rating: 8.6,
      distance_km: 3.2,
      age_suitability: 'UA',
      mood: 'Epic & Action-packed',
      best_for: 'Sci-Fi Fans & Families',
      highlights: ['IMAX 3D Experience', 'Stunning VFX', 'Mythological Connections'],
      pros: ['Exceptional cinematography', 'Powerful performances', 'Engaging mythological fusion'],
      cons: ['Slightly long runtime'],
      crew: [
        { name: 'Nag Ashwin', role: 'Director' },
        { name: 'Santhosh Narayanan', role: 'Music Director' }
      ],
      gallery: [
        'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80'
      ],
      offers: ['Buy 1 Get 1 Free on Axis Bank Cards', '20% off up to ₹150 with GPay']
    }
  },
  {
    title: 'Dune: Part Two',
    category_id: 'movies',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80',
    rating: 9.2,
    rating_count: 94000,
    venue_name: 'Cinepolis IMAX 3D',
    price: 450.00,
    duration_mins: 166,
    language: 'English',
    days_ahead: 2,
    event_time: '20:30',
    genre: 'Sci-Fi/Adventure',
    is_trending: true,
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides' },
      { name: 'Zendaya', role: 'Chani' },
      { name: 'Rebecca Ferguson', role: 'Lady Jessica' }
    ],
    reviews: [
      { user: 'Vikram A.', rating: 10, text: 'A cinematic masterpiece. Denis Villeneuve is a genius.' }
    ],
    metadata: {
      critics_rating: 9.5,
      distance_km: 4.8,
      age_suitability: 'UA',
      mood: 'Philosophical & Intense',
      best_for: 'Cinema Purists',
      highlights: ['Immersive Sound Design', 'Hans Zimmer Score', 'Grand Scale Cinematography'],
      pros: ['Masterful directing', 'Unbelievable sound engineering', 'Stunning desert landscapes'],
      cons: ['Slow-paced for general action fans'],
      crew: [
        { name: 'Denis Villeneuve', role: 'Director' },
        { name: 'Hans Zimmer', role: 'Composer' }
      ],
      gallery: [
        'https://images.unsplash.com/photo-1547127796-06bb04e4b315?w=600&auto=format&fit=crop&q=80'
      ],
      offers: ['Flat ₹100 Off with BookMyShow Stream Pass']
    }
  },
  {
    title: 'Shaitaan',
    category_id: 'movies',
    description: 'A family is held hostage at their remote farmhouse by a mysterious guest who possesses black magic capabilities.',
    poster_url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=1200&auto=format&fit=crop&q=80',
    rating: 8.2,
    rating_count: 42100,
    venue_name: 'Carnival Cinemas',
    price: 250.00,
    duration_mins: 132,
    language: 'Hindi',
    days_ahead: 3,
    event_time: '21:45',
    genre: 'Thriller/Horror',
    is_trending: false,
    cast: [
      { name: 'Ajay Devgn', role: 'Kabir' },
      { name: 'R. Madhavan', role: 'Anirudh' },
      { name: 'Jyotika', role: 'Kirti' }
    ],
    reviews: [
      { user: 'Sanjay K.', rating: 8, text: 'R. Madhavan is absolutely terrifying! Creepy and gripping thriller.' }
    ],
    metadata: {
      critics_rating: 7.8,
      distance_km: 2.1,
      age_suitability: 'A',
      mood: 'Tense & Suspenseful',
      best_for: 'Thriller Lovers',
      highlights: ['Chilling Performance by Madhavan', 'High-tension Script', 'Atmospheric Horror'],
      pros: ['Fabulous acting by lead cast', 'Edge-of-the-seat tension'],
      cons: ['Predictable climax', 'Some graphic horror tropes'],
      crew: [
        { name: 'Vikas Bahl', role: 'Director' },
        { name: 'Amit Trivedi', role: 'Music Composer' }
      ],
      gallery: [],
      offers: ['15% off up to ₹100 using PayZapp']
    }
  },
  {
    title: 'Inside Out 2',
    category_id: 'movies',
    description: 'Follow Riley, in her teenage years, encountering brand new Emotions like Anxiety, Envy, and Embarrassment.',
    poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=1200&auto=format&fit=crop&q=80',
    rating: 9.0,
    rating_count: 53000,
    venue_name: 'PVR Director\'s Cut',
    price: 320.00,
    duration_mins: 96,
    language: 'English',
    days_ahead: 4,
    event_time: '14:30',
    genre: 'Animation/Comedy',
    is_trending: true,
    cast: [
      { name: 'Amy Poehler', role: 'Joy (voice)' },
      { name: 'Maya Hawke', role: 'Anxiety (voice)' }
    ],
    reviews: [
      { user: 'Divya M.', rating: 9, text: 'Deeply emotional yet absolutely hilarious. Anxiety is so well portrayed!' }
    ],
    metadata: {
      critics_rating: 9.1,
      distance_km: 5.4,
      age_suitability: 'U',
      mood: 'Heartwarming & Fun',
      best_for: 'Kids & Families',
      highlights: ['Vibrant Animation', 'Relatable Mental Themes', 'Funny for all ages'],
      pros: ['Incredibly creative narrative', 'Witty script', 'Great voice acting'],
      cons: ['Similar structure to the first film'],
      crew: [
        { name: 'Kelsey Mann', role: 'Director' },
        { name: 'Andrea Datzman', role: 'Composer' }
      ],
      gallery: [],
      offers: ['Kids under 5 eat free at Food court with ticket']
    }
  },
  {
    title: 'Stree 2',
    category_id: 'movies',
    description: 'The town of Chanderi is haunted once again, this time by a headless entity named Sarkata. Stree returns to help.',
    poster_url: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=1200&auto=format&fit=crop&q=80',
    rating: 8.8,
    rating_count: 76000,
    venue_name: 'Miraj Cinemas',
    price: 280.00,
    duration_mins: 147,
    language: 'Hindi',
    days_ahead: 5,
    event_time: '19:15',
    genre: 'Comedy/Horror',
    is_trending: true,
    cast: [
      { name: 'Shraddha Kapoor', role: 'Unknown Girl' },
      { name: 'Rajkummar Rao', role: 'Vicky' },
      { name: 'Pankaj Tripathi', role: 'Rudra' }
    ],
    reviews: [
      { user: 'Aman G.', rating: 10, text: 'Pankaj Tripathi and Rajkummar Rao make a riot. Funnier than the first part!' }
    ],
    metadata: {
      critics_rating: 8.2,
      distance_km: 3.8,
      age_suitability: 'UA',
      mood: 'Hilarious & Spooky',
      best_for: 'Friends & Groups',
      highlights: ['Pankaj Tripathi\'s Comedy', 'Spooky Jump Scares', 'Great Cameos'],
      pros: ['Hilarious dialogues', 'Brilliant horror-comedy balance', 'Excellent cast chemistry'],
      cons: ['Slightly dragged second half'],
      crew: [
        { name: 'Amar Kaushik', role: 'Director' },
        { name: 'Sachin-Jigar', role: 'Music Directors' }
      ],
      gallery: [],
      offers: ['Buy 1 Get 1 free on SBI Elite Card']
    }
  },

  // ------------------ COMEDY SHOWS (5) ------------------
  {
    title: 'Zakir Khan: Tathastu',
    category_id: 'comedy',
    description: 'Zakir Khan shares personal stories of growth, family bonds, and the journey of becoming a man in his signature storytelling style.',
    poster_url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=1200&auto=format&fit=crop&q=80',
    rating: 9.5,
    rating_count: 32000,
    venue_name: 'Shanmukhananda Hall',
    price: 799.00,
    duration_mins: 90,
    language: 'Hindi',
    days_ahead: 1,
    event_time: '19:00',
    genre: 'Standup Comedy',
    is_trending: true,
    cast: [
      { name: 'Zakir Khan', role: 'Comedian' }
    ],
    reviews: [
      { user: 'Vikram S.', rating: 10, text: 'Tathastu made me laugh and cry. A storytelling masterclass!' }
    ],
    metadata: {
      critics_rating: 9.3,
      distance_km: 6.2,
      age_suitability: 'UA',
      mood: 'Emotional & Funny',
      best_for: 'Families & Couples',
      highlights: ['Signature Storytelling', 'Touching Family Tales', 'Relatable Desi Humor'],
      pros: ['Deeply touching storyline', 'Clean humor suitable for families'],
      cons: ['Less rapid-fire jokes, more focus on stories'],
      crew: [{ name: 'Zakir Khan', role: 'Writer' }],
      gallery: [],
      offers: ['10% off for bookings of 4 or more tickets']
    }
  },
  {
    title: 'Samay Raina: Unfiltered',
    category_id: 'comedy',
    description: 'Expect dark comedy, audience interaction, and chess references in this completely unscripted, unfiltered show.',
    poster_url: 'https://images.unsplash.com/photo-1585699324551-f6c309eed262?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=1200&auto=format&fit=crop&q=80',
    rating: 9.1,
    rating_count: 18000,
    venue_name: 'The Comedy Club',
    price: 499.00,
    duration_mins: 80,
    language: 'Hindi/English',
    days_ahead: 2,
    event_time: '21:00',
    genre: 'Dark Standup',
    is_trending: true,
    cast: [
      { name: 'Samay Raina', role: 'Comedian' }
    ],
    reviews: [
      { user: 'Harish P.', rating: 9, text: 'Witty crowd work! Be prepared to be roasted if you sit in the front row!' }
    ],
    metadata: {
      critics_rating: 8.8,
      distance_km: 1.5,
      age_suitability: 'A',
      mood: 'Bold & Interactive',
      best_for: 'College Students & Friends',
      highlights: ['Hilarious Crowd Work', 'Dark and Edgy Jokes', 'Chess Grandmaster Roasts'],
      pros: ['Highly interactive', 'Unpredictable show format'],
      cons: ['Not suitable for sensitive audiences or kids'],
      crew: [],
      gallery: [],
      offers: ['Free beverage on select VIP ticket tiers']
    }
  },
  {
    title: 'Abhishek Upmanyu: Toxic',
    category_id: 'comedy',
    description: 'Abhishek Upmanyu returns with a new show about self-destructive habits, relationship dynamics, and daily irritations.',
    poster_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1200&auto=format&fit=crop&q=80',
    rating: 9.3,
    rating_count: 24000,
    venue_name: 'Bal Gandharva Rang Mandir',
    price: 699.00,
    duration_mins: 75,
    language: 'Hindi',
    days_ahead: 3,
    event_time: '18:30',
    genre: 'Observational Comedy',
    is_trending: true,
    cast: [
      { name: 'Abhishek Upmanyu', role: 'Comedian' }
    ],
    reviews: [
      { user: 'Megha L.', rating: 9, text: 'Continuous laughter! His observations on standard daily activities are priceless.' }
    ],
    metadata: {
      critics_rating: 9.0,
      distance_km: 4.5,
      age_suitability: 'UA',
      mood: 'Sarcastic & Witty',
      best_for: 'Young Adults & Friends',
      highlights: ['Observational Masterclass', 'Rapid Fire Delivery', 'Pet Peeve Jokes'],
      pros: ['Non-stop laughs', 'Extremely relateable scripts'],
      cons: ['Can feel a bit fast-paced'],
      crew: [],
      gallery: [],
      offers: ['Flat ₹50 cashback using Amazon Pay']
    }
  },
  {
    title: 'Vir Das: Mind Fool Tour',
    category_id: 'comedy',
    description: 'Emmy award winner Vir Das performs his new stand-up special exploring global politics, Indian traditions, and human folly.',
    poster_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1482575832494-771f74bf6857?w=1200&auto=format&fit=crop&q=80',
    rating: 8.9,
    rating_count: 12000,
    venue_name: 'Royal Opera House',
    price: 1500.00,
    duration_mins: 95,
    language: 'English',
    days_ahead: 4,
    event_time: '20:00',
    genre: 'Satire/Intellectual Comedy',
    is_trending: false,
    cast: [
      { name: 'Vir Das', role: 'Comedian' }
    ],
    reviews: [
      { user: 'Kunal R.', rating: 9, text: 'Intellectual, satirical, and highly entertaining. A global quality performance.' }
    ],
    metadata: {
      critics_rating: 9.1,
      distance_km: 7.2,
      age_suitability: 'A',
      mood: 'Satirical & Smart',
      best_for: 'Global comedy lovers',
      highlights: ['Award Winning Comedy', 'Political Satire', 'Premium Venue Setup'],
      pros: ['Polished international level content', 'Thought provoking jokes'],
      cons: ['High ticket price tier'],
      crew: [],
      gallery: [],
      offers: ['Exclusive bookmyshow stream coupon with every ticket']
    }
  },
  {
    title: 'Comicstaan Live',
    category_id: 'comedy',
    description: 'A stellar night of live improv and experimental comedy featuring winners and popular faces from the hit show Comicstaan.',
    poster_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&auto=format&fit=crop&q=80',
    rating: 8.7,
    rating_count: 8900,
    venue_name: 'Hard Rock Cafe',
    price: 350.00,
    duration_mins: 110,
    language: 'Hindi/English',
    days_ahead: 5,
    event_time: '20:30',
    genre: 'Improv Comedy',
    is_trending: false,
    cast: [
      { name: 'Rahul Subramanian', role: 'Host' },
      { name: 'Aashish Solanki', role: 'Performer' },
      { name: 'Shreeja Chaturvedi', role: 'Performer' }
    ],
    reviews: [
      { user: 'Nitesh B.', rating: 8, text: 'Improv games were hilarious. Rahul Subramanian hosts it with great wit.' }
    ],
    metadata: {
      critics_rating: 8.4,
      distance_km: 2.8,
      age_suitability: 'UA',
      mood: 'Lighthearted & Chaotic',
      best_for: 'After-Work Chill',
      highlights: ['Improv Games', 'Dynamic Standup Mix', 'Live Music Integration'],
      pros: ['Casual cafe environment', 'Diverse set of comedians'],
      cons: ['Unpredictable comedy standard since it is live improv'],
      crew: [],
      gallery: [],
      offers: ['Happy hour prices on drinks till 8:00 PM']
    }
  },

  // ------------------ CONCERTS (5) ------------------
  {
    title: 'Diljit Dosanjh: Dil-Luminati Tour',
    category_id: 'concerts',
    description: 'Global superstar Diljit Dosanjh is bringing the massive Dil-Luminati arena experience to India. Punjabi pop like never before.',
    poster_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    rating: 9.8,
    rating_count: 145000,
    venue_name: 'DY Patil Stadium',
    price: 2499.00,
    duration_mins: 180,
    language: 'Punjabi',
    days_ahead: 1,
    event_time: '18:00',
    genre: 'Punjabi Pop',
    is_trending: true,
    cast: [
      { name: 'Diljit Dosanjh', role: 'Lead Vocalist' }
    ],
    reviews: [
      { user: 'Simran J.', rating: 10, text: 'Unbelievable energy! The production scale, backup dancers, and Diljit was phenomenal.' }
    ],
    metadata: {
      critics_rating: 9.7,
      distance_km: 12.5,
      age_suitability: 'UA',
      mood: 'High-Energy Dance Pop',
      best_for: 'Party Lovers & Punjabi Beats Fans',
      highlights: ['Stadium Scale Production', 'Backup Dancers from UK', 'Pyrotechnic & Laser Show'],
      pros: ['Incredible crowd energy', ' Diljit\'s charming stage presence', 'Top-tier sound quality'],
      cons: ['Heavy traffic congestion expected outside stadium'],
      crew: [
        { name: 'Diljit Dosanjh', role: 'Show Creator' }
      ],
      gallery: [],
      offers: ['Free parking validation with Platinum VIP tickets']
    }
  },
  {
    title: 'Arijit Singh: Live Symphony',
    category_id: 'concerts',
    description: 'Experience Bollywood\'s romantic voice live with a massive 50-piece orchestral symphony. Melodic and emotional.',
    poster_url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&auto=format&fit=crop&q=80',
    rating: 9.6,
    rating_count: 98000,
    venue_name: 'Jio Gardens',
    price: 1999.00,
    duration_mins: 150,
    language: 'Hindi',
    days_ahead: 2,
    event_time: '19:30',
    genre: 'Bollywood Melodies',
    is_trending: true,
    cast: [
      { name: 'Arijit Singh', role: 'Lead Singer' }
    ],
    reviews: [
      { user: 'Neha T.', rating: 10, text: 'He sang for 3 hours straight! Chanda Mea and Tum Hi Ho live gave me goosebumps.' }
    ],
    metadata: {
      critics_rating: 9.5,
      distance_km: 6.8,
      age_suitability: 'UA',
      mood: 'Soulful & Romantic',
      best_for: 'Couples & Family',
      highlights: ['50-piece Live Orchestra', '3-Hour Performance Block', 'Acoustic Medley Section'],
      pros: ['Phenomenal vocals', 'Beautiful orchestral arrangement'],
      cons: ['Standing zones can get extremely crowded'],
      crew: [],
      gallery: [],
      offers: ['10% discount on HDFC Credit cards']
    }
  },
  {
    title: 'Coldplay: Music of the Spheres',
    category_id: 'concerts',
    description: 'Global icons Coldplay are bringing their spectacular visual tour featuring eco-friendly LED wristbands and hit singles.',
    poster_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&auto=format&fit=crop&q=80',
    rating: 9.9,
    rating_count: 220000,
    venue_name: 'Narendra Modi Stadium',
    price: 3500.00,
    duration_mins: 140,
    language: 'English',
    days_ahead: 3,
    event_time: '19:00',
    genre: 'Alternative Rock',
    is_trending: true,
    cast: [
      { name: 'Chris Martin', role: 'Lead Vocalist' },
      { name: 'Jonny Buckland', role: 'Guitarist' }
    ],
    reviews: [
      { user: 'Samir D.', rating: 10, text: 'The greatest live show on earth. The LED wristbands sync with the music perfectly!' }
    ],
    metadata: {
      critics_rating: 9.9,
      distance_km: 11.2,
      age_suitability: 'U',
      mood: 'Cosmic & Magical',
      best_for: 'All Audiences',
      highlights: ['Interactive LED Wristbands', 'Eco-friendly Power generation', 'Fireworks & Confetti Showers'],
      pros: ['Mind-blowing visual choreography', 'Timeless hit song catalog'],
      cons: ['Tickets sell out in seconds'],
      crew: [],
      gallery: [],
      offers: ['BMS exclusive Coldplay Tour merchandise included for VIP tickets']
    }
  },
  {
    title: 'Sunburn Arena ft. Martin Garrix',
    category_id: 'concerts',
    description: 'The world\'s #1 DJ Martin Garrix returns to headline Sunburn Arena with electric dance music beats and high-octane bass.',
    poster_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
    rating: 9.0,
    rating_count: 45000,
    venue_name: 'GMR Arena',
    price: 1200.00,
    duration_mins: 240,
    language: 'English',
    days_ahead: 4,
    event_time: '17:00',
    genre: 'Electronic Dance Music',
    is_trending: false,
    cast: [
      { name: 'Martin Garrix', role: 'DJ Headliner' }
    ],
    reviews: [
      { user: 'Siddharth M.', rating: 9, text: 'Non-stop jumping! The lasers and bass levels were fantastic.' }
    ],
    metadata: {
      critics_rating: 8.9,
      distance_km: 8.5,
      age_suitability: 'A',
      mood: 'Electric & Kinetic',
      best_for: 'Party Animals & Dance fans',
      highlights: ['State-of-the-art Laser show', 'Outdoor Rave setup', 'Massive bass systems'],
      pros: ['Awesome support DJs line-up', 'Spacious open-air layout'],
      cons: ['Age restriction (18+ only)', 'Exhausting standing duration']
    }
  },
  {
    title: 'Prateek Kuhad: Silhouettes Tour',
    category_id: 'concerts',
    description: 'Indie darling Prateek Kuhad performs his soft, emotional acoustic melodies live. Ideal for cozy winter vibes.',
    poster_url: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f2c6d?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1484755560693-a4074577af3a?w=1200&auto=format&fit=crop&q=80',
    rating: 8.7,
    rating_count: 14000,
    venue_name: 'Phoenix Marketcity Amphitheatre',
    price: 999.00,
    duration_mins: 120,
    language: 'Hindi/English',
    days_ahead: 5,
    event_time: '19:00',
    genre: 'Indie Pop/Acoustic',
    is_trending: false,
    cast: [
      { name: 'Prateek Kuhad', role: 'Guitarist & Singer' }
    ],
    reviews: [
      { user: 'Arushi G.', rating: 9, text: 'So intimate. Beautiful acoustics. Cold/Mess live was dreamy.' }
    ],
    metadata: {
      critics_rating: 8.6,
      distance_km: 5.1,
      age_suitability: 'UA',
      mood: 'Mellow & Romantic',
      best_for: 'Date Night Couples',
      highlights: ['Candlelight Atmosphere', 'Acoustic Guitar solos', 'Cozy Amphitheatre seating'],
      pros: ['Relaxed seating layout', 'Intimate connection with artist'],
      cons: ['Fewer energetic pop dance beats']
    }
  },

  // ------------------ SPORTS (5) ------------------
  {
    title: 'IPL: Mumbai Indians vs Chennai Super Kings',
    category_id: 'sports',
    description: 'The ultimate rivalry in Indian cricket. Witness Rohit Sharma\'s MI clash with MS Dhoni\'s CSK live.',
    poster_url: 'https://images.unsplash.com/photo-1540747737956-3787233e5ad0?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80',
    rating: 9.7,
    rating_count: 185000,
    venue_name: 'Wankhede Stadium',
    price: 1500.00,
    duration_mins: 210,
    language: 'English/Hindi',
    days_ahead: 1,
    event_time: '19:30',
    genre: 'Cricket T20',
    is_trending: true,
    cast: [
      { name: 'Rohit Sharma', role: 'MI Skipper' },
      { name: 'Ruturaj Gaikwad', role: 'CSK Skipper' }
    ],
    reviews: [
      { user: 'Amit S.', rating: 10, text: 'Wankhede is a blue sea of fans. The atmosphere is electric. Best IPL match ever!' }
    ],
    metadata: {
      critics_rating: 9.6,
      distance_km: 4.1,
      age_suitability: 'Family',
      mood: 'Competitive & Loud',
      best_for: 'Sports Fanatics',
      highlights: ['El Clasico of Cricket', 'Vibrant Stadium chants', 'High boundary match'],
      pros: ['Action packed T20 cricket', 'Celebrity spotting', 'Iconic Wankhede sunset view'],
      cons: ['Very expensive food inside stadium']
    }
  },
  {
    title: 'Pro Kabaddi League Championship',
    category_id: 'sports',
    description: 'High stakes Kabaddi action. Watch the top two teams battle for the ultimate championship cup.',
    poster_url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80',
    rating: 8.9,
    rating_count: 14000,
    venue_name: 'Shree Shiv Chhatrapati Sports Complex',
    price: 350.00,
    duration_mins: 90,
    language: 'Hindi',
    days_ahead: 2,
    event_time: '19:00',
    genre: 'Kabaddi League',
    is_trending: false,
    cast: [
      { name: 'Pawan Sehrawat', role: 'Raider' },
      { name: 'Fazel Atrachali', role: 'Defender' }
    ],
    reviews: [
      { user: 'Kiran D.', rating: 9, text: 'Fast-paced matches. Much better than watching on TV. Raiders were in top form!' }
    ],
    metadata: {
      critics_rating: 8.8,
      distance_km: 9.3,
      age_suitability: 'Family',
      mood: 'Thrilling & Quick',
      best_for: 'Indie Sports Enthusiasts',
      highlights: ['Mat Side Seating Slots', 'National level Raiders', 'Intense Tackles'],
      pros: ['High-speed continuous game action', 'Great value ticket price'],
      cons: ['Indoor stadium can get stuffy']
    }
  },
  {
    title: 'ISL Football Derby',
    category_id: 'sports',
    description: 'Bengaluru FC hosts Kolkata giants Mohun Bagan SG in a classic Indian football derby match.',
    poster_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1200&auto=format&fit=crop&q=80',
    rating: 8.6,
    rating_count: 11000,
    venue_name: 'Kanteerava Stadium',
    price: 250.00,
    duration_mins: 100,
    language: 'English',
    days_ahead: 3,
    event_time: '17:30',
    genre: 'Football Derby',
    is_trending: false,
    cast: [
      { name: 'Sunil Chhetri', role: 'BFC Striker' },
      { name: 'Dimitri Petratos', role: 'MBSG Midfielder' }
    ],
    reviews: [
      { user: 'Tony G.', rating: 8, text: 'The West Block Blues section created an incredible chant environment!' }
    ],
    metadata: {
      critics_rating: 8.2,
      distance_km: 1.2,
      age_suitability: 'U',
      mood: 'Passionate & Active',
      best_for: 'Football Fan Clubs',
      highlights: ['Sunil Chhetri\'s Home Match', 'West Block Blues Fan Stand', 'Classic rivalry'],
      pros: ['Very cheap tickets', 'Central city location'],
      cons: ['Rain can cause match delay (open air)']
    }
  },
  {
    title: 'Red Bull Soapbox Race',
    category_id: 'sports',
    description: 'A national event where amateur drivers race homemade soapbox vehicles down a steep, obstacle-filled ramp.',
    poster_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80',
    rating: 9.1,
    rating_count: 17000,
    venue_name: 'Bandra Reclamation Hill',
    price: 499.00,
    duration_mins: 180,
    language: 'English/Hindi',
    days_ahead: 4,
    event_time: '15:00',
    genre: 'Soapbox Racing/Exotic',
    is_trending: true,
    cast: [],
    reviews: [
      { user: 'Vikash P.', rating: 9, text: 'Crazy vehicle designs. The crashes were spectacular but everyone was safe. Super fun day out!' }
    ],
    metadata: {
      critics_rating: 9.0,
      distance_km: 5.6,
      age_suitability: 'U',
      mood: 'Crazy & Fun',
      best_for: 'Families & Friends Outings',
      highlights: ['Bizarre homemade cars', 'Obstacle ramp crashes', 'Red Bull energy zones'],
      pros: ['Extremely humorous event', 'Highly interactive crowd layout'],
      cons: ['No fixed seats, standing on hillside only']
    }
  },
  {
    title: 'Tata Mumbai Marathon',
    category_id: 'sports',
    description: 'India\'s largest run event. Book tickets to register for the Half Marathon (21K) or the Dream Run (6K).',
    poster_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=1200&auto=format&fit=crop&q=80',
    rating: 9.3,
    rating_count: 38000,
    venue_name: 'Chhatrapati Shivaji Terminal Start Point',
    price: 800.00,
    duration_mins: 300,
    language: 'Multilingual',
    days_ahead: 5,
    event_time: '05:00',
    genre: 'Marathon/Running',
    is_trending: false,
    cast: [],
    reviews: [
      { user: 'Ramesh G.', rating: 10, text: 'Exhausting but the sea link view during sunrise was worth every drop of sweat.' }
    ],
    metadata: {
      critics_rating: 9.2,
      distance_km: 0.1,
      age_suitability: 'UA',
      mood: 'Inspiring & Athletic',
      best_for: 'Fitness Enthusiasts',
      highlights: ['Cross Rajiv Gandhi Sea Link', 'Official Running Jersey included', 'Medal at finish line'],
      pros: ['Amazing community spirit', 'Includes complete medical and hydration support'],
      cons: ['Very early start time (5:00 AM)']
    }
  },

  // ------------------ PLAYS (5) ------------------
  {
    title: 'Mughal-e-Azam: The Musical',
    category_id: 'plays',
    description: 'The monumental theatrical tribute based on K. Asif\'s cinema masterpiece. Gorgeous costumes and live classical singing.',
    poster_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&auto=format&fit=crop&q=80',
    rating: 9.6,
    rating_count: 21000,
    venue_name: 'Nita Mukesh Ambani Cultural Centre (NMACC)',
    price: 1200.00,
    duration_mins: 150,
    language: 'Hindi/Urdu',
    days_ahead: 1,
    event_time: '19:30',
    genre: 'Broadway Musical Drama',
    is_trending: true,
    cast: [
      { name: 'Priyanka Barve', role: 'Anarkali' },
      { name: 'Sunil Kumar', role: 'Akbar' }
    ],
    reviews: [
      { user: 'Gouri V.', rating: 10, text: 'Magnificent! Live singing, Manish Malhotra costumes, and Broadway style scale. NMACC stage is world class.' }
    ],
    metadata: {
      critics_rating: 9.6,
      distance_km: 7.5,
      age_suitability: 'U',
      mood: 'Grand & Classical',
      best_for: 'Art & Theatre Lovers',
      highlights: ['Manish Malhotra Designer Costumes', 'Live Classical singing', 'Grand NMACC Stage setting'],
      pros: ['Stunning design visual aesthetic', 'Exceptional vocal standards'],
      cons: ['High ticket pricing tiers']
    }
  },
  {
    title: 'Chanakya',
    category_id: 'plays',
    description: 'Actor Manoj Joshi portrays the legendary political strategist Chanakya in this critically acclaimed historical drama play.',
    poster_url: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80',
    rating: 9.2,
    rating_count: 8500,
    venue_name: 'Nehru Centre Auditorium',
    price: 400.00,
    duration_mins: 120,
    language: 'Hindi',
    days_ahead: 2,
    event_time: '18:00',
    genre: 'Historical Drama Play',
    is_trending: false,
    cast: [
      { name: 'Manoj Joshi', role: 'Chanakya' }
    ],
    reviews: [
      { user: 'Aditya S.', rating: 9, text: 'Manoj Joshi\'s monologues on politics and statecraft are outstanding!' }
    ],
    metadata: {
      critics_rating: 8.9,
      distance_km: 3.5,
      age_suitability: 'UA',
      mood: 'Intellectual & Historical',
      best_for: 'History buffs & Seniors',
      highlights: ['Powerful Manoj Joshi monologue', 'Timeless strategic lessons', 'Period set designs'],
      pros: ['Brilliant dialogue delivery', 'Educational storylines'],
      cons: ['Heavy language vocab might be difficult for youngsters']
    }
  },
  {
    title: 'Hamlet',
    category_id: 'plays',
    description: 'Shakespeare\'s classic tragedy Hamlet, adapted with a modern experimental setup and intense drama elements.',
    poster_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&auto=format&fit=crop&q=80',
    rating: 8.5,
    rating_count: 5300,
    venue_name: 'Prithvi Theatre',
    price: 300.00,
    duration_mins: 135,
    language: 'English',
    days_ahead: 3,
    event_time: '20:00',
    genre: 'Classical Drama',
    is_trending: false,
    cast: [
      { name: 'Ira Dubey', role: 'Ophelia' },
      { name: 'Jim Sarbh', role: 'Hamlet' }
    ],
    reviews: [
      { user: 'Pramod M.', rating: 9, text: 'Jim Sarbh plays Hamlet with a chaotic, brilliant energy. Prithvi Theatre setting is so cozy.' }
    ],
    metadata: {
      critics_rating: 8.7,
      distance_km: 1.8,
      age_suitability: 'UA',
      mood: 'Intense & Dark',
      best_for: 'Drama students',
      highlights: ['Jim Sarbh as Hamlet', 'Intimate Prithvi Theatre acoustics', 'Avant-garde staging'],
      pros: ['Outstanding character acting', 'Iconic theatre venue visit'],
      cons: ['Intense themes (tragedy)']
    }
  },
  {
    title: 'Shivaji Maharaj: Shantecha Abhang',
    category_id: 'plays',
    description: 'A grand Marathi historical play showcasing the values of peace and diplomacy during Shivaji Maharaj\'s reign.',
    poster_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&auto=format&fit=crop&q=80',
    rating: 9.4,
    rating_count: 14000,
    venue_name: 'Yashwantrao Chavan Natyagruh',
    price: 250.00,
    duration_mins: 140,
    language: 'Marathi',
    days_ahead: 4,
    event_time: '17:00',
    genre: 'Historical Drama Play',
    is_trending: true,
    cast: [
      { name: 'Amol Kolhe', role: 'Shivaji Maharaj' }
    ],
    reviews: [
      { user: 'Tanvi P.', rating: 10, text: 'Amol Kolhe looks exactly like Maharaj. The crowd gave standing ovations!' }
    ],
    metadata: {
      critics_rating: 9.0,
      distance_km: 2.5,
      age_suitability: 'U',
      mood: 'Patriotic & Inspiring',
      best_for: 'Maharashtrian Families',
      highlights: ['Amol Kolhe as Shivaji Maharaj', 'Traditional Powada songs live', 'Historical armor replicas'],
      pros: ['Very inspiring play', 'Great pricing value'],
      cons: ['Marathi language only']
    }
  },
  {
    title: 'Dear Father',
    category_id: 'plays',
    description: 'Veteran actor Paresh Rawal stars in this popular mystery-drama exploring modern family values and relationships.',
    poster_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80',
    rating: 9.3,
    rating_count: 16000,
    venue_name: 'Tata Theatre NCPA',
    price: 600.00,
    duration_mins: 130,
    language: 'Gujarati/Hindi',
    days_ahead: 5,
    event_time: '19:00',
    genre: 'Family Drama/Mystery',
    is_trending: false,
    cast: [
      { name: 'Paresh Rawal', role: 'Father/Inspector' }
    ],
    reviews: [
      { user: 'Kirti J.', rating: 9, text: 'Paresh Rawal shows his brilliance. It has both humor and a deep social message.' }
    ],
    metadata: {
      critics_rating: 9.1,
      distance_km: 6.5,
      age_suitability: 'UA',
      mood: 'Suspenseful & Emotional',
      best_for: 'Joint Families',
      highlights: ['Paresh Rawal in Dual Tone role', 'Suspenseful Plot twist', 'NCPA sea view venue'],
      pros: ['Excellent mix of comedy and mystery', 'Relatable generational conflict topic'],
      cons: ['Staged mainly in Gujarati (some Hindi version shows)']
    }
  },

  // ------------------ ACTIVITIES (5) ------------------
  {
    title: 'Imagicaa Theme Park Pass',
    category_id: 'activities',
    description: 'An international standard theme park offering roller coasters, water slides, thematic restaurants and fun rides.',
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
    rating: 8.8,
    rating_count: 64000,
    venue_name: 'Imagicaa Theme Park (Khopoli)',
    price: 1499.00,
    duration_mins: 480,
    language: 'Multilingual',
    days_ahead: 1,
    event_time: '10:00',
    genre: 'Theme Park/Rides',
    is_trending: true,
    cast: [],
    reviews: [
      { user: 'Neha A.', rating: 9, text: 'Nitro is the most extreme coaster in India! Nitro ride is worth the ticket price.' }
    ],
    metadata: {
      critics_rating: 8.5,
      distance_km: 45.0,
      age_suitability: 'Family',
      mood: 'Adrenaline & Joyous',
      best_for: 'Weekend Family Getaway',
      highlights: ['Nitro: India\'s fastest roller coaster', 'Indoor Theme Rides', 'Grand Imagicaa Parade'],
      pros: ['Full day entertainment', 'Rides for all age groups'],
      cons: ['Far from city center', 'Long queues during weekends']
    }
  },
  {
    title: 'Mystery Rooms: Escape Quest',
    category_id: 'activities',
    description: 'A physical adventure game where players solve puzzles using clues and hints to escape a locked room in 60 minutes.',
    poster_url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&auto=format&fit=crop&q=80',
    rating: 9.2,
    rating_count: 9800,
    venue_name: 'Mystery Rooms Outlets',
    price: 650.00,
    duration_mins: 60,
    language: 'English/Hindi',
    days_ahead: 2,
    event_time: '12:00',
    genre: 'Escape Room Adventure',
    is_trending: false,
    cast: [],
    reviews: [
      { user: 'Joy D.', rating: 10, text: 'Locked Cabin room was so challenging. We escaped with just 2 minutes remaining! Super fun team activity.' }
    ],
    metadata: {
      critics_rating: 8.8,
      distance_km: 2.3,
      age_suitability: 'UA',
      mood: 'Challenging & Mystery',
      best_for: 'Friends & Corporate Teams',
      highlights: ['60-Minute Escape Window', 'Live Interactive Props', 'Multiple Difficulty levels'],
      pros: ['Great brain-teaser', 'High team coordination required'],
      cons: ['Not ideal for claustrophobic people']
    }
  },
  {
    title: 'Pottery & Clay Sculpting Workshop',
    category_id: 'activities',
    description: 'Learn the basic techniques of pottery wheel throwing, hand building, and decorating clay objects.',
    poster_url: 'https://images.unsplash.com/photo-1565192647048-f997ded879ab?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1200&auto=format&fit=crop&q=80',
    rating: 8.6,
    rating_count: 3400,
    venue_name: 'The Art Studio',
    price: 500.00,
    duration_mins: 120,
    language: 'English/Hindi',
    days_ahead: 3,
    event_time: '15:30',
    genre: 'Art & Crafts/Workshop',
    is_trending: false,
    cast: [],
    reviews: [
      { user: 'Sanya H.', rating: 9, text: 'Very relaxing and therapeutic. I got to keep my clay cup that I made!' }
    ],
    metadata: {
      critics_rating: 8.4,
      distance_km: 1.5,
      age_suitability: 'U',
      mood: 'Calm & Creative',
      best_for: 'Solo & Couples DIY',
      highlights: ['Live pottery wheel practice', 'Clay tools included', 'Take home your artwork'],
      pros: ['Relaxing environment', 'No prior experience required'],
      cons: ['Clothes can get messy (apron provided)']
    }
  },
  {
    title: 'Smaaash VR & Gaming Zone Pass',
    category_id: 'activities',
    description: 'Access virtual reality games, laser tag, arcade machines, and twilight bowling alleys at Smaaash.',
    poster_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
    rating: 8.9,
    rating_count: 15000,
    venue_name: 'Smaaash Center',
    price: 899.00,
    duration_mins: 180,
    language: 'English/Hindi',
    days_ahead: 4,
    event_time: '14:00',
    genre: 'Arcade & Virtual Reality',
    is_trending: true,
    cast: [],
    reviews: [
      { user: 'Pavan R.', rating: 9, text: 'VR cricket match was so realistic. Great twilight bowling lanes.' }
    ],
    metadata: {
      critics_rating: 8.6,
      distance_km: 4.2,
      age_suitability: 'U',
      mood: 'Active & Interactive',
      best_for: 'Gamers & Birthday Parties',
      highlights: ['VR cricket simulator', 'Neon Bowling lanes', 'Laser Tag arena'],
      pros: ['Wide variety of games', 'Includes buffet food coupon on select passes'],
      cons: ['Can get noisy during rush hours']
    }
  },
  {
    title: 'Midnight Cycling Coastal Ride',
    category_id: 'activities',
    description: 'Explore the scenic sea link coastal road on a bicycle under the starry night sky. Refreshments provided.',
    poster_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=1200&auto=format&fit=crop&q=80',
    rating: 9.0,
    rating_count: 4200,
    venue_name: 'Marine Drive Start Point',
    price: 399.00,
    duration_mins: 240,
    language: 'Hindi/English',
    days_ahead: 5,
    event_time: '23:30',
    genre: 'Cycling & Sightseeing',
    is_trending: false,
    cast: [],
    reviews: [
      { user: 'Zaid S.', rating: 9, text: 'Cycling through empty midnight streets of Colaba was therapeutic. Great midnight snack stop!' }
    ],
    metadata: {
      critics_rating: 8.8,
      distance_km: 0.5,
      age_suitability: 'UA',
      mood: 'Adventure & Chill',
      best_for: 'Midnight explorers',
      highlights: ['Ride along Marine Drive sea shore', 'Bicycle & Helmet rental included', 'Midnight energy drinks & snacks'],
      pros: ['Empty roads, pleasant weather', 'Great social event to meet people'],
      cons: ['Requires physical stamina for 15KM cycling']
    }
  }
];

async function seedDatabase() {
  console.log('Seeding Database with expanded BMS data...');

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();

    try {
      // 1. Clean existing records to allow re-seeding without duplicate keys
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

      // 3. Insert Events across all 20 cities
      console.log(`Inserting events across ${cities.length} cities...`);
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
              genre, reviews, is_trending, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
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
              raw.is_trending,
              JSON.stringify(raw.metadata || {})
            ]
          );
          eventCount++;
        }
      }
      console.log(`Successfully seeded ${eventCount} events across 20 cities.`);

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
          user_id, favorite_categories, preferred_languages, preferred_cities, budget_preference, time_preference, additional_preferences
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          guestUserId,
          JSON.stringify(['movies', 'comedy', 'concerts']),
          JSON.stringify(['English', 'Hindi']),
          JSON.stringify(['Mumbai', 'Bengaluru']),
          1200.00,
          'evening',
          JSON.stringify({
            favorite_genres: ['Sci-Fi/Action', 'Comedy', 'Standup Comedy'],
            accessibility: false,
            parking: true,
            food: true,
            premium_seating: false,
            kids_friendly: false,
            date_night: false,
            friends: true,
            weekend_only: true
          })
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
