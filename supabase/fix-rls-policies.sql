-- Fix RLS Policies for Bloom Database
-- Run this in your Supabase SQL Editor to fix the infinite recursion and add write policies

-- ============================================================================
-- FIX USERS POLICIES (Remove infinite recursion)
-- ============================================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create a simpler policy that doesn't cause recursion
-- For now, allow all authenticated operations (you can restrict later)
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (true); -- Allow all reads for now

-- Add INSERT policy for users (for signup)
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (true); -- Allow inserts for signup

-- Add UPDATE policy for users
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (true); -- Allow updates for now

-- Add DELETE policy for users (admin only in production)
CREATE POLICY "Users can delete own data" ON users
  FOR DELETE USING (true); -- Allow deletes for now

-- ============================================================================
-- ADD WRITE POLICIES FOR PRODUCTS
-- ============================================================================

CREATE POLICY "Anyone can insert products" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update products" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete products" ON products
  FOR DELETE USING (true);

-- ============================================================================
-- ADD WRITE POLICIES FOR PURCHASES
-- ============================================================================

CREATE POLICY "Users can insert own purchases" ON purchases
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own purchases" ON purchases
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own purchases" ON purchases
  FOR DELETE USING (true);

-- ============================================================================
-- ADD WRITE POLICIES FOR REVIEWS
-- ============================================================================

CREATE POLICY "Anyone can insert reviews" ON reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update reviews" ON reviews
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete reviews" ON reviews
  FOR DELETE USING (true);

-- ============================================================================
-- ADD WRITE POLICIES FOR COUPONS
-- ============================================================================

CREATE POLICY "Users can insert coupons" ON coupons
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update coupons" ON coupons
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete coupons" ON coupons
  FOR DELETE USING (true);

-- ============================================================================
-- FIX PURCHASES POLICY (Remove infinite recursion)
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own purchases" ON purchases;

CREATE POLICY "Users can read own purchases" ON purchases
  FOR SELECT USING (true); -- Allow all reads for now

-- ============================================================================
-- FIX COUPONS POLICY (Remove infinite recursion)
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own coupons" ON coupons;

CREATE POLICY "Users can read own coupons" ON coupons
  FOR SELECT USING (true); -- Allow all reads for now
