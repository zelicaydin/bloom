# Supabase Setup Guide

This guide will help you set up Supabase for your Bloom application to store products and users in a real database.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (it's free)
3. Create a new project:
   - Choose an organization (or create one)
   - Enter project name: `bloom` (or any name you prefer)
   - Enter a database password (save this securely!)
   - Choose a region close to you
   - Click "Create new project"

## Step 2: Create Database Tables

Once your project is created, go to the SQL Editor in the Supabase dashboard.

### Create Products Table

Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  brand TEXT,
  type TEXT,
  image TEXT,
  description TEXT,
  rating NUMERIC,
  reviews INTEGER,
  markers TEXT[],
  popularity INTEGER DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT
);
```

### Create Users Table

Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  photo TEXT,
  cardInfo JSONB,
  isAdmin BOOLEAN DEFAULT FALSE,
  createdAt TEXT,
  updatedAt TEXT
);
```

### Enable Row Level Security (Optional but Recommended)

For now, we'll disable RLS to keep it simple. You can enable it later for better security:

```sql
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

## Step 3: Get Your API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. You'll see:
   - **Project URL** (something like `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

## Step 4: Configure Environment Variables

1. Create a file named `.env` in the root of your project (same level as `package.json`)
2. Add these lines (replace with your actual values):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** 
- Never commit `.env` to git (it should already be in `.gitignore`)
- The `VITE_` prefix is required for Vite to expose these variables

## Step 5: Install Dependencies

Run this command in your terminal:

```bash
npm install
```

This will install the `@supabase/supabase-js` package.

## Step 6: Test the Setup

1. Start your dev server: `npm run dev`
2. Open your app in the browser
3. The app will automatically:
   - Detect if Supabase is configured
   - Migrate existing localStorage data to Supabase (first time only)
   - Use Supabase for all future operations
   - Fall back to localStorage if Supabase is unavailable

## How It Works

- **With Supabase configured:** Data is stored in Supabase and synced to localStorage as backup
- **Without Supabase:** App works exactly as before using localStorage only
- **Migration:** Existing users and products are automatically migrated to Supabase on first load

## Troubleshooting

### "Supabase not configured" in console
- Make sure your `.env` file exists and has the correct variable names
- Restart your dev server after creating/modifying `.env`
- Check that the values don't have extra spaces or quotes

### Migration not working
- Check browser console for errors
- Verify your tables were created correctly
- Make sure RLS is disabled (or configure policies if enabled)

### Data not syncing
- Check network tab in browser dev tools
- Verify your API keys are correct
- Check Supabase dashboard for any errors

## Next Steps

Once everything is working:
1. Your data is now stored in a real database!
2. Users and products will persist across browsers/devices
3. You can view your data in the Supabase dashboard under "Table Editor"
4. Consider enabling Row Level Security for better security (requires additional setup)

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
