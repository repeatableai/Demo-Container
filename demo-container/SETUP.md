# PostgreSQL Database Setup Guide (Render)

## Quick Setup on Render

1. **Create PostgreSQL Database on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "PostgreSQL"
   - Name it: `demo-container-db` (or any name)
   - Choose a plan (Free tier available)
   - Click "Create Database"

2. **Get Connection Details:**
   - After creation, Render will show:
     - Internal Database URL (for services on Render)
     - External Database URL (if needed)
   - Copy the **Internal Database URL**

3. **Link Database to Your Web Service:**
   - Go to your `demo-container` Web Service
   - Go to **Environment** tab
   - Click "Link Database" and select your PostgreSQL database
   - Render will automatically add these environment variables:
     - `POSTGRES_HOST`
     - `POSTGRES_USER`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`
     - `DATABASE_URL` (full connection string)

4. **Deploy:**
   - The database will be automatically initialized on first server start
   - Check logs to confirm "Database initialized successfully"

## Manual Environment Variables (if not linking)

If you're not using Render's "Link Database" feature, add these manually:

```
POSTGRES_HOST=your-host
POSTGRES_USER=your-user
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=demo_container
```

Or use the full connection string:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

## Database Schema

- **categories**: Stores category information
- **links**: Stores links with foreign key to categories

Both tables include `created_at` and `updated_at` timestamps that auto-update.
