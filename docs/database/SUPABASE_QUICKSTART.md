# Supabase Quick Start Guide

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on **Settings** → **API**
3. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` key)

## Step 2: Create Environment File

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## Step 4: Install Dependencies

```bash
npm install
cd server && npm install
```

## Step 5: Migrate Existing Data (Optional)

If you have data in `server/data/*.json` files:

```bash
node supabase/migrate-data.js
```

This will copy all your existing users, products, purchases, reviews, and coupons to Supabase.

## Step 6: Test It!

1. Start your frontend: `npm run dev`
2. Open browser console (F12)
3. You should see: `✅ Supabase connection successful`
4. Add a product or user - it should save to Supabase!

## How It Works

The app now uses this priority order:
1. **Supabase** (if configured) ← Best option!
2. **Backend API** (if Supabase not available)
3. **localStorage** (fallback)

Once Supabase is configured, all data operations automatically use it. Your data will persist across browsers, devices, and sessions!

## Verify It's Working

1. Add a product in Admin Panel
2. Go to Supabase dashboard → **Table Editor** → **products**
3. You should see your product there!

## Troubleshooting

**"Supabase not configured"**
- Check `.env` file exists and has correct variable names
- Restart dev server after creating `.env`
- No quotes around values in `.env`

**"Error fetching from Supabase"**
- Make sure you ran `schema.sql` in SQL Editor
- Check your API keys are correct
- Check browser console for specific errors

**Migration script fails**
- Make sure `server/data/*.json` files exist
- Check your Supabase credentials in `.env`
- Verify tables were created (check Table Editor)
