import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL environment variable is missing.');
  process.exit(1);
}

async function migrate() {
  console.log('Running database migrations...');
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    
    try {
      console.log('Adding metadata column to events if it does not exist...');
      await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\'::jsonb;');
      
      console.log('Adding additional_preferences column to preferences if it does not exist...');
      await client.query('ALTER TABLE preferences ADD COLUMN IF NOT EXISTS additional_preferences JSONB DEFAULT \'{}\'::jsonb;');
      
      console.log('Migration completed successfully!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
