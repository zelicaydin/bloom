/**
 * Quick test to verify product addition to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('🧪 Testing product addition to Supabase...\n');
  
  // 1. Check current products
  const { data: before, error: beforeError } = await supabase
    .from('products')
    .select('id, name')
    .order('id', { ascending: false })
    .limit(5);
  
  if (beforeError) {
    console.error('❌ Error fetching products:', beforeError);
    process.exit(1);
  }
  
  console.log(`📦 Current products in Supabase: ${before?.length || 0}`);
  if (before && before.length > 0) {
    console.log('   Latest products:');
    before.forEach(p => console.log(`   - ${p.id}: ${p.name}`));
  }
  
  // 2. Add a test product
  const testProduct = {
    id: `test-${Date.now()}`,
    name: 'Test Product ' + Date.now(),
    price: 99.99,
    brand: 'Test Brand',
    type: 'test',
    description: 'This is a test product',
    image: '/categories/cat1.png',
    markers: ['organicIngredients'],
    rating: 4.5,
    reviews: 0,
    created_at: new Date().toISOString(),
  };
  
  console.log('\n➕ Adding test product...');
  const { data: added, error: addError } = await supabase
    .from('products')
    .insert(testProduct)
    .select()
    .single();
  
  if (addError) {
    console.error('❌ Error adding product:', addError);
    process.exit(1);
  }
  
  console.log('✅ Test product added:', added.id, added.name);
  
  // 3. Verify it's there
  const { data: after, error: afterError } = await supabase
    .from('products')
    .select('id, name')
    .eq('id', testProduct.id)
    .single();
  
  if (afterError || !after) {
    console.error('❌ Product not found after adding!', afterError);
    process.exit(1);
  }
  
  console.log('✅ Product verified in Supabase:', after.id, after.name);
  
  // 4. Clean up
  console.log('\n🧹 Cleaning up test product...');
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', testProduct.id);
  
  if (deleteError) {
    console.warn('⚠️ Could not delete test product:', deleteError);
  } else {
    console.log('✅ Test product deleted');
  }
  
  console.log('\n✅ All tests passed! Supabase product operations are working.');
}

test().catch(console.error);
