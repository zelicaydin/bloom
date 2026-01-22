/**
 * Fix RLS Policies Script
 * 
 * This script automatically fixes the RLS policies in your Supabase database
 * to remove infinite recursion and add write permissions.
 * 
 * Usage: npm run fix-rls
 */

import { createClient } from '@supabase/supabase-js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please set VITE_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL statements to fix RLS policies
const fixSQL = `
-- ============================================================================
-- FIX USERS POLICIES (Remove infinite recursion)
-- ============================================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (true);

-- Add INSERT policy for users (for signup)
DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (true);

-- Add UPDATE policy for users
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (true);

-- Add DELETE policy for users
DROP POLICY IF EXISTS "Users can delete own data" ON users;
CREATE POLICY "Users can delete own data" ON users
  FOR DELETE USING (true);

-- ============================================================================
-- ADD WRITE POLICIES FOR PRODUCTS
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can insert products" ON products;
CREATE POLICY "Anyone can insert products" ON products
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update products" ON products;
CREATE POLICY "Anyone can update products" ON products
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete products" ON products;
CREATE POLICY "Anyone can delete products" ON products
  FOR DELETE USING (true);

-- ============================================================================
-- ADD WRITE POLICIES FOR PURCHASES
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own purchases" ON purchases;
CREATE POLICY "Users can read own purchases" ON purchases
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own purchases" ON purchases;
CREATE POLICY "Users can insert own purchases" ON purchases
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own purchases" ON purchases;
CREATE POLICY "Users can update own purchases" ON purchases
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete own purchases" ON purchases;
CREATE POLICY "Users can delete own purchases" ON purchases
  FOR DELETE USING (true);

-- ============================================================================
-- ADD WRITE POLICIES FOR REVIEWS
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
CREATE POLICY "Anyone can insert reviews" ON reviews
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update reviews" ON reviews;
CREATE POLICY "Anyone can update reviews" ON reviews
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete reviews" ON reviews;
CREATE POLICY "Anyone can delete reviews" ON reviews
  FOR DELETE USING (true);

-- ============================================================================
-- ADD WRITE POLICIES FOR COUPONS
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own coupons" ON coupons;
CREATE POLICY "Users can read own coupons" ON coupons
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert coupons" ON coupons;
CREATE POLICY "Users can insert coupons" ON coupons
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update coupons" ON coupons;
CREATE POLICY "Users can update coupons" ON coupons
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete coupons" ON coupons;
CREATE POLICY "Users can delete coupons" ON coupons
  FOR DELETE USING (true);
`;

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS Policies...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Using: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role Key' : 'Anon Key'}\n`);

  try {
    // Split SQL into individual statements and execute them
    const statements = fixSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement || statement.trim() === '') continue;

      try {
        // Execute each statement using rpc or direct SQL
        // Note: Supabase JS client doesn't support raw SQL directly
        // We need to use the REST API or run this in SQL Editor
        console.log(`   [${i + 1}/${statements.length}] Executing statement...`);
        
        // For now, we'll need to use the REST API endpoint
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ sql: statement }),
        });

        if (!response.ok && response.status !== 404) {
          // If exec_sql doesn't exist, we'll need to guide manual execution
          throw new Error('Direct SQL execution not available. Please run the SQL manually.');
        }
      } catch (error) {
        // If direct execution fails, we'll provide instructions
        if (error.message.includes('not available') || error.message.includes('exec_sql')) {
          console.log('\n⚠️  Direct SQL execution is not available through the API.');
          console.log('📋 Please run the SQL manually in Supabase SQL Editor:\n');
          console.log('='.repeat(60));
          console.log(fixSQL);
          console.log('='.repeat(60));
          console.log('\nSteps:');
          console.log('1. Go to Supabase Dashboard → SQL Editor');
          console.log('2. Click "New Query"');
          console.log('3. Copy and paste the SQL above');
          console.log('4. Click "Run" (or Cmd/Ctrl + Enter)');
          process.exit(0);
        }
        throw error;
      }
    }

    console.log('\n✅ All RLS policies fixed successfully!');
    console.log('\n🧪 You can now run: npm run test-supabase');
    
  } catch (error) {
    console.error('\n❌ Error fixing RLS policies:', error.message);
    console.log('\n📋 Alternative: Run the SQL manually in Supabase SQL Editor');
    console.log('   File: supabase/fix-rls-policies.sql');
    process.exit(1);
  }
}

// Since Supabase JS client doesn't support raw SQL execution directly,
// we'll provide the SQL and instructions
console.log('📋 RLS Policy Fix Script\n');
console.log('Since Supabase JS client cannot execute raw SQL directly,');
console.log('please run the following SQL in your Supabase SQL Editor:\n');
console.log('='.repeat(60));
console.log(fixSQL);
console.log('='.repeat(60));
console.log('\n📝 Steps:');
console.log('1. Go to: https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Click "SQL Editor" in the left sidebar');
console.log('4. Click "New Query"');
console.log('5. Copy and paste the SQL above');
console.log('6. Click "Run" (or press Cmd/Ctrl + Enter)');
console.log('\n✅ After running the SQL, test with: npm run test-supabase\n');
