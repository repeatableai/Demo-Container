import pg from 'pg';
const { Pool } = pg;

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost',
  user: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres',
  password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '',
  database: process.env.DB_NAME || process.env.POSTGRES_DATABASE || 'demo_container',
  port: process.env.DB_PORT || process.env.POSTGRES_PORT || 5432,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

export default pool;
