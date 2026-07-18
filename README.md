# BookMyShow AI Discovery

BookMyShow AI Discovery is a production-ready, full-stack entertainment ticket booking application prototype. It closely mirrors BookMyShow's flow, layout, and styling (specifically featuring the dark theme and brand red colors) while introducing two main AI-driven discovery innovations powered by the **Google Gemini API** and a **Supabase PostgreSQL** database.

---

## 🌟 Core Innovations

### 1. AI Occasion-Based Discovery Collections
Instead of showing static grids of movies, concerts, or standup gigs in isolation, the homepage displays dynamic, occasion-based shelves matching real-world scenarios:
*   *For You, Date Night, Weekend Plans, Need a Laugh, After Office Escape, Under ₹500, Under 2 Hours, Rainy Day Picks, Kids Friendly, etc.*

**How it works:**
*   A hybrid recommendation engine fetches active events in the selected city.
*   If a `GEMINI_API_KEY` is provided, the backend formats a request combining user profile preferences (languages, category tags, budget limits) and show parameters, asking Gemini to select matching events, write a witty explanation tagline, and score the match.
*   If the Gemini API key is missing or fails (due to rate-limiting), a smart, localized rule-based fallback system takes over, executing instant priority matches and scoring heuristic tags (language, price match, budget constraints) to keep the layout running smoothly with personalized match badges.

### 2. Cross-Category Compare Corner
Available throughout the app. Checkboxes on every event card and detail page allow users to select up to 3 events across *any* category (e.g., compare a Movie, a Standup Comedy Show, and an Escape Room Activity side-by-side).
*   Opens a side-by-side matrix page comparing Match %, Price, Duration, Venue details, Ratings, Language, "Best For" target audience, Pros, Cons, and a complete AI Recommendation Summary concluding with the absolute best choice and explanation reasoning.

---

## 📂 Project Structure

```
/
├── package.json                   # Root workspace package runner
├── README.md                      # Setup guidelines
├── backend/                       # Express server
│   ├── src/
│   │   ├── config/                # Database pool & Gemini configurations
│   │   ├── controllers/           # Endpoints for search, compare, bookings, user profile
│   │   ├── db/                    # schema.sql, init.js migration, and seed.js mock data
│   │   ├── middleware/            # Logging and errors
│   │   ├── routes/                # Express API router map
│   │   ├── services/              # Gemini AI recommendation service
│   │   └── server.js              # Server entry point
│   ├── package.json
│   └── .env.example
└── frontend/                      # React + Vite application
    ├── src/
    │   ├── components/            # Navbar, Footer, EventCard, CompareCornerDrawer, SkeletonLoader
    │   ├── context/               # Auth, Compare, Preferences, Booking state contexts
    │   ├── pages/                 # Home, EventDetail, CategoryPage, ComparePage, Search, BookingFlow, Profile, Bookings
    │   ├── App.jsx                # Router & base layouts
    │   ├── index.css              # Custom styling (shimmer animations, scrollbar overlays)
    │   └── main.jsx               # Bootstrap wrapper
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

---

## 🚀 Setup & Execution

### 1. Database Setup (Supabase)
1. Start an empty project in [Supabase](https://supabase.com/).
2. Copy your transaction connection string (Pooler) or direct connection string.
3. Example format: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:6543/postgres?pgbouncer=true`

### 2. Environment Configuration
Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
DATABASE_URL=your_supabase_postgresql_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Database Migration and Seeding
Run the initialization scripts from the root directory to automatically build the tables and insert mock events (movies, concerts, standup shows, activities, plays) spanning multiple cities (Mumbai, Delhi, Bengaluru, Pune) with future dates:
```bash
# Run schema table migrations
npm run db:init

# Run mock database seeding
npm run db:seed
```

### 4. Running the Dev Server
Launch both the Node backend (port 5000) and Vite React frontend (port 5173 with proxy mapping) concurrently using a single command from the root workspace folder:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Verification Checklist
*   **Health Check:** Run `curl http://localhost:5000/api/health` to confirm database connectivity status and Gemini configuration flags.
*   **Location Filters:** Switch cities in the top-right header dropdown (e.g., from Mumbai to Bengaluru) to see occasion shelves automatically filter local events.
*   **AI Personalization:** Go to `/profile`, alter budget limits (e.g., to ₹400) or check new category badges (e.g., Standup Comedy), and click Save. Notice the match percentage updates and occasion shelves dynamically reorder (e.g., "Need a Laugh" and "Under ₹500" rows bubble to the top of the homepage).
*   **Booking Checkouts:** Walk through selecting seat tags (Classic, Prime, or Recliners), review GST/convenience breakdowns, process a mock checkout, and review the final QR ticket advice screen.
