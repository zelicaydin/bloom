/**
 * Seed Database Script
 * 
 * This script deletes all existing data and populates the database
 * with meaningful seed data including products, users, purchases, reviews, and coupons.
 * 
 * Usage: npm run seed-data
 * 
 * Note: Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)
 * to be set in your .env file. Service role key bypasses RLS if enabled.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
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

// ============================================================================
// SEED DATA
// ============================================================================

const seedProducts = [
  {
    id: '1',
    name: 'Organic Shampoo',
    price: 18.00,
    brand: 'Bloom Labs',
    type: 'shampoo',
    description: 'Gentle, sulfate-free shampoo with organic ingredients for all hair types.',
    image: '/categories/cat3.png',
    markers: ['sustainablePackaging', 'organicIngredients'],
    rating: 4.5,
    reviews: 25,
    created_at: new Date('2026-01-05').toISOString(),
  },
  {
    id: '2',
    name: 'Hydrating Body Wash',
    price: 22.00,
    brand: 'Pure Earth',
    type: 'body-wash',
    description: 'Moisturizing body wash with natural extracts that nourish and hydrate your skin.',
    image: '/categories/cat2.png',
    markers: ['organicIngredients', 'recyclable'],
    rating: 4.2,
    reviews: 18,
    created_at: new Date('2026-01-02').toISOString(),
  },
  {
    id: '3',
    name: 'Botanical Face Cream',
    price: 45.00,
    brand: 'Bloom Labs',
    type: 'face-care',
    description: 'Rich, anti-aging face cream with botanical extracts and hyaluronic acid.',
    image: '/categories/cat1.png',
    markers: ['crueltyFree'],
    rating: 4.8,
    reviews: 42,
    created_at: new Date('2025-12-20').toISOString(),
  },
  {
    id: '4',
    name: 'Lavender Essential Oil',
    price: 28.00,
    brand: 'Pure Earth',
    type: 'oils',
    description: '100% pure lavender essential oil, perfect for aromatherapy and relaxation.',
    image: '/categories/cat6.png',
    markers: ['organicIngredients', 'sustainablePackaging'],
    rating: 4.6,
    reviews: 31,
    created_at: '2025-12-15',
  },
  {
    id: '5',
    name: 'Soy Candle - Vanilla',
    price: 32.00,
    brand: 'Bloom Labs',
    type: 'candles',
    description: 'Hand-poured soy candle with natural vanilla fragrance. 40-hour burn time.',
    image: '/categories/cat5.png',
    markers: ['sustainablePackaging', 'crueltyFree'],
    rating: 4.7,
    reviews: 28,
    created_at: '2025-12-10',
  },
  {
    id: '6',
    name: 'Wellness Tea Blend',
    price: 16.00,
    brand: 'Pure Earth',
    type: 'wellness',
    description: 'Organic herbal tea blend with chamomile, mint, and lemon balm for relaxation.',
    image: '/categories/cat4.png',
    markers: ['organicIngredients', 'sustainablePackaging'],
    rating: 4.4,
    reviews: 22,
    created_at: '2025-12-08',
  },
  {
    id: '7',
    name: 'Conditioning Hair Mask',
    price: 35.00,
    brand: 'Bloom Labs',
    type: 'hair-care',
    description: 'Deep conditioning mask with argan oil and keratin for damaged hair.',
    image: '/categories/cat3.png',
    markers: ['organicIngredients', 'crueltyFree', 'recyclable'],
    rating: 4.9,
    reviews: 55,
    created_at: '2025-12-05',
  },
  {
    id: '8',
    name: 'Exfoliating Body Scrub',
    price: 26.00,
    brand: 'Pure Earth',
    type: 'body-care',
    description: 'Gentle body scrub with sea salt and coconut oil for smooth, glowing skin.',
    image: '/categories/cat2.png',
    markers: ['organicIngredients', 'sustainablePackaging'],
    rating: 4.3,
    reviews: 19,
    created_at: '2025-12-01',
  },
  {
    id: '9',
    name: 'Vitamin C Serum',
    price: 42.00,
    brand: 'Bloom Labs',
    type: 'face-care',
    description: 'Brightening serum with 20% vitamin C and ferulic acid for radiant skin.',
    image: '/categories/cat1.png',
    markers: ['crueltyFree', 'recyclable'],
    rating: 4.6,
    reviews: 38,
    created_at: '2025-11-28',
  },
  {
    id: '10',
    name: 'Eucalyptus Essential Oil',
    price: 24.00,
    brand: 'Pure Earth',
    type: 'oils',
    description: 'Pure eucalyptus oil for respiratory support and natural cleaning.',
    image: '/categories/cat6.png',
    markers: ['organicIngredients'],
    rating: 4.5,
    reviews: 27,
    created_at: '2025-11-25',
  },
  {
    id: '11',
    name: 'Soy Candle - Sandalwood',
    price: 34.00,
    brand: 'Bloom Labs',
    type: 'candles',
    description: 'Aromatic soy candle with warm sandalwood fragrance. 45-hour burn time.',
    image: '/categories/cat5.png',
    markers: ['sustainablePackaging', 'crueltyFree', 'recyclable'],
    rating: 4.8,
    reviews: 33,
    created_at: '2025-11-20',
  },
  {
    id: '12',
    name: 'Detox Green Tea',
    price: 18.00,
    brand: 'Pure Earth',
    type: 'wellness',
    description: 'Antioxidant-rich green tea blend with matcha and ginseng for energy and detox.',
    image: '/categories/cat4.png',
    markers: ['organicIngredients', 'sustainablePackaging'],
    rating: 4.4,
    reviews: 21,
    created_at: '2025-11-18',
  },
];

// Hash password function (simple SHA-256 for demo)
import { createHash } from 'crypto';

const hashPassword = (password) => {
  return createHash('sha256').update(password).digest('hex');
};

const seedUsers = () => {
  const passwordHash = hashPassword('password123'); // All seed users have same password
  
  return [
    {
      id: 'admin-1',
      name: 'Admin',
      surname: 'User',
      email: 'admin@bloom.com',
      password: passwordHash,
      photo: null,
      card_info: {
        number: '**** **** **** 1234',
        expiry: '12/25',
        name: 'Admin User',
      },
      is_admin: true,
      email_verified: true,
      created_at: new Date('2025-01-01').toISOString(),
    },
    {
      id: 'user-1',
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      password: passwordHash,
      photo: null,
      card_info: {
        number: '**** **** **** 5678',
        expiry: '06/26',
        name: 'John Doe',
      },
      is_admin: false,
      email_verified: true,
      created_at: new Date('2025-11-01').toISOString(),
    },
    {
      id: 'user-2',
      name: 'Jane',
      surname: 'Smith',
      email: 'jane.smith@example.com',
      password: passwordHash,
      photo: null,
      card_info: null,
      is_admin: false,
      email_verified: true,
      created_at: new Date('2025-11-15').toISOString(),
    },
    {
      id: 'user-3',
      name: 'Alex',
      surname: 'Johnson',
      email: 'alex.johnson@example.com',
      password: passwordHash,
      photo: null,
      card_info: {
        number: '**** **** **** 9012',
        expiry: '09/27',
        name: 'Alex Johnson',
      },
      is_admin: false,
      email_verified: false, // Unverified user for testing
      created_at: new Date('2025-12-01').toISOString(),
    },
  ];
};

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function clearAllData() {
  console.log('🗑️  Clearing all existing data...');
  
  try {
    // Delete in order to respect foreign key constraints
    // Fetch all IDs first, then delete them (works better with RLS)
    
    // Clear reviews
    const { data: reviews } = await supabase.from('reviews').select('id');
    if (reviews && reviews.length > 0) {
      const { error } = await supabase.from('reviews').delete().in('id', reviews.map(r => r.id));
      if (error) console.warn('⚠️  Error clearing reviews:', error.message);
      else console.log(`   ✓ Cleared ${reviews.length} reviews`);
    } else {
      console.log('   ✓ No reviews to clear');
    }
    
    // Clear purchases
    const { data: purchases } = await supabase.from('purchases').select('id');
    if (purchases && purchases.length > 0) {
      const { error } = await supabase.from('purchases').delete().in('id', purchases.map(p => p.id));
      if (error) console.warn('⚠️  Error clearing purchases:', error.message);
      else console.log(`   ✓ Cleared ${purchases.length} purchases`);
    } else {
      console.log('   ✓ No purchases to clear');
    }
    
    // Clear coupons
    const { data: coupons } = await supabase.from('coupons').select('id');
    if (coupons && coupons.length > 0) {
      const { error } = await supabase.from('coupons').delete().in('id', coupons.map(c => c.id));
      if (error) console.warn('⚠️  Error clearing coupons:', error.message);
      else console.log(`   ✓ Cleared ${coupons.length} coupons`);
    } else {
      console.log('   ✓ No coupons to clear');
    }
    
    // Clear products
    const { data: products } = await supabase.from('products').select('id');
    if (products && products.length > 0) {
      const { error } = await supabase.from('products').delete().in('id', products.map(p => p.id));
      if (error) console.warn('⚠️  Error clearing products:', error.message);
      else console.log(`   ✓ Cleared ${products.length} products`);
    } else {
      console.log('   ✓ No products to clear');
    }
    
    // Clear users (last, as other tables reference it)
    const { data: users } = await supabase.from('users').select('id');
    if (users && users.length > 0) {
      const { error } = await supabase.from('users').delete().in('id', users.map(u => u.id));
      if (error) console.warn('⚠️  Error clearing users:', error.message);
      else console.log(`   ✓ Cleared ${users.length} users`);
    } else {
      console.log('   ✓ No users to clear');
    }
    
    console.log('✅ All data cleared successfully\n');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

async function seedProductsData() {
  console.log('📦 Seeding products...');
  
  const { data, error } = await supabase
    .from('products')
    .insert(seedProducts)
    .select();
  
  if (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
  
  console.log(`✅ Seeded ${data.length} products`);
  return data;
}

async function seedUsersData() {
  console.log('👥 Seeding users...');
  
  const users = seedUsers();
  const { data, error } = await supabase
    .from('users')
    .insert(users)
    .select();
  
  if (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
  
  console.log(`✅ Seeded ${data.length} users`);
  return data;
}

async function seedPurchasesData(users, products) {
  console.log('🛒 Seeding purchases...');
  
  const purchases = [
    {
      id: 'purchase-1',
      user_id: users[1].id, // John Doe
      items: [
        { productId: products[0].id, name: products[0].name, price: products[0].price, quantity: 2 },
        { productId: products[2].id, name: products[2].name, price: products[2].price, quantity: 1 },
      ],
      subtotal: (products[0].price * 2) + products[2].price,
      discount: 0,
      total: (products[0].price * 2) + products[2].price,
      coupon: null,
      payment_method: { type: 'card', last4: '5678' },
      date: new Date('2025-12-10').toISOString(),
    },
    {
      id: 'purchase-2',
      user_id: users[1].id, // John Doe
      items: [
        { productId: products[4].id, name: products[4].name, price: products[4].price, quantity: 1 },
      ],
      subtotal: products[4].price,
      discount: 5.00,
      total: products[4].price - 5.00,
      coupon: { code: 'WELCOME10', discount: 5.00 },
      payment_method: { type: 'card', last4: '5678' },
      date: new Date('2025-12-05').toISOString(),
    },
    {
      id: 'purchase-3',
      user_id: users[2].id, // Jane Smith
      items: [
        { productId: products[1].id, name: products[1].name, price: products[1].price, quantity: 3 },
        { productId: products[6].id, name: products[6].name, price: products[6].price, quantity: 1 },
      ],
      subtotal: (products[1].price * 3) + products[6].price,
      discount: 0,
      total: (products[1].price * 3) + products[6].price,
      coupon: null,
      payment_method: { type: 'card', last4: '1234' },
      date: new Date('2025-11-20').toISOString(),
    },
  ];
  
  const { data, error } = await supabase
    .from('purchases')
    .insert(purchases)
    .select();
  
  if (error) {
    console.error('❌ Error seeding purchases:', error);
    throw error;
  }
  
  console.log(`✅ Seeded ${data.length} purchases`);
  return data;
}

async function seedReviewsData(users, products) {
  console.log('⭐ Seeding reviews...');
  
  const reviews = [
    {
      id: 'review-1',
      user_id: users[1].id,
      product_id: products[0].id,
      user_email: users[1].email,
      rating: 5,
      comment: 'Amazing shampoo! My hair feels so soft and healthy. Highly recommend!',
      created_at: new Date('2025-12-12').toISOString(),
    },
    {
      id: 'review-2',
      user_id: users[1].id,
      product_id: products[2].id,
      user_email: users[1].email,
      rating: 5,
      comment: 'Best face cream I\'ve ever used. My skin looks radiant!',
      created_at: new Date('2025-12-11').toISOString(),
    },
    {
      id: 'review-3',
      user_id: users[2].id,
      product_id: products[1].id,
      user_email: users[2].email,
      rating: 4,
      comment: 'Great body wash, very moisturizing. The scent is lovely.',
      created_at: new Date('2025-11-22').toISOString(),
    },
    {
      id: 'review-4',
      user_id: users[2].id,
      product_id: products[6].id,
      user_email: users[2].email,
      rating: 5,
      comment: 'This hair mask saved my damaged hair! Will definitely repurchase.',
      created_at: new Date('2025-11-21').toISOString(),
    },
    {
      id: 'review-5',
      user_id: users[3].id,
      product_id: products[4].id,
      user_email: users[3].email,
      rating: 4,
      comment: 'Beautiful candle with a long burn time. The vanilla scent is perfect.',
      created_at: new Date('2025-12-08').toISOString(),
    },
  ];
  
  const { data, error } = await supabase
    .from('reviews')
    .insert(reviews)
    .select();
  
  if (error) {
    console.error('❌ Error seeding reviews:', error);
    throw error;
  }
  
  console.log(`✅ Seeded ${data.length} reviews`);
  return data;
}

async function seedCouponsData(users) {
  console.log('🎫 Seeding coupons...');
  
  const coupons = [
    {
      id: 'coupon-1',
      code: 'WELCOME10',
      user_id: users[1].id, // John Doe
      discount_type: 'fixed',
      discount: 10.00,
      expires_at: new Date('2026-12-31').toISOString(),
      used: true,
      used_at: new Date('2025-12-05').toISOString(),
      used_in_order_id: 'purchase-2',
      created_at: new Date('2025-11-01').toISOString(),
    },
    {
      id: 'coupon-2',
      code: 'SAVE20',
      user_id: users[2].id, // Jane Smith
      discount_type: 'percentage',
      discount: 20.00,
      expires_at: new Date('2026-06-30').toISOString(),
      used: false,
      created_at: new Date('2025-12-01').toISOString(),
    },
    {
      id: 'coupon-3',
      code: 'SPRING15',
      user_id: users[1].id, // John Doe
      discount_type: 'percentage',
      discount: 15.00,
      expires_at: new Date('2026-04-30').toISOString(),
      used: false,
      created_at: new Date('2025-12-10').toISOString(),
    },
  ];
  
  const { data, error } = await supabase
    .from('coupons')
    .insert(coupons)
    .select();
  
  if (error) {
    console.error('❌ Error seeding coupons:', error);
    throw error;
  }
  
  console.log(`✅ Seeded ${data.length} coupons`);
  return data;
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');
  
  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (testError && testError.code !== 'PGRST116') { // PGRST116 = no rows returned (OK)
      console.error('❌ Cannot connect to Supabase:', testError);
      process.exit(1);
    }
    
    // Clear all existing data
    await clearAllData();
    
    // Seed data in order (respecting foreign keys)
    const products = await seedProductsData();
    const users = await seedUsersData();
    const purchases = await seedPurchasesData(users, products);
    const reviews = await seedReviewsData(users, products);
    const coupons = await seedCouponsData(users);
    
    console.log('\n✅ Database seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - ${products.length} products`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${purchases.length} purchases`);
    console.log(`   - ${reviews.length} reviews`);
    console.log(`   - ${coupons.length} coupons`);
    console.log(`\n🔑 Test Accounts:`);
    console.log(`   - Admin: admin@bloom.com / password123`);
    console.log(`   - User: john.doe@example.com / password123`);
    console.log(`   - User: jane.smith@example.com / password123`);
    console.log(`   - User (unverified): alex.johnson@example.com / password123`);
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();
