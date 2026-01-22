# Supabase Migration Guide

This guide will help you migrate from the JSON file-based backend to Supabase.

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` key, not the `service_role` key)

## Step 2: Create Environment File

Create a `.env` file in the project root with:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Run Database Setup

1. Go to your Supabase project dashboard
2. Click on "SQL Editor"
3. Run the SQL script from `supabase/schema.sql` (we'll create this)

## Step 4: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Step 5: Migrate Existing Data

Run the migration script to move data from JSON files to Supabase:

```bash
node supabase/migrate-data.js
```

## What Gets Migrated

- ✅ Users (with passwords, verification codes, etc.)
- ✅ Products
- ✅ Purchases/Orders
- ✅ Reviews
- ✅ Coupons

## After Migration

The app will automatically use Supabase instead of the JSON file backend. All existing functionality will work the same, but data will be stored in Supabase.
