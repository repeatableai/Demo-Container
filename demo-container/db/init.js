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
    // Split by semicolon but handle multi-line statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
        } catch (error) {
          // Ignore "already exists" errors but log others
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.message.includes('does not exist')) {
            // These are expected for idempotent initialization
            continue;
          }
          console.warn('Warning executing statement:', error.message);
          console.warn('Statement:', statement.substring(0, 100));
        }
      }
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    console.error('Error details:', error.message);
    throw error; // Re-throw so server knows init failed
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default initDatabase;
