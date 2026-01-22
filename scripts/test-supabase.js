/**
 * Supabase Database Test Script
 * 
 * This script tests all database operations to ensure Supabase is fully functional.
 * 
 * Usage: npm run test-supabase
 */

import { createClient } from '@supabase/supabase-js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
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

// Test results tracker
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

function logTest(name, passed, error = null) {
  if (passed) {
    console.log(`✅ ${name}`);
    testResults.passed++;
  } else {
    console.error(`❌ ${name}`);
    if (error) {
      console.error(`   Error: ${error.message || error}`);
      testResults.errors.push({ name, error: error.message || String(error) });
    }
    testResults.failed++;
  }
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function testConnection() {
  console.log('\n🔌 Testing Supabase Connection...');
  
  try {
    const { data, error } = await supabase.from('products').select('id').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows (OK)
      throw error;
    }
    logTest('Connection to Supabase', true);
    return true;
  } catch (error) {
    logTest('Connection to Supabase', false, error);
    return false;
  }
}

async function testProducts() {
  console.log('\n📦 Testing Products Table...');
  
  const testProduct = {
    id: `test-product-${Date.now()}`,
    name: 'Test Product',
    price: 19.99,
    brand: 'Test Brand',
    type: 'test-type',
    description: 'This is a test product',
    image: '/categories/cat1.png',
    markers: ['organicIngredients'],
    rating: 4.5,
    reviews: 10,
    created_at: new Date().toISOString(),
  };
  
  try {
    // CREATE
    const { data: created, error: createError } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single();
    
    if (createError) throw createError;
    logTest('Create product', true);
    
    // READ
    const { data: read, error: readError } = await supabase
      .from('products')
      .select('*')
      .eq('id', testProduct.id)
      .single();
    
    if (readError) throw readError;
    if (!read || read.id !== testProduct.id) throw new Error('Product not found after creation');
    logTest('Read product', true);
    
    // UPDATE
    const { data: updated, error: updateError } = await supabase
      .from('products')
      .update({ name: 'Updated Test Product', price: 24.99 })
      .eq('id', testProduct.id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    if (updated.name !== 'Updated Test Product') throw new Error('Product not updated correctly');
    logTest('Update product', true);
    
    // DELETE
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', testProduct.id);
    
    if (deleteError) throw deleteError;
    logTest('Delete product', true);
    
    return true;
  } catch (error) {
    logTest('Products operations', false, error);
    // Try to clean up
    await supabase.from('products').delete().eq('id', testProduct.id);
    return false;
  }
}

async function testUsers() {
  console.log('\n👥 Testing Users Table...');
  
  const testUserId = `test-user-${Date.now()}`;
  const passwordHash = createHash('sha256').update('testpassword').digest('hex');
  
  const testUser = {
    id: testUserId,
    name: 'Test',
    surname: 'User',
    email: `test-${Date.now()}@example.com`,
    password: passwordHash,
    photo: null,
    card_info: null,
    is_admin: false,
    email_verified: true,
    created_at: new Date().toISOString(),
  };
  
  try {
    // CREATE
    const { data: created, error: createError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single();
    
    if (createError) throw createError;
    logTest('Create user', true);
    
    // READ
    const { data: read, error: readError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    if (readError) throw readError;
    if (!read || read.id !== testUserId) throw new Error('User not found after creation');
    logTest('Read user', true);
    
    // UPDATE
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({ name: 'Updated', surname: 'Name' })
      .eq('id', testUserId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    if (updated.name !== 'Updated') throw new Error('User not updated correctly');
    logTest('Update user', true);
    
    // DELETE
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', testUserId);
    
    if (deleteError) throw deleteError;
    logTest('Delete user', true);
    
    return true;
  } catch (error) {
    logTest('Users operations', false, error);
    // Try to clean up
    await supabase.from('users').delete().eq('id', testUserId);
    return false;
  }
}

async function testPurchases() {
  console.log('\n🛒 Testing Purchases Table...');
  
  // First, create a test user for the purchase
  const testUserId = `test-user-purchase-${Date.now()}`;
  const passwordHash = createHash('sha256').update('testpassword').digest('hex');
  
  const testUser = {
    id: testUserId,
    name: 'Purchase',
    surname: 'Test',
    email: `purchase-test-${Date.now()}@example.com`,
    password: passwordHash,
    photo: null,
    card_info: null,
    is_admin: false,
    email_verified: true,
    created_at: new Date().toISOString(),
  };
  
  const testPurchaseId = `test-purchase-${Date.now()}`;
  const testPurchase = {
    id: testPurchaseId,
    user_id: testUserId,
    items: [
      { productId: '1', name: 'Test Product', price: 19.99, quantity: 2 },
    ],
    subtotal: 39.98,
    discount: 0,
    total: 39.98,
    coupon: null,
    payment_method: { type: 'card', last4: '1234' },
    date: new Date().toISOString(),
  };
  
  try {
    // Create test user first
    await supabase.from('users').insert(testUser);
    
    // CREATE
    const { data: created, error: createError } = await supabase
      .from('purchases')
      .insert(testPurchase)
      .select()
      .single();
    
    if (createError) throw createError;
    logTest('Create purchase', true);
    
    // READ
    const { data: read, error: readError } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', testPurchaseId)
      .single();
    
    if (readError) throw readError;
    if (!read || read.id !== testPurchaseId) throw new Error('Purchase not found after creation');
    logTest('Read purchase', true);
    
    // Test foreign key relationship
    const { data: userPurchases, error: userPurchasesError } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', testUserId);
    
    if (userPurchasesError) throw userPurchasesError;
    if (!userPurchases || userPurchases.length === 0) throw new Error('Could not fetch purchases by user_id');
    logTest('Read purchases by user_id (foreign key)', true);
    
    // DELETE
    const { error: deleteError } = await supabase
      .from('purchases')
      .delete()
      .eq('id', testPurchaseId);
    
    if (deleteError) throw deleteError;
    logTest('Delete purchase', true);
    
    // Clean up test user
    await supabase.from('users').delete().eq('id', testUserId);
    
    return true;
  } catch (error) {
    logTest('Purchases operations', false, error);
    // Try to clean up
    await supabase.from('purchases').delete().eq('id', testPurchaseId);
    await supabase.from('users').delete().eq('id', testUserId);
    return false;
  }
}

async function testReviews() {
  console.log('\n⭐ Testing Reviews Table...');
  
  // Create test user and product first
  const testUserId = `test-user-review-${Date.now()}`;
  const testProductId = `test-product-review-${Date.now()}`;
  const passwordHash = createHash('sha256').update('testpassword').digest('hex');
  
  const testUser = {
    id: testUserId,
    name: 'Review',
    surname: 'Test',
    email: `review-test-${Date.now()}@example.com`,
    password: passwordHash,
    photo: null,
    card_info: null,
    is_admin: false,
    email_verified: true,
    created_at: new Date().toISOString(),
  };
  
  const testProduct = {
    id: testProductId,
    name: 'Test Product for Review',
    price: 19.99,
    brand: 'Test Brand',
    type: 'test-type',
    description: 'Test product',
    image: '/categories/cat1.png',
    markers: [],
    rating: 0,
    reviews: 0,
    created_at: new Date().toISOString(),
  };
  
  const testReviewId = `test-review-${Date.now()}`;
  const testReview = {
    id: testReviewId,
    user_id: testUserId,
    product_id: testProductId,
    user_email: testUser.email,
    rating: 5,
    comment: 'This is a test review',
    created_at: new Date().toISOString(),
  };
  
  try {
    // Create test user and product
    await supabase.from('users').insert(testUser);
    await supabase.from('products').insert(testProduct);
    
    // CREATE
    const { data: created, error: createError } = await supabase
      .from('reviews')
      .insert(testReview)
      .select()
      .single();
    
    if (createError) throw createError;
    logTest('Create review', true);
    
    // READ
    const { data: read, error: readError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', testReviewId)
      .single();
    
    if (readError) throw readError;
    if (!read || read.id !== testReviewId) throw new Error('Review not found after creation');
    logTest('Read review', true);
    
    // Test foreign key relationship - get reviews by product
    const { data: productReviews, error: productReviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', testProductId);
    
    if (productReviewsError) throw productReviewsError;
    if (!productReviews || productReviews.length === 0) throw new Error('Could not fetch reviews by product_id');
    logTest('Read reviews by product_id (foreign key)', true);
    
    // DELETE
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', testReviewId);
    
    if (deleteError) throw deleteError;
    logTest('Delete review', true);
    
    // Clean up
    await supabase.from('products').delete().eq('id', testProductId);
    await supabase.from('users').delete().eq('id', testUserId);
    
    return true;
  } catch (error) {
    logTest('Reviews operations', false, error);
    // Try to clean up
    await supabase.from('reviews').delete().eq('id', testReviewId);
    await supabase.from('products').delete().eq('id', testProductId);
    await supabase.from('users').delete().eq('id', testUserId);
    return false;
  }
}

async function testCoupons() {
  console.log('\n🎫 Testing Coupons Table...');
  
  // Create test user first
  const testUserId = `test-user-coupon-${Date.now()}`;
  const passwordHash = createHash('sha256').update('testpassword').digest('hex');
  
  const testUser = {
    id: testUserId,
    name: 'Coupon',
    surname: 'Test',
    email: `coupon-test-${Date.now()}@example.com`,
    password: passwordHash,
    photo: null,
    card_info: null,
    is_admin: false,
    email_verified: true,
    created_at: new Date().toISOString(),
  };
  
  const testCouponId = `test-coupon-${Date.now()}`;
  const testCoupon = {
    id: testCouponId,
    code: `TEST${Date.now()}`,
    user_id: testUserId,
    discount_type: 'percentage',
    discount: 15.00,
    expires_at: new Date('2026-12-31').toISOString(),
    used: false,
    created_at: new Date().toISOString(),
  };
  
  try {
    // Create test user
    await supabase.from('users').insert(testUser);
    
    // CREATE
    const { data: created, error: createError } = await supabase
      .from('coupons')
      .insert(testCoupon)
      .select()
      .single();
    
    if (createError) throw createError;
    logTest('Create coupon', true);
    
    // READ
    const { data: read, error: readError } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', testCouponId)
      .single();
    
    if (readError) throw readError;
    if (!read || read.id !== testCouponId) throw new Error('Coupon not found after creation');
    logTest('Read coupon', true);
    
    // UPDATE
    const { data: updated, error: updateError } = await supabase
      .from('coupons')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', testCouponId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    if (!updated.used) throw new Error('Coupon not updated correctly');
    logTest('Update coupon', true);
    
    // Test foreign key relationship - get coupons by user
    const { data: userCoupons, error: userCouponsError } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', testUserId);
    
    if (userCouponsError) throw userCouponsError;
    if (!userCoupons || userCoupons.length === 0) throw new Error('Could not fetch coupons by user_id');
    logTest('Read coupons by user_id (foreign key)', true);
    
    // DELETE
    const { error: deleteError } = await supabase
      .from('coupons')
      .delete()
      .eq('id', testCouponId);
    
    if (deleteError) throw deleteError;
    logTest('Delete coupon', true);
    
    // Clean up test user
    await supabase.from('users').delete().eq('id', testUserId);
    
    return true;
  } catch (error) {
    logTest('Coupons operations', false, error);
    // Try to clean up
    await supabase.from('coupons').delete().eq('id', testCouponId);
    await supabase.from('users').delete().eq('id', testUserId);
    return false;
  }
}

async function testDataIntegrity() {
  console.log('\n🔗 Testing Data Integrity (Foreign Keys)...');
  
  try {
    // Test that we can't create a purchase without a valid user
    const invalidPurchase = {
      id: `invalid-purchase-${Date.now()}`,
      user_id: 'non-existent-user-id',
      items: [],
      subtotal: 0,
      total: 0,
      date: new Date().toISOString(),
    };
    
    const { error } = await supabase.from('purchases').insert(invalidPurchase);
    
    if (!error) {
      // If no error, foreign key constraint might not be enforced
      logTest('Foreign key constraint (purchases -> users)', false, new Error('Foreign key constraint not enforced'));
      await supabase.from('purchases').delete().eq('id', invalidPurchase.id);
    } else {
      // Error is expected - foreign key constraint is working
      logTest('Foreign key constraint (purchases -> users)', true);
    }
    
    // Test that we can't create a review without a valid product
    const testUserId = `test-user-fk-${Date.now()}`;
    const passwordHash = createHash('sha256').update('testpassword').digest('hex');
    
    const testUser = {
      id: testUserId,
      name: 'FK',
      surname: 'Test',
      email: `fk-test-${Date.now()}@example.com`,
      password: passwordHash,
      photo: null,
      card_info: null,
      is_admin: false,
      email_verified: true,
      created_at: new Date().toISOString(),
    };
    
    await supabase.from('users').insert(testUser);
    
    const invalidReview = {
      id: `invalid-review-${Date.now()}`,
      user_id: testUserId,
      product_id: 'non-existent-product-id',
      user_email: testUser.email,
      rating: 5,
      comment: 'Test',
      created_at: new Date().toISOString(),
    };
    
    const { error: reviewError } = await supabase.from('reviews').insert(invalidReview);
    
    if (!reviewError) {
      logTest('Foreign key constraint (reviews -> products)', false, new Error('Foreign key constraint not enforced'));
      await supabase.from('reviews').delete().eq('id', invalidReview.id);
    } else {
      logTest('Foreign key constraint (reviews -> products)', true);
    }
    
    // Clean up
    await supabase.from('users').delete().eq('id', testUserId);
    
    return true;
  } catch (error) {
    logTest('Data integrity tests', false, error);
    return false;
  }
}

async function testExistingData() {
  console.log('\n📊 Checking Existing Data...');
  
  try {
    const { data: users, error: usersError } = await supabase.from('users').select('id');
    const { data: products, error: productsError } = await supabase.from('products').select('id');
    const { data: purchases, error: purchasesError } = await supabase.from('purchases').select('id');
    const { data: reviews, error: reviewsError } = await supabase.from('reviews').select('id');
    const { data: coupons, error: couponsError } = await supabase.from('coupons').select('id');
    
    if (usersError) throw usersError;
    if (productsError) throw productsError;
    if (purchasesError) throw purchasesError;
    if (reviewsError) throw reviewsError;
    if (couponsError) throw couponsError;
    
    console.log(`   Users: ${users?.length || 0}`);
    console.log(`   Products: ${products?.length || 0}`);
    console.log(`   Purchases: ${purchases?.length || 0}`);
    console.log(`   Reviews: ${reviews?.length || 0}`);
    console.log(`   Coupons: ${coupons?.length || 0}`);
    
    logTest('Read existing data counts', true);
    return true;
  } catch (error) {
    logTest('Read existing data counts', false, error);
    return false;
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('🧪 Starting Supabase Database Tests...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Using: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role Key' : 'Anon Key'}\n`);
  
  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.error('\n❌ Cannot connect to Supabase. Please check your credentials and network connection.');
    process.exit(1);
  }
  
  // Run all tests
  await testProducts();
  await testUsers();
  await testPurchases();
  await testReviews();
  await testCoupons();
  await testDataIntegrity();
  await testExistingData();
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Errors:');
    testResults.errors.forEach(({ name, error }) => {
      console.log(`   - ${name}: ${error}`);
    });
  }
  
  console.log('='.repeat(60));
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Supabase database is fully functional.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error('\n💥 Fatal error running tests:', error);
  process.exit(1);
});
