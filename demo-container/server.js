import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import initDatabase from './db/init.js';
import categoriesRouter from './api/categories.js';
import linksRouter from './api/links.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json());

// Add iframe headers middleware
app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const pool = (await import('./db/connection.js')).default;
    await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    });
  }
});

// API routes (must come before static file serving)
app.use('/api/categories', categoriesRouter);
app.use('/api/links', linksRouter);

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Handle React Router - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;

// Initialize database and then start server
async function startServer() {
  try {
    console.log('Initializing database...');
    await initDatabase();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

startServer();
