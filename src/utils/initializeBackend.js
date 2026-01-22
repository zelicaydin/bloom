/**
 * Backend Initialization
 * 
 * This runs on app startup to:
 * 1. Check if backend is available
 * 2. Migrate localStorage data to backend if needed
 * 3. Import default products if backend is empty
 */

import { checkBackend } from '../services/api';
import { migrateToBackend, isMigrationComplete } from './migration';
import defaultProducts from '../data/products';
import { apiGetProducts, apiCreateProduct } from '../services/api';
import { resetSupabaseCache } from '../services/database';
import { isSupabaseConfigured, testSupabaseConnection } from '../services/supabase';

/**
 * Initialize backend connection and migrate data
 */
export const initializeBackend = async () => {
  try {
    // Reset Supabase cache to force fresh check
    try {
      resetSupabaseCache();
    } catch (error) {
      console.warn('⚠️ Could not reset Supabase cache:', error);
    }
    
    // Check Supabase first (highest priority)
    try {
      if (isSupabaseConfigured()) {
        console.log('🔍 Checking Supabase connection...');
        const supabaseResult = await testSupabaseConnection();
        if (supabaseResult.success) {
          console.log('✅ Supabase is configured and available - will be used for all data operations');
          return { success: true, usingSupabase: true };
        } else {
          console.warn('⚠️ Supabase is configured but connection test failed:', supabaseResult.error);
        }
      } else {
        console.log('ℹ️ Supabase not configured, checking backend API...');
      }
    } catch (error) {
      console.warn('⚠️ Supabase check failed:', error);
    }
    
    // Check if backend API is available (fallback)
    const backendAvailable = await checkBackend();
    
    if (!backendAvailable) {
      console.log('ℹ️ Backend server not available, using localStorage');
      return { success: false, usingBackend: false };
    }

    console.log('✅ Backend server connected');

    // Migrate localStorage data if not already done
    // Also check if there's data in localStorage that needs migration
    const hasLocalStorageData = 
      localStorage.getItem('bloom_users') || 
      localStorage.getItem('bloom_products') ||
      localStorage.getItem('bloom_coupons');
    
    if (!isMigrationComplete() || hasLocalStorageData) {
      console.log('🔄 Migrating data from localStorage to backend...');
      const migrationResult = await migrateToBackend();
      if (migrationResult.success) {
        console.log('✅ Migration completed:', migrationResult);
        // Only mark complete if we actually migrated something or confirmed no data to migrate
        if (migrationResult.imported && Object.values(migrationResult.imported).some(v => v > 0)) {
          localStorage.setItem('bloom_migration_complete', 'true');
        }
      } else {
        console.warn('⚠️ Migration had issues:', migrationResult);
      }
    }

    // Check if backend has products, if not, import defaults
    try {
      const existingProducts = await apiGetProducts();
      if (!existingProducts || existingProducts.length === 0) {
        console.log('📦 Importing default products to backend...');
        for (const product of defaultProducts) {
          try {
            await apiCreateProduct(product);
          } catch (error) {
            console.warn(`Failed to import product ${product.id}:`, error);
          }
        }
        console.log('✅ Default products imported');
      }
    } catch (error) {
      console.warn('⚠️ Could not check/import products:', error);
    }

    return { success: true, usingBackend: true };
  } catch (error) {
    console.error('❌ Backend initialization failed:', error);
    return { success: false, usingBackend: false, error: error.message };
  }
};
