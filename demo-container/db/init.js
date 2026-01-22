import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
  try {
    const sql = fs.readFileSync(join(__dirname, 'init.sql'), 'utf8');
    // PostgreSQL uses semicolons differently, split by statement boundaries
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
            console.warn('Warning executing statement:', error.message);
          }
        }
      }
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Don't throw - allow server to start even if init fails
    console.log('Continuing without database initialization...');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default initDatabase;
