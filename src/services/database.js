/**
 * Database service layer
 * 
 * Uses backend API when available, falls back to localStorage.
 * Automatically migrates data from localStorage to backend on first connection.
 */

import {
  checkBackend,
  apiGetUsers,
  apiGetUser,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
  apiGetProducts,
  apiGetProduct,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
  apiGetUserCoupons,
  apiCreateCoupon,
  apiValidateCoupon,
  apiUseCoupon,
  apiGetPurchases,
  apiCreatePurchase,
  apiGetProductReviews,
  apiCreateReview,
  apiMigrateData,
} from './api';
import { migrateToBackend, isMigrationComplete } from '../utils/migration';
import { isSupabaseConfigured, testSupabaseConnection } from './supabase';
import * as supabaseDb from './supabaseDatabase';

// Cache backend availability
let useBackend = null;
let useSupabase = null;
let migrationAttempted = false;

export const resetSupabaseCache = () => {
  useSupabase = null;
};

/**
 * Check if Supabase is configured and available
 * @param {boolean} forceCheck - Force a fresh check, ignoring cache
 */
const shouldUseSupabase = async (forceCheck = false) => {
  // If forcing check, reset cache
  if (forceCheck) {
    useSupabase = null;
  }

  // If already cached and not forcing, return cached value
  if (useSupabase !== null && !forceCheck) {
    return useSupabase;
  }

  if (!isSupabaseConfigured()) {
    console.log('🔍 Supabase not configured in environment variables');
    useSupabase = false;
    return false;
  }

  // Supabase IS configured - test connection
  try {
    console.log('🔍 Testing Supabase connection...');
    const result = await testSupabaseConnection();
    useSupabase = result.success;
    if (result.success) {
      console.log('✅ Supabase is available and will be used for data operations');
    } else {
      console.error('❌ Supabase connection test failed:', result.error);
      console.error('❌ Check your Supabase URL, API key, and RLS policies!');
    }
    return result.success;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    console.error('❌ Error details:', error.message);
    useSupabase = false;
    return false;
  }
};

/**
 * Check if we should use backend API and attempt migration if needed
 * Always checks fresh to ensure we detect backend status changes
 */
const shouldUseBackend = async (forceCheck = false) => {
  // If Supabase is available, don't use backend API
  if (await shouldUseSupabase()) {
    return false;
  }

  try {
    const available = await checkBackend(forceCheck);
    
    // Update cache
    useBackend = available;
    
    if (available) {
      // If backend is available and migration hasn't been done, migrate data
      if (!migrationAttempted && !isMigrationComplete()) {
        migrationAttempted = true;
        try {
          await migrateToBackend();
          console.log('✅ Data migrated to backend successfully');
        } catch (error) {
          console.warn('⚠️ Migration failed, continuing with localStorage:', error);
        }
      }
    }

    return available;
  } catch (error) {
    useBackend = false;
    return false;
  }
};

// ============================================================================
// LOCALSTORAGE HELPERS (Fallback)
// ============================================================================

const getProductsFromLocalStorage = () => {
  const stored = localStorage.getItem('bloom_products');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing products from localStorage:', e);
      return [];
    }
  }
  return [];
};

const getUsersFromLocalStorage = () => {
  const stored = localStorage.getItem('bloom_users');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing users from localStorage:', e);
      return [];
    }
  }
  return [];
};

const getCouponsFromLocalStorage = () => {
  const stored = localStorage.getItem('bloom_coupons');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing coupons from localStorage:', e);
      return [];
    }
  }
  return [];
};

// ============================================================================
// PRODUCTS
// ============================================================================

export const getProducts = async () => {
  // Priority: Supabase > Backend API > localStorage
  
  // ALWAYS check Supabase first if configured
  if (isSupabaseConfigured()) {
    const forceCheck = useSupabase === null;
    const useSupabaseNow = await shouldUseSupabase(forceCheck);
    console.log('🔍 getProducts: Supabase configured, shouldUseSupabase =', useSupabaseNow);
    
    if (useSupabaseNow) {
      try {
        console.log('📦 Fetching products from Supabase...');
        const products = await supabaseDb.supabaseGetProducts();
        console.log('✅ Fetched products from Supabase:', products?.length || 0);
        if (products && products.length > 0) {
          console.log('📋 Product IDs from Supabase:', products.map(p => `${p.id}:${p.name}`).join(', '));
          // Also sync to localStorage as backup
          localStorage.setItem('bloom_products', JSON.stringify(products));
          return products;
        } else {
          console.log('📦 Supabase products table is empty');
          return [];
        }
      } catch (error) {
        console.error('❌ Error fetching products from Supabase:', error);
        console.error('❌ Error details:', error.message);
        // Reset cache and try once more
        useSupabase = null;
        const retryCheck = await shouldUseSupabase(true);
        if (retryCheck) {
          try {
            const products = await supabaseDb.supabaseGetProducts();
            if (products && products.length > 0) {
              localStorage.setItem('bloom_products', JSON.stringify(products));
              return products;
            }
          } catch (retryError) {
            console.error('❌ Retry also failed:', retryError);
          }
        }
        // If Supabase is configured, we should use it - but if it fails, log and continue to fallback
        console.warn('⚠️ Supabase fetch failed, will try fallback');
        useSupabase = false;
      }
    } else {
      console.warn('⚠️ Supabase connection test failed, will try fallback');
      useSupabase = false;
    }
  }
  
  // Try backend API
  const backendAvailable = await shouldUseBackend(true);
  if (backendAvailable) {
    try {
      const products = await apiGetProducts();
      console.log('✅ Fetched products from backend:', products?.length || 0);
      if (products && products.length > 0) {
        console.log('📋 Product IDs from backend:', products.map(p => p.id).join(', '));
        // Also sync to localStorage as backup
        localStorage.setItem('bloom_products', JSON.stringify(products));
      }
      return products || [];
    } catch (error) {
      console.error('❌ Error fetching products from backend:', error);
      console.warn('⚠️ Falling back to localStorage');
      useBackend = false;
      const localProducts = getProductsFromLocalStorage();
      console.log('📦 Using localStorage products:', localProducts?.length || 0);
      return localProducts;
    }
  }
  
  // Fallback to localStorage
  const localProducts = getProductsFromLocalStorage();
  console.log('📦 Backend not available, using localStorage products:', localProducts?.length || 0);
  return localProducts;
};

// Export localStorage helper for backward compatibility
export { getProductsFromLocalStorage };

export const saveProducts = async (products) => {
  // Remove popularity before saving (it's tracked separately)
  const productsWithoutPopularity = products.map(({ popularity, ...product }) => product);
  
  if (await shouldUseBackend()) {
    try {
      // Update each product individually (or implement bulk update endpoint)
      for (const product of productsWithoutPopularity) {
        try {
          await apiUpdateProduct(product.id, product);
        } catch (error) {
          // If product doesn't exist, create it
          if (error.message.includes('not found')) {
            await apiCreateProduct(product);
          }
        }
      }
      return { success: true };
    } catch (error) {
      console.warn('Backend unavailable, using localStorage:', error);
      useBackend = false;
    }
  }
  
  localStorage.setItem('bloom_products', JSON.stringify(productsWithoutPopularity));
  return { success: true };
};

export const addProduct = async (product) => {
  // Priority: Supabase > Backend API > localStorage
  
  // ALWAYS check Supabase first if configured - don't use cache for writes
  if (isSupabaseConfigured()) {
    const useSupabaseNow = await shouldUseSupabase(true);
    console.log('🔍 addProduct: Supabase configured, shouldUseSupabase =', useSupabaseNow);
    
    if (useSupabaseNow) {
      try {
        console.log('💾 Saving product to Supabase:', product.name || 'unnamed');
        const created = await supabaseDb.supabaseCreateProduct(product);
        console.log('✅ Product saved to Supabase successfully with ID:', created.id);
        
        // Also save to localStorage as backup
        const products = getProductsFromLocalStorage();
        if (!products.find(p => p.id === created.id)) {
          products.push(created);
          localStorage.setItem('bloom_products', JSON.stringify(products));
        }
        
        return created;
      } catch (error) {
        console.error('❌ CRITICAL: Failed to save product to Supabase!');
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Full error:', error);
        
        // Common RLS error
        if (error.code === '42501' || error.message?.includes('row-level security') || error.message?.includes('RLS')) {
          console.error('❌ RLS POLICY ERROR: Row-level security is blocking INSERT!');
          console.error('❌ Run the SQL in supabase/fix-rls-policies.sql in your Supabase SQL Editor');
          alert('❌ Cannot save product: Row-level security policy is blocking writes.\n\nPlease run the SQL in supabase/fix-rls-policies.sql in your Supabase dashboard.');
        }
        
        // Reset cache and try once more
        useSupabase = null;
        const retryCheck = await shouldUseSupabase(true);
        if (retryCheck) {
          try {
            console.log('🔄 Retrying Supabase save...');
            const created = await supabaseDb.supabaseCreateProduct(product);
            console.log('✅ Product saved to Supabase on retry with ID:', created.id);
            return created;
          } catch (retryError) {
            console.error('❌ Retry also failed:', retryError);
            alert(`❌ Failed to save product to Supabase!\n\nError: ${retryError.message}\n\nCheck your Supabase RLS policies.`);
          }
        }
        
        // Try fallback but log clearly
        console.error('⚠️ Falling back to backend API (Supabase failed)');
        useSupabase = false;
      }
    } else {
      console.error('❌ CRITICAL: Supabase is configured but connection test failed!');
      console.error('❌ Check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
      console.error('⚠️ Falling back to backend API (Supabase connection failed)');
      useSupabase = false;
    }
  }
  
  // Try backend API
  const backendAvailable = await shouldUseBackend(true);
  if (backendAvailable) {
    try {
      console.log('💾 Saving product to backend:', product.name || 'unnamed');
      const created = await apiCreateProduct(product);
      console.log('✅ Product saved to backend successfully with ID:', created.id);
      
      // Also save to localStorage as backup
      const products = getProductsFromLocalStorage();
      if (!products.find(p => p.id === created.id)) {
        products.push(created);
        localStorage.setItem('bloom_products', JSON.stringify(products));
        console.log('💾 Product also saved to localStorage as backup');
      }
      
      return created;
    } catch (error) {
      console.error('❌ Failed to save product to backend:', error);
      console.warn('⚠️ Falling back to localStorage');
      useBackend = false;
    }
  }
  
  // Fallback to localStorage - generate sequential ID
  console.log('💾 Saving product to localStorage:', product.name || 'unnamed');
  const products = getProductsFromLocalStorage();
  const numericIds = products
    .map(p => {
      const numId = parseInt(p.id, 10);
      return isNaN(numId) ? 0 : numId;
    })
    .filter(id => id > 0);
  const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
  const newId = (maxId + 1).toString();
  
  const newProduct = { ...product, id: newId };
  products.push(newProduct);
  localStorage.setItem('bloom_products', JSON.stringify(products));
  console.log('💾 Product saved to localStorage with ID:', newId);
  return newProduct;
};

export const updateProduct = async (productId, updates) => {
  // Priority: Supabase > Backend API > localStorage
  
  // Try Supabase first (force fresh check for writes)
  if (await shouldUseSupabase(true)) {
    try {
      console.log('💾 Updating product in Supabase:', productId);
      await supabaseDb.supabaseUpdateProduct(productId, updates);
      console.log('✅ Product updated in Supabase successfully');
      
      // Also update localStorage as backup
      const products = getProductsFromLocalStorage();
      const index = products.findIndex((p) => p.id === productId);
      if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        localStorage.setItem('bloom_products', JSON.stringify(products));
      }
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to update product in Supabase:', error);
      console.warn('⚠️ Falling back to backend API');
      useSupabase = false;
    }
  }
  
  // Try backend API
  const backendAvailable = await shouldUseBackend(true);
  if (backendAvailable) {
    try {
      console.log('💾 Updating product in backend:', productId);
      const updated = await apiUpdateProduct(productId, updates);
      console.log('✅ Product updated in backend successfully');
      
      // Also update localStorage as backup
      const products = getProductsFromLocalStorage();
      const index = products.findIndex((p) => p.id === productId);
      if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        localStorage.setItem('bloom_products', JSON.stringify(products));
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to update product in backend:', error);
      console.warn('⚠️ Falling back to localStorage');
      useBackend = false;
    }
  }
  
  // Fallback to localStorage
  const products = getProductsFromLocalStorage();
  const index = products.findIndex((p) => p.id === productId);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    localStorage.setItem('bloom_products', JSON.stringify(products));
    console.log('💾 Product updated in localStorage');
  }
  return { success: true };
};

export const deleteProduct = async (productId) => {
  // Priority: Supabase > Backend API > localStorage
  
  // Try Supabase first (force fresh check for writes)
  if (await shouldUseSupabase(true)) {
    try {
      console.log('🗑️ Deleting product from Supabase:', productId);
      await supabaseDb.supabaseDeleteProduct(productId);
      console.log('✅ Product deleted from Supabase successfully');
      
      // Also delete from localStorage as backup
      const products = getProductsFromLocalStorage();
      const filtered = products.filter((p) => p.id !== productId);
      localStorage.setItem('bloom_products', JSON.stringify(filtered));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete product from Supabase:', error);
      console.warn('⚠️ Falling back to backend API');
      useSupabase = false;
    }
  }
  
  // Try backend API
  const backendAvailable = await shouldUseBackend(true);
  if (backendAvailable) {
    try {
      console.log('🗑️ Deleting product from backend:', productId);
      await apiDeleteProduct(productId);
      console.log('✅ Product deleted from backend successfully');
      
      // Also delete from localStorage as backup
      const products = getProductsFromLocalStorage();
      const filtered = products.filter((p) => p.id !== productId);
      localStorage.setItem('bloom_products', JSON.stringify(filtered));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete product from backend:', error);
      console.warn('⚠️ Falling back to localStorage');
      useBackend = false;
    }
  }
  
  // Fallback to localStorage
  const products = getProductsFromLocalStorage();
  const filtered = products.filter((p) => p.id !== productId);
  localStorage.setItem('bloom_products', JSON.stringify(filtered));
  console.log('💾 Product deleted from localStorage');
  return { success: true };
};

// ============================================================================
// USERS
// ============================================================================

export const getUsers = async () => {
  // Priority: Supabase > Backend API > localStorage
  
  // Try Supabase first
  if (await shouldUseSupabase(useSupabase === null)) {
    try {
      console.log('👥 Fetching users from Supabase...');
      const users = await supabaseDb.supabaseGetUsers();
      console.log('✅ Fetched users from Supabase:', users?.length || 0);
      return users || [];
    } catch (error) {
      console.error('❌ Error fetching users from Supabase:', error);
      console.warn('⚠️ Falling back to backend API');
      useSupabase = false;
    }
  }
  
  // Try backend API
  if (await shouldUseBackend()) {
    try {
      const users = await apiGetUsers();
      console.log('✅ Fetched users from backend:', users.length);
      return users;
    } catch (error) {
      console.warn('⚠️ Backend unavailable, using localStorage:', error);
      useBackend = false;
      return getUsersFromLocalStorage();
    }
  }
  const localUsers = getUsersFromLocalStorage();
  console.log('📦 Using localStorage users:', localUsers.length);
  return localUsers;
};

// Export localStorage helper for backward compatibility
export { getUsersFromLocalStorage };

export const saveUsers = async (users) => {
  if (await shouldUseBackend()) {
    try {
      // Update each user individually
      for (const user of users) {
        try {
          await apiUpdateUser(user.id, user);
        } catch (error) {
          // If user doesn't exist, create it
          if (error.message.includes('not found')) {
            await apiCreateUser(user);
          }
        }
      }
      return { success: true };
    } catch (error) {
      console.warn('Backend unavailable, using localStorage:', error);
      useBackend = false;
    }
  }
  
  localStorage.setItem('bloom_users', JSON.stringify(users));
  return { success: true };
};

export const addUser = async (user) => {
  // Priority: Supabase > Backend API > localStorage
  
  // Try Supabase first (force fresh check for writes)
  if (await shouldUseSupabase(true)) {
    try {
      console.log('💾 Saving user to Supabase:', user.email);
      const result = await supabaseDb.supabaseCreateUser(user);
      console.log('✅ User saved to Supabase successfully:', result?.user?.email || result?.userId);
      
      // Also save to localStorage as backup
      const users = getUsersFromLocalStorage();
      if (!users.find(u => u.email === user.email)) {
        users.push(result.user || user);
        localStorage.setItem('bloom_users', JSON.stringify(users));
      }
      
      return result;
    } catch (error) {
      console.error('❌ Failed to save user to Supabase:', error);
      console.warn('⚠️ Falling back to backend API');
      useSupabase = false;
    }
  }
  
  // Try backend API
  const backendAvailable = await shouldUseBackend();
  if (backendAvailable) {
    try {
      console.log('💾 Saving user to backend:', user.email);
      const result = await apiCreateUser(user);
      console.log('✅ User saved to backend successfully:', result?.email || result?.id);
      // Also save to localStorage as backup
      const users = getUsersFromLocalStorage();
      if (!users.find(u => u.email === user.email)) {
        users.push(user);
        localStorage.setItem('bloom_users', JSON.stringify(users));
      }
      return { success: true, user: result };
    } catch (error) {
      console.error('❌ Failed to save user to backend:', error);
      console.warn('⚠️ Falling back to localStorage');
      useBackend = false;
    }
  }
  
  // Fallback to localStorage
  console.log('💾 Saving user to localStorage:', user.email);
  const users = getUsersFromLocalStorage();
  if (!users.find(u => u.email === user.email)) {
    users.push(user);
    localStorage.setItem('bloom_users', JSON.stringify(users));
  }
  return { success: true, user };
};

export const updateUser = async (userId, updates) => {
  // Priority: Supabase > Backend API > localStorage
  
  // Try Supabase first (force fresh check for writes)
  if (await shouldUseSupabase(true)) {
    try {
      await supabaseDb.supabaseUpdateUser(userId, updates);
      console.log('✅ User updated in Supabase:', userId);
      // Also update localStorage
      const users = getUsersFromLocalStorage();
      const index = users.findIndex((u) => u.id === userId);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem('bloom_users', JSON.stringify(users));
      }
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to update user in Supabase:', error);
      console.warn('⚠️ Falling back to backend API');
      useSupabase = false;
    }
  }
  
  // Try backend API
  if (await shouldUseBackend()) {
    try {
      await apiUpdateUser(userId, updates);
      return { success: true };
    } catch (error) {
      console.warn('Backend unavailable, using localStorage:', error);
      useBackend = false;
    }
  }
  
  const users = getUsersFromLocalStorage();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem('bloom_users', JSON.stringify(users));
  }
  return { success: true };
};

export const deleteUser = async (userId) => {
  // Priority: Supabase > Backend API > localStorage
  
  // Try Supabase first (force fresh check for writes)
  if (await shouldUseSupabase(true)) {
    try {
      console.log('🗑️ Deleting user from Supabase:', userId);
      await supabaseDb.supabaseDeleteUser(userId);
      // Also remove from localStorage
      const users = getUsersFromLocalStorage();
      const filtered = users.filter((u) => u.id !== userId);
      localStorage.setItem('bloom_users', JSON.stringify(filtered));
      console.log('✅ User deleted successfully from Supabase and localStorage');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete user from Supabase:', error);
      console.warn('⚠️ Falling back to backend API');
      useSupabase = false;
    }
  }
  
  // Try backend API
  if (await shouldUseBackend()) {
    try {
      console.log('🗑️ Deleting user from backend:', userId);
      await apiDeleteUser(userId);
      // Also remove from localStorage to keep it in sync
      const users = getUsersFromLocalStorage();
      const filtered = users.filter((u) => u.id !== userId);
      localStorage.setItem('bloom_users', JSON.stringify(filtered));
      console.log('✅ User deleted successfully from backend and localStorage');
      return { success: true };
    } catch (error) {
      console.warn('⚠️ Backend unavailable, using localStorage:', error);
      useBackend = false;
    }
  }
  
  console.log('🗑️ Deleting user from localStorage:', userId);
  const users = getUsersFromLocalStorage();
  const filtered = users.filter((u) => u.id !== userId);
  localStorage.setItem('bloom_users', JSON.stringify(filtered));
  return { success: true };
};

// ============================================================================
// COUPONS
// ============================================================================

export const getCoupons = async () => {
  // Priority: Supabase > Backend API > localStorage
  
  // Try Supabase first
  if (await shouldUseSupabase()) {
    try {
      const coupons = await supabaseDb.supabaseGetCoupons();
      console.log('✅ Fetched all coupons from Supabase:', coupons.length);
      return coupons;
    } catch (error) {
      console.error('❌ Error fetching coupons from Supabase:', error);
      console.warn('⚠️ Falling back to backend API');
      useSupabase = false;
    }
  }
  
  // Try backend API
  if (await shouldUseBackend()) {
    try {
      const coupons = await apiGetCoupons();
      console.log('✅ Fetched all coupons from backend:', coupons.length);
      return coupons;
    } catch (error) {
      console.warn('⚠️ Backend unavailable, using localStorage:', error);
      useBackend = false;
      return getCouponsFromLocalStorage();
    }
  }
  return getCouponsFromLocalStorage();
};

// Export localStorage helper for backward compatibility
export { getCouponsFromLocalStorage };

export const getUserCoupons = async (userId) => {
  // Priority: Supabase > Backend API > localStorage
  
  // Try Supabase first
  if (await shouldUseSupabase()) {
    try {
      const coupons = await supabaseDb.supabaseGetUserCoupons(userId);
      console.log('✅ Fetched user coupons from Supabase:', coupons.length);
      return coupons;
    } catch (error) {
      console.error('❌ Error fetching user coupons from Supabase:', error);
      console.warn('⚠️ Falling back to backend API');
      useSupabase = false;
    }
  }
  
  // Try backend API
  if (await shouldUseBackend()) {
    try {
      return await apiGetUserCoupons(userId);
    } catch (error) {
      console.warn('Backend unavailable, using localStorage:', error);
      useBackend = false;
    }
  }
  
  const coupons = await getCoupons();
  return coupons.filter((c) => c.userId === userId && !c.used);
};

export const addCoupon = async (coupon) => {
  // Priority: Supabase > Backend API > localStorage
  
  // Try Supabase first (force fresh check for writes)
  if (await shouldUseSupabase(true)) {
    try {
      const created = await supabaseDb.supabaseCreateCoupon(coupon);
      console.log('✅ Coupon saved to Supabase:', created.id);
      // Also save to localStorage as backup
      const coupons = getCouponsFromLocalStorage();
      coupons.push(created);
      localStorage.setItem('bloom_coupons', JSON.stringify(coupons));
      return { success: true, coupon: created };
    } catch (error) {
      console.error('❌ Failed to save coupon to Supabase:', error);
      console.warn('⚠️ Falling back to backend API');
      useSupabase = false;
    }
  }
  
  // Try backend API
  if (await shouldUseBackend()) {
    try {
      const created = await apiCreateCoupon(coupon);
      return { success: true, coupon: created };
    } catch (error) {
      console.warn('Backend unavailable, using localStorage:', error);
      useBackend = false;
    }
  }
  
  const coupons = getCouponsFromLocalStorage();
  coupons.push(coupon);
  localStorage.setItem('bloom_coupons', JSON.stringify(coupons));
  return { success: true, coupon };
};

export const updateCoupon = async (couponId, updates) => {
  // Priority: Supabase > Backend API > localStorage
  
  // Try Supabase first (force fresh check for writes)
  if (await shouldUseSupabase(true)) {
    try {
      console.log('💾 Updating coupon in Supabase:', couponId);
      await supabaseDb.supabaseUpdateCoupon(couponId, updates);
      console.log('✅ Coupon updated in Supabase successfully');
      
      // Also update localStorage as backup
      const coupons = getCouponsFromLocalStorage();
      const index = coupons.findIndex((c) => c.id === couponId);
      if (index !== -1) {
        coupons[index] = { ...coupons[index], ...updates };
        localStorage.setItem('bloom_coupons', JSON.stringify(coupons));
      }
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to update coupon in Supabase:', error);
      console.warn('⚠️ Falling back to localStorage');
      useSupabase = false;
    }
  }
  
  // Fallback to localStorage
  const coupons = getCouponsFromLocalStorage();
  const index = coupons.findIndex((c) => c.id === couponId);
  if (index !== -1) {
    coupons[index] = { ...coupons[index], ...updates };
    localStorage.setItem('bloom_coupons', JSON.stringify(coupons));
  }
  return { success: true };
};

export const validateCoupon = async (code, userId) => {
  // Priority: Supabase > Backend API > localStorage
  
  // Try Supabase first
  if (await shouldUseSupabase()) {
    try {
      const result = await supabaseDb.supabaseValidateCoupon(code, userId);
      return result;
    } catch (error) {
      console.error('❌ Error validating coupon in Supabase:', error);
      console.warn('⚠️ Falling back to backend API');
      useSupabase = false;
    }
  }
  
  // Try backend API
  if (await shouldUseBackend()) {
    try {
      const result = await apiValidateCoupon(code, userId);
      return result;
    } catch (error) {
      console.warn('Backend unavailable, using localStorage:', error);
      useBackend = false;
    }
  }
  
  const coupons = getCouponsFromLocalStorage();
  const coupon = coupons.find(
    (c) => c.code === code.toUpperCase() && c.userId === userId && !c.used
  );
  
  if (!coupon) {
    return { success: false, error: 'Invalid or already used coupon code' };
  }
  
  // Check if expired
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { success: false, error: 'Coupon has expired' };
  }
  
  return { success: true, coupon };
};

export const useCoupon = async (couponId, orderId) => {
  if (await shouldUseBackend()) {
    try {
      await apiUseCoupon(couponId, orderId);
      return { success: true };
    } catch (error) {
      console.warn('Backend unavailable, using localStorage:', error);
      useBackend = false;
    }
  }
  
  return updateCoupon(couponId, { used: true, usedInOrderId: orderId, usedAt: new Date().toISOString() });
};

// ============================================================================
// PURCHASES
// ============================================================================

export const getPurchases = async (userId) => {
  // Priority: Supabase > Backend API > localStorage
  
  // Try Supabase first
  if (await shouldUseSupabase()) {
    try {
      const purchases = await supabaseDb.supabaseGetPurchases(userId);
      console.log('✅ Fetched purchases from Supabase for user:', userId);
      return purchases;
    } catch (error) {
      console.error('❌ Error fetching purchases from Supabase:', error);
      console.warn('⚠️ Falling back to backend API');
      useSupabase = false;
    }
  }
  
  // Try backend API
  if (await shouldUseBackend()) {
    try {
      const purchases = await apiGetPurchases(userId);
      console.log('✅ Fetched purchases from backend for user:', userId);
      return purchases;
    } catch (error) {
      console.warn('⚠️ Backend unavailable, using localStorage:', error);
      useBackend = false;
    }
  }
  
  // Fallback to localStorage
  const purchaseHistoryKey = `bloom_purchase_history_${userId}`;
  const stored = localStorage.getItem(purchaseHistoryKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing purchase history:', e);
      return [];
    }
  }
  return [];
};

export const addPurchase = async (userId, purchaseData) => {
  // Priority: Supabase > Backend API > localStorage
  
  // Try Supabase first
  if (await shouldUseSupabase()) {
    try {
      const purchase = await supabaseDb.supabaseCreatePurchase({
        ...purchaseData,
        userId,
      });
      console.log('✅ Purchase saved to Supabase:', purchase.id);
      // Also save to localStorage as backup
      const purchaseHistoryKey = `bloom_purchase_history_${userId}`;
      const existingHistory = localStorage.getItem(purchaseHistoryKey);
      let purchaseHistory = [];
      if (existingHistory) {
        try {
          purchaseHistory = JSON.parse(existingHistory);
        } catch (e) {
          console.error('Error parsing purchase history:', e);
        }
      }
      purchaseHistory.push(purchase);
      localStorage.setItem(purchaseHistoryKey, JSON.stringify(purchaseHistory));
      return { success: true, purchase };
    } catch (error) {
      console.error('❌ Failed to save purchase to Supabase:', error);
      console.warn('⚠️ Falling back to backend API');
      useSupabase = false;
    }
  }
  
  // Try backend API
  if (await shouldUseBackend()) {
    try {
      const purchase = await apiCreatePurchase({
        ...purchaseData,
        userId,
      });
      console.log('✅ Purchase saved to backend:', purchase.id);
      // Also save to localStorage as backup
      const purchaseHistoryKey = `bloom_purchase_history_${userId}`;
      const existingHistory = localStorage.getItem(purchaseHistoryKey);
      let purchaseHistory = [];
      if (existingHistory) {
        try {
          purchaseHistory = JSON.parse(existingHistory);
        } catch (e) {
          console.error('Error parsing purchase history:', e);
        }
      }
      purchaseHistory.push(purchase);
      localStorage.setItem(purchaseHistoryKey, JSON.stringify(purchaseHistory));
      return { success: true, purchase };
    } catch (error) {
      console.error('❌ Failed to save purchase to backend:', error);
      console.warn('⚠️ Falling back to localStorage');
      useBackend = false;
    }
  }
  
  // Fallback to localStorage
  const purchaseHistoryKey = `bloom_purchase_history_${userId}`;
  const existingHistory = localStorage.getItem(purchaseHistoryKey);
  let purchaseHistory = [];
  if (existingHistory) {
    try {
      purchaseHistory = JSON.parse(existingHistory);
    } catch (e) {
      console.error('Error parsing purchase history:', e);
    }
  }
  purchaseHistory.push(purchaseData);
  localStorage.setItem(purchaseHistoryKey, JSON.stringify(purchaseHistory));
  console.log('💾 Purchase saved to localStorage:', purchaseData.id);
  return { success: true, purchase: purchaseData };
};

// ============================================================================
// REVIEWS
// ============================================================================

export const getReviews = async (productId) => {
  // Priority: Supabase > Backend API > localStorage
  
  // Try Supabase first
  if (await shouldUseSupabase()) {
    try {
      const reviews = await supabaseDb.supabaseGetReviews(productId);
      console.log('✅ Fetched reviews from Supabase for product:', productId);
      return reviews;
    } catch (error) {
      console.error('❌ Error fetching reviews from Supabase:', error);
      console.warn('⚠️ Falling back to backend API');
      useSupabase = false;
    }
  }
  
  // Try backend API
  if (await shouldUseBackend()) {
    try {
      const reviews = await apiGetProductReviews(productId);
      console.log('✅ Fetched reviews from backend for product:', productId);
      return reviews;
    } catch (error) {
      console.warn('⚠️ Backend unavailable, using localStorage:', error);
      useBackend = false;
    }
  }
  
  // Fallback to localStorage
  const stored = localStorage.getItem('bloom_reviews');
  if (stored) {
    try {
      const allReviews = JSON.parse(stored);
      return allReviews.filter((r) => r.productId === productId);
    } catch (e) {
      console.error('Error parsing reviews:', e);
      return [];
    }
  }
  return [];
};

export const addReview = async (reviewData) => {
  // Priority: Supabase > Backend API > localStorage
  
  // Try Supabase first (force fresh check for writes)
  if (await shouldUseSupabase(true)) {
    try {
      const review = await supabaseDb.supabaseCreateReview(reviewData);
      console.log('✅ Review saved to Supabase:', review.id);
      // Also save to localStorage as backup
      const stored = localStorage.getItem('bloom_reviews');
      let reviews = [];
      if (stored) {
        try {
          reviews = JSON.parse(stored);
        } catch (e) {
          console.error('Error parsing reviews:', e);
        }
      }
      reviews.push(review);
      localStorage.setItem('bloom_reviews', JSON.stringify(reviews));
      return { success: true, review };
    } catch (error) {
      console.error('❌ Failed to save review to Supabase:', error);
      console.warn('⚠️ Falling back to backend API');
      useSupabase = false;
    }
  }
  
  // Try backend API
  if (await shouldUseBackend()) {
    try {
      const review = await apiCreateReview(reviewData);
      console.log('✅ Review saved to backend:', review.id);
      // Also save to localStorage as backup
      const stored = localStorage.getItem('bloom_reviews');
      let reviews = [];
      if (stored) {
        try {
          reviews = JSON.parse(stored);
        } catch (e) {
          console.error('Error parsing reviews:', e);
        }
      }
      reviews.push(review);
      localStorage.setItem('bloom_reviews', JSON.stringify(reviews));
      return { success: true, review };
    } catch (error) {
      console.error('❌ Failed to save review to backend:', error);
      console.warn('⚠️ Falling back to localStorage');
      useBackend = false;
    }
  }
  
  // Fallback to localStorage
  const stored = localStorage.getItem('bloom_reviews');
  let reviews = [];
  if (stored) {
    try {
      reviews = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing reviews:', e);
    }
  }
  reviews.push(reviewData);
  localStorage.setItem('bloom_reviews', JSON.stringify(reviews));
  console.log('💾 Review saved to localStorage:', reviewData.id);
  return { success: true, review: reviewData };
};