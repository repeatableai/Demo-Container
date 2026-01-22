import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
  try {
    // Test connection first
    console.log('Testing database connection...');
    console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful. Server time:', result.rows[0].now);
    
    const sql = fs.readFileSync(join(__dirname, 'init.sql'), 'utf8');
    
    // Execute the entire SQL file as one query
    // PostgreSQL supports multiple statements separated by semicolons
    // This preserves dollar-quoted strings and multi-line statements
    await pool.query(sql);
    
    console.log('Database initialized successfully');
  } catch (error) {
    // Check if it's a "already exists" error which is fine
    if (error.message.includes('already exists') || 
        error.message.includes('duplicate')) {
      console.log('Database already initialized (tables exist)');
    } else {
      console.error('Error initializing database:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      throw error; // Re-throw so server knows init failed
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default initDatabase;
