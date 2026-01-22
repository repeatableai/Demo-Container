import pg from 'pg';
const { Pool } = pg;

// Parse DATABASE_URL if provided (Render's format)
let poolConfig;
if (process.env.DATABASE_URL) {
  // Use DATABASE_URL directly - pg library can parse it
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  };
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
}

// Create connection pool
const pool = new Pool(poolConfig);

export default pool;
