-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Events Table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    poster_url TEXT,
    banner_url TEXT,
    rating NUMERIC(3, 2) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    venue_name VARCHAR(255),
    venue_city VARCHAR(100),
    price NUMERIC(10, 2) NOT NULL,
    duration_mins INTEGER,
    language VARCHAR(100),
    event_date DATE,
    event_time VARCHAR(50),
    "cast" JSONB DEFAULT '[]'::jsonb,
    genre VARCHAR(100),
    reviews JSONB DEFAULT '[]'::jsonb,
    is_trending BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create Preferences Table
CREATE TABLE IF NOT EXISTS preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    favorite_categories JSONB DEFAULT '[]'::jsonb,
    preferred_languages JSONB DEFAULT '[]'::jsonb,
    preferred_cities JSONB DEFAULT '[]'::jsonb,
    budget_preference NUMERIC(10, 2) DEFAULT 1000.0,
    time_preference VARCHAR(50) DEFAULT 'evening',
    additional_preferences JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Saved Events Table
CREATE TABLE IF NOT EXISTS saved_events (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_saved_event UNIQUE (user_id, event_id)
);

-- Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    seats JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_price NUMERIC(10, 2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_date DATE NOT NULL,
    event_time VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed'
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(venue_city);
CREATE INDEX IF NOT EXISTS idx_saved_events_user ON saved_events(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_preferences_user ON preferences(user_id);
