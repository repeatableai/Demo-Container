import pg from 'pg';
const { Pool } = pg;

// Parse DATABASE_URL if provided (Render's format)
let poolConfig;
if (process.env.DATABASE_URL) {
  // Render PostgreSQL connection strings sometimes need port appended
  let connectionString = process.env.DATABASE_URL;
  
  // If connection string doesn't have a port, add default PostgreSQL port
  if (!connectionString.includes(':5432') && !connectionString.match(/:\d+\//)) {
    // Check if it's missing port entirely
    const match = connectionString.match(/@([^:]+)\/(.+)$/);
    if (match) {
      // Insert port before database name
      connectionString = connectionString.replace(/@([^:]+)\//, '@$1:5432/');
    }
  }
  
  poolConfig = {
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  };
  
  console.log('Using DATABASE_URL for connection (host masked)');
} else {
  // Fallback to individual environment variables
  poolConfig = {
    host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost',
    user: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '',
    database: process.env.DB_NAME || process.env.POSTGRES_DATABASE || 'demo_container_db',
    port: process.env.DB_PORT || process.env.POSTGRES_PORT || 5432,
    ssl: false
  };
  
  console.log('Using individual environment variables for connection');
}

// Create connection pool with error handling
const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => {
    console.log('Database pool created successfully');
  })
  .catch((err) => {
    console.error('Failed to create database pool:', err.message);
    console.error('DATABASE_URL present:', !!process.env.DATABASE_URL);
  });

export default pool;
