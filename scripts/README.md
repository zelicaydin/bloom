# Database Seed Script

This script populates your Supabase database with meaningful seed data for testing and development.

## Setup

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Configure Supabase credentials** in your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   
   **Optional:** For better performance (bypasses RLS), you can use the service role key:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
   
   You can find your service role key in Supabase Dashboard → Settings → API → Service Role Key (keep this secret!)

## Usage

Run the seed script:
```bash
npm run seed-data
```

## What Gets Seeded

The script will:

1. **Delete all existing data** from:
   - Reviews
   - Purchases
   - Coupons
   - Products
   - Users

2. **Populate with seed data**:
   - **12 Products** - Various skincare, body care, hair care, candles, oils, and wellness products
   - **4 Users** - Including 1 admin and 3 regular users
   - **3 Purchases** - Sample order history
   - **5 Reviews** - Product reviews from users
   - **3 Coupons** - Sample discount codes

## Test Accounts

After seeding, you can log in with:

- **Admin:** `admin@bloom.com` / `password123`
- **User:** `john.doe@example.com` / `password123`
- **User:** `jane.smith@example.com` / `password123`
- **User (unverified):** `alex.johnson@example.com` / `password123`

## Product Images

All products use images from `/public/categories/`:
- `cat1.png` - Skincare products
- `cat2.png` - Body care products
- `cat3.png` - Hair care products
- `cat4.png` - Wellness products
- `cat5.png` - Candles
- `cat6.png` - Essential oils

## Notes

- The script respects foreign key constraints and deletes data in the correct order
- All passwords are hashed using SHA-256 (same as the app)
- The script will show a summary of what was seeded at the end
- If you encounter RLS (Row Level Security) errors, use the service role key instead of the anon key
