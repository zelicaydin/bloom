# Supabase Persistence Diagnostic

## The Problem
Products added through Admin panel disappear after page refresh (Cmd+R).

## Root Cause Analysis
The app is likely:
1. Saving products to backend API or localStorage instead of Supabase
2. Loading from Supabase on refresh (which is empty)
3. Connection test passes but INSERT operations fail silently

## Quick Fix Checklist

### 1. Verify Supabase Connection
Open browser console (F12) and check for:
- `✅ Supabase is available and will be used for data operations`
- If you see `⚠️ Supabase connection test failed`, Supabase is not accessible

### 2. Check RLS Policies
Go to Supabase Dashboard → SQL Editor and run:
```sql
-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'products';

-- If no policies, run the fix script
-- Copy contents of supabase/fix-rls-policies.sql and run in SQL Editor
```

### 3. Test Direct Insert
Run in browser console:
```javascript
// Test if Supabase insert works
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const { data, error } = await supabase
  .from('products')
  .insert({ id: '999', name: 'Test', price: 10, brand: 'Test', type: 'test', description: 'test', image: '/test.png', markers: [], rating: 0, reviews: 0, created_at: new Date().toISOString() })
  .select();

console.log('Insert result:', data, error);
```

### 4. Check What's Actually Happening
When adding a product, look for these console messages:
- `💾 Saving product to Supabase:` = Good, using Supabase
- `💾 Saving product to backend:` = Bad, falling back to backend
- `❌ Failed to save product to Supabase:` = RLS or connection issue

## Solution
The code now:
1. ✅ Generates IDs automatically for Supabase
2. ✅ Forces Supabase check on every write
3. ✅ Better error logging
4. ✅ Retry logic if Supabase fails once

If products still disappear, the issue is likely:
- RLS policies blocking INSERT
- Supabase connection test failing
- Environment variables not loaded correctly
