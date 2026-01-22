/**
 * Safe Migration Script: Backend JSON Files → Supabase
 * 
 * This script safely migrates all data from server/data/*.json files to Supabase.
 * It uses upsert to avoid duplicates and preserves all existing data.
 * 
 * Usage: npm run migrate-to-supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
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
const DATA_DIR = join(__dirname, '..', 'server', 'data');

// Helper to read JSON file
const readJsonFile = (filename) => {
  const filePath = join(DATA_DIR, filename);
  if (!existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return [];
  }
  try {
    const data = readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`❌ Error reading ${filename}:`, error.message);
    return [];
  }
};

// Migration statistics
const stats = {
  users: { total: 0, migrated: 0, skipped: 0, errors: 0 },
  products: { total: 0, migrated: 0, skipped: 0, errors: 0 },
  purchases: { total: 0, migrated: 0, skipped: 0, errors: 0 },
  reviews: { total: 0, migrated: 0, skipped: 0, errors: 0 },
  coupons: { total: 0, migrated: 0, skipped: 0, errors: 0 },
};

async function migrateUsers() {
  console.log('\n👥 Migrating Users...');
  const users = readJsonFile('users.json');
  stats.users.total = users.length;

  if (users.length === 0) {
    console.log('   No users to migrate');
    return;
  }

  for (const user of users) {
    try {
      // Map backend user structure to Supabase structure
      const supabaseUser = {
        id: user.id,
        name: user.name || '',
        surname: user.surname || '',
        email: user.email?.toLowerCase() || '',
        password: user.password || '',
        photo: user.photo || null,
        card_info: user.cardInfo || null,
        is_admin: user.isAdmin || false,
        email_verified: user.emailVerified || false,
        verification_code: user.verificationCode || null,
        verification_code_expiry: user.verificationCodeExpiry || null,
        password_reset_code: user.passwordResetCode || null,
        password_reset_code_expiry: user.passwordResetCodeExpiry || null,
        created_at: user.createdAt || new Date().toISOString(),
      };

      // Check if user already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existing) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update(supabaseUser)
          .eq('id', user.id);

        if (error) throw error;
        stats.users.migrated++;
        console.log(`   ✓ Updated user: ${user.email}`);
      } else {
        // Insert new user
        const { error } = await supabase
          .from('users')
          .insert(supabaseUser);

        if (error) {
          // If email conflict, try update
          if (error.code === '23505') {
            const { error: updateError } = await supabase
              .from('users')
              .update(supabaseUser)
              .eq('email', supabaseUser.email);

            if (updateError) throw updateError;
            stats.users.migrated++;
            console.log(`   ✓ Updated user (by email): ${user.email}`);
          } else {
            throw error;
          }
        } else {
          stats.users.migrated++;
          console.log(`   ✓ Migrated user: ${user.email}`);
        }
      }
    } catch (error) {
      stats.users.errors++;
      console.error(`   ❌ Error migrating user ${user.email}:`, error.message);
    }
  }
}

async function migrateProducts() {
  console.log('\n📦 Migrating Products...');
  const products = readJsonFile('products.json');
  stats.products.total = products.length;

  if (products.length === 0) {
    console.log('   No products to migrate');
    return;
  }

  for (const product of products) {
    try {
      const supabaseProduct = {
        id: product.id,
        name: product.name || '',
        price: product.price || 0,
        brand: product.brand || null,
        type: product.type || null,
        description: product.description || null,
        image: product.image || null,
        markers: product.markers || [],
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        created_at: product.createdAt || new Date().toISOString(),
      };

      // Check if product already exists
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('id', product.id)
        .single();

      if (existing) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(supabaseProduct)
          .eq('id', product.id);

        if (error) throw error;
        stats.products.migrated++;
        console.log(`   ✓ Updated product: ${product.name}`);
      } else {
        // Insert new product
        const { error } = await supabase
          .from('products')
          .insert(supabaseProduct);

        if (error) throw error;
        stats.products.migrated++;
        console.log(`   ✓ Migrated product: ${product.name}`);
      }
    } catch (error) {
      stats.products.errors++;
      console.error(`   ❌ Error migrating product ${product.name}:`, error.message);
    }
  }
}

async function migratePurchases() {
  console.log('\n🛒 Migrating Purchases...');
  const purchases = readJsonFile('purchases.json');
  stats.purchases.total = purchases.length;

  if (purchases.length === 0) {
    console.log('   No purchases to migrate');
    return;
  }

  // Get all user IDs from Supabase to validate foreign keys
  const { data: allUsers } = await supabase.from('users').select('id, email');
  const validUserIds = new Set(allUsers?.map(u => u.id) || []);
  
  // Create mapping for old user IDs (e.g., "admin-001" -> actual admin ID)
  const userMapping = {};
  if (allUsers) {
    // Map admin emails to admin user IDs
    const adminUser = allUsers.find(u => u.email === 'admin@bloom.com');
    if (adminUser) {
      userMapping['admin-001'] = adminUser.id;
    }
  }

  for (const purchase of purchases) {
    try {
      let userId = purchase.userId || purchase.user_id;
      
      // Try to map old user IDs
      if (userMapping[userId]) {
        userId = userMapping[userId];
      }
      
      // Skip if user doesn't exist
      if (!validUserIds.has(userId)) {
        console.log(`   ⚠️  Skipping purchase ${purchase.id}: user ${purchase.userId} not found`);
        stats.purchases.skipped++;
        continue;
      }

      const supabasePurchase = {
        id: purchase.id,
        user_id: userId,
        items: purchase.items || [],
        subtotal: purchase.subtotal || 0,
        discount: purchase.discount || 0,
        total: purchase.total || 0,
        coupon: purchase.coupon || null,
        payment_method: purchase.paymentMethod || purchase.payment_method || null,
        date: purchase.date || purchase.created_at || new Date().toISOString(),
      };

      // Check if purchase already exists
      const { data: existing } = await supabase
        .from('purchases')
        .select('id')
        .eq('id', purchase.id)
        .single();

      if (existing) {
        // Update existing purchase
        const { error } = await supabase
          .from('purchases')
          .update(supabasePurchase)
          .eq('id', purchase.id);

        if (error) throw error;
        stats.purchases.migrated++;
      } else {
        // Insert new purchase
        const { error } = await supabase
          .from('purchases')
          .insert(supabasePurchase);

        if (error) throw error;
        stats.purchases.migrated++;
      }
    } catch (error) {
      stats.purchases.errors++;
      console.error(`   ❌ Error migrating purchase ${purchase.id}:`, error.message);
    }
  }

  console.log(`   ✓ Migrated ${stats.purchases.migrated} purchases`);
  if (stats.purchases.skipped > 0) {
    console.log(`   ⚠️  Skipped ${stats.purchases.skipped} purchases (invalid user IDs)`);
  }
}

async function migrateReviews() {
  console.log('\n⭐ Migrating Reviews...');
  const reviews = readJsonFile('reviews.json');
  stats.reviews.total = reviews.length;

  if (reviews.length === 0) {
    console.log('   No reviews to migrate');
    return;
  }

  for (const review of reviews) {
    try {
      const supabaseReview = {
        id: review.id,
        user_id: review.userId || review.user_id,
        product_id: review.productId || review.product_id,
        user_email: review.userEmail || review.user_email || null,
        rating: review.rating || 0,
        comment: review.comment || null,
        created_at: review.createdAt || review.created_at || new Date().toISOString(),
      };

      // Check if review already exists
      const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('id', review.id)
        .single();

      if (existing) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update(supabaseReview)
          .eq('id', review.id);

        if (error) throw error;
        stats.reviews.migrated++;
      } else {
        // Insert new review
        const { error } = await supabase
          .from('reviews')
          .insert(supabaseReview);

        if (error) throw error;
        stats.reviews.migrated++;
      }
    } catch (error) {
      stats.reviews.errors++;
      console.error(`   ❌ Error migrating review ${review.id}:`, error.message);
    }
  }

  console.log(`   ✓ Migrated ${stats.reviews.migrated} reviews`);
}

async function migrateCoupons() {
  console.log('\n🎫 Migrating Coupons...');
  const coupons = readJsonFile('coupons.json');
  stats.coupons.total = coupons.length;

  if (coupons.length === 0) {
    console.log('   No coupons to migrate');
    return;
  }

  // Get all user IDs from Supabase to validate foreign keys
  const { data: allUsers } = await supabase.from('users').select('id');
  const validUserIds = new Set(allUsers?.map(u => u.id) || []);

  for (const coupon of coupons) {
    try {
      let userId = coupon.userId || coupon.user_id || null;
      
      // Skip if user_id is provided but doesn't exist (coupons can have null user_id)
      if (userId && !validUserIds.has(userId)) {
        console.log(`   ⚠️  Skipping coupon ${coupon.code}: user ${userId} not found`);
        stats.coupons.skipped++;
        continue;
      }

      const supabaseCoupon = {
        id: coupon.id,
        code: coupon.code || '',
        user_id: userId,
        discount_type: coupon.discountType || coupon.discount_type || 'percentage',
        discount: coupon.amount || coupon.discount || 0,
        expires_at: coupon.expiresAt || coupon.expires_at || null,
        used: coupon.used || false,
        used_at: coupon.usedAt || coupon.used_at || null,
        used_in_order_id: coupon.usedInOrderId || coupon.used_in_order_id || null,
        created_at: coupon.createdAt || coupon.created_at || new Date().toISOString(),
      };

      // Check if coupon already exists
      const { data: existing } = await supabase
        .from('coupons')
        .select('id')
        .eq('id', coupon.id)
        .single();

      if (existing) {
        // Update existing coupon
        const { error } = await supabase
          .from('coupons')
          .update(supabaseCoupon)
          .eq('id', coupon.id);

        if (error) throw error;
        stats.coupons.migrated++;
      } else {
        // Insert new coupon
        const { error } = await supabase
          .from('coupons')
          .insert(supabaseCoupon);

        if (error) throw error;
        stats.coupons.migrated++;
      }
    } catch (error) {
      stats.coupons.errors++;
      console.error(`   ❌ Error migrating coupon ${coupon.code}:`, error.message);
    }
  }

  console.log(`   ✓ Migrated ${stats.coupons.migrated} coupons`);
  if (stats.coupons.skipped > 0) {
    console.log(`   ⚠️  Skipped ${stats.coupons.skipped} coupons (invalid user IDs)`);
  }
}

async function runMigration() {
  console.log('🚀 Starting Backend to Supabase Migration...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Using: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role Key' : 'Anon Key'}\n`);

  // Test connection
  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    console.log('✅ Connected to Supabase\n');
  } catch (error) {
    console.error('❌ Cannot connect to Supabase:', error.message);
    process.exit(1);
  }

  // Migrate in order (respecting foreign keys)
  await migrateUsers();
  await migrateProducts();
  await migratePurchases();
  await migrateReviews();
  await migrateCoupons();

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  
  const printStats = (name, stat) => {
    console.log(`\n${name}:`);
    console.log(`   Total: ${stat.total}`);
    console.log(`   ✅ Migrated: ${stat.migrated}`);
    if (stat.errors > 0) {
      console.log(`   ❌ Errors: ${stat.errors}`);
    }
  };

  printStats('Users', stats.users);
  printStats('Products', stats.products);
  printStats('Purchases', stats.purchases);
  printStats('Reviews', stats.reviews);
  printStats('Coupons', stats.coupons);

  const totalMigrated = 
    stats.users.migrated +
    stats.products.migrated +
    stats.purchases.migrated +
    stats.reviews.migrated +
    stats.coupons.migrated;

  const totalErrors = 
    stats.users.errors +
    stats.products.errors +
    stats.purchases.errors +
    stats.reviews.errors +
    stats.coupons.errors;

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Total migrated: ${totalMigrated} records`);
  if (totalErrors > 0) {
    console.log(`⚠️  Total errors: ${totalErrors}`);
  }
  console.log('='.repeat(60));

  if (totalErrors === 0) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('💡 Your app will now use Supabase for all data operations.');
    console.log('💡 Your backend JSON files are preserved as backup.');
  } else {
    console.log('\n⚠️  Migration completed with some errors. Please review above.');
  }
}

// Run migration
runMigration().catch((error) => {
  console.error('\n💥 Fatal error during migration:', error);
  process.exit(1);
});
