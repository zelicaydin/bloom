/**
 * Migration Script: JSON Files → Supabase
 * 
 * This script migrates all data from server/data/*.json files to Supabase.
 * 
 * Usage:
 * 1. Make sure your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * 2. Run: node supabase/migrate-data.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'server', 'data');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to read JSON file
const readJsonFile = (filename) => {
  const filePath = join(DATA_DIR, filename);
  if (!existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return [];
  }
  try {
    const data = readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Error reading ${filename}:`, error);
    return [];
  }
};

// Migrate users
const migrateUsers = async () => {
  console.log('\n📦 Migrating users...');
  const users = readJsonFile('users.json');
  
  if (users.length === 0) {
    console.log('   No users to migrate');
    return;
  }

  let migrated = 0;
  let errors = 0;

  for (const user of users) {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          password: user.password,
          photo: user.photo,
          card_info: user.cardInfo,
          is_admin: user.isAdmin || false,
          email_verified: user.emailVerified || false,
          verification_code: user.verificationCode,
          verification_code_expiry: user.verificationCodeExpiry,
          password_reset_code: user.passwordResetCode,
          password_reset_code_expiry: user.passwordResetCodeExpiry,
          created_at: user.createdAt || new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error(`   ❌ Error migrating user ${user.email}:`, error.message);
        errors++;
      } else {
        migrated++;
      }
    } catch (error) {
      console.error(`   ❌ Error migrating user ${user.email}:`, error.message);
      errors++;
    }
  }

  console.log(`   ✅ Migrated ${migrated} users${errors > 0 ? `, ${errors} errors` : ''}`);
};

// Migrate products
const migrateProducts = async () => {
  console.log('\n📦 Migrating products...');
  const products = readJsonFile('products.json');
  
  if (products.length === 0) {
    console.log('   No products to migrate');
    return;
  }

  let migrated = 0;
  let errors = 0;

  for (const product of products) {
    try {
      const { error } = await supabase
        .from('products')
        .upsert({
          id: product.id,
          name: product.name,
          price: product.price,
          brand: product.brand,
          type: product.type,
          description: product.description,
          image: product.image,
          markers: product.markers || [],
          rating: product.rating || 0,
          reviews: product.reviews || 0,
          created_at: product.createdAt || new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error(`   ❌ Error migrating product ${product.id}:`, error.message);
        errors++;
      } else {
        migrated++;
      }
    } catch (error) {
      console.error(`   ❌ Error migrating product ${product.id}:`, error.message);
      errors++;
    }
  }

  console.log(`   ✅ Migrated ${migrated} products${errors > 0 ? `, ${errors} errors` : ''}`);
};

// Migrate purchases
const migratePurchases = async () => {
  console.log('\n📦 Migrating purchases...');
  const purchases = readJsonFile('purchases.json');
  
  if (purchases.length === 0) {
    console.log('   No purchases to migrate');
    return;
  }

  let migrated = 0;
  let errors = 0;

  for (const purchase of purchases) {
    try {
      const { error } = await supabase
        .from('purchases')
        .upsert({
          id: purchase.id,
          user_id: purchase.userId,
          items: purchase.items,
          subtotal: purchase.subtotal,
          discount: purchase.discount || 0,
          total: purchase.total,
          coupon: purchase.coupon,
          payment_method: purchase.paymentMethod,
          date: purchase.date || purchase.createdAt || new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error(`   ❌ Error migrating purchase ${purchase.id}:`, error.message);
        errors++;
      } else {
        migrated++;
      }
    } catch (error) {
      console.error(`   ❌ Error migrating purchase ${purchase.id}:`, error.message);
      errors++;
    }
  }

  console.log(`   ✅ Migrated ${migrated} purchases${errors > 0 ? `, ${errors} errors` : ''}`);
};

// Migrate reviews
const migrateReviews = async () => {
  console.log('\n📦 Migrating reviews...');
  const reviews = readJsonFile('reviews.json');
  
  if (reviews.length === 0) {
    console.log('   No reviews to migrate');
    return;
  }

  let migrated = 0;
  let errors = 0;

  for (const review of reviews) {
    try {
      const { error } = await supabase
        .from('reviews')
        .upsert({
          id: review.id,
          user_id: review.userId,
          product_id: review.productId,
          user_email: review.userEmail,
          rating: review.rating,
          comment: review.comment,
          created_at: review.createdAt || new Date().toISOString(),
          updated_at: review.updatedAt || review.createdAt || new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error(`   ❌ Error migrating review ${review.id}:`, error.message);
        errors++;
      } else {
        migrated++;
      }
    } catch (error) {
      console.error(`   ❌ Error migrating review ${review.id}:`, error.message);
      errors++;
    }
  }

  console.log(`   ✅ Migrated ${migrated} reviews${errors > 0 ? `, ${errors} errors` : ''}`);
};

// Migrate coupons
const migrateCoupons = async () => {
  console.log('\n📦 Migrating coupons...');
  const coupons = readJsonFile('coupons.json');
  
  if (coupons.length === 0) {
    console.log('   No coupons to migrate');
    return;
  }

  let migrated = 0;
  let errors = 0;

  for (const coupon of coupons) {
    try {
      const { error } = await supabase
        .from('coupons')
        .upsert({
          id: coupon.id,
          code: coupon.code,
          user_id: coupon.userId,
          discount_type: coupon.discountType,
          discount: coupon.discount || coupon.amount,
          expires_at: coupon.expiresAt,
          used: coupon.used || false,
          used_at: coupon.usedAt,
          used_in_order_id: coupon.usedInOrderId,
          created_at: coupon.createdAt || new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error(`   ❌ Error migrating coupon ${coupon.id}:`, error.message);
        errors++;
      } else {
        migrated++;
      }
    } catch (error) {
      console.error(`   ❌ Error migrating coupon ${coupon.id}:`, error.message);
      errors++;
    }
  }

  console.log(`   ✅ Migrated ${migrated} coupons${errors > 0 ? `, ${errors} errors` : ''}`);
};

// Main migration function
const migrate = async () => {
  console.log('🚀 Starting data migration to Supabase...\n');

  // Test connection
  const { data, error } = await supabase.from('products').select('id').limit(1);
  if (error) {
    console.error('❌ Cannot connect to Supabase:', error.message);
    console.error('   Make sure:');
    console.error('   1. Your Supabase project is running');
    console.error('   2. You have run the schema.sql script');
    console.error('   3. Your credentials are correct in .env');
    process.exit(1);
  }

  console.log('✅ Connected to Supabase\n');

  // Run migrations
  await migrateUsers();
  await migrateProducts();
  await migratePurchases();
  await migrateReviews();
  await migrateCoupons();

  console.log('\n✅ Migration complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Update your .env file to use Supabase');
  console.log('   2. Restart your frontend app');
  console.log('   3. The app will now use Supabase instead of JSON files');
};

// Run migration
migrate().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
