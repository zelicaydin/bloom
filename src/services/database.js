import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Database service layer with localStorage fallback
 * This allows gradual migration to Supabase while preserving existing data
 */

// ============ PRODUCTS ============

export const getProducts = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products from Supabase:', error);
      // Fallback to localStorage
      return getProductsFromLocalStorage();
    }
  }
  return getProductsFromLocalStorage();
};

export const getProductsFromLocalStorage = () => {
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

export const saveProducts = async (products) => {
  // Remove popularity before saving (it's tracked separately)
  const productsWithoutPopularity = products.map(({ popularity, ...product }) => product);

  if (isSupabaseConfigured()) {
    try {
      // Delete all existing products and insert new ones
      // (For simplicity, we'll do upsert based on id)
      const { error: deleteError } = await supabase.from('products').delete().neq('id', '0');
      
      if (deleteError && deleteError.code !== 'PGRST116') {
        // PGRST116 means no rows to delete, which is fine
        throw deleteError;
      }

      if (productsWithoutPopularity.length > 0) {
        const { error: insertError } = await supabase
          .from('products')
          .insert(productsWithoutPopularity);

        if (insertError) throw insertError;
      }

      // Also save to localStorage as backup
      localStorage.setItem('bloom_products', JSON.stringify(productsWithoutPopularity));
      return { success: true };
    } catch (error) {
      console.error('Error saving products to Supabase:', error);
      // Fallback to localStorage
      localStorage.setItem('bloom_products', JSON.stringify(productsWithoutPopularity));
      return { success: true, fallback: true };
    }
  }

  // Use localStorage only
  localStorage.setItem('bloom_products', JSON.stringify(productsWithoutPopularity));
  return { success: true };
};

export const addProduct = async (product) => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;

      // Also save to localStorage as backup
      const products = getProductsFromLocalStorage();
      products.push(data);
      localStorage.setItem('bloom_products', JSON.stringify(products));

      return { success: true, product: data };
    } catch (error) {
      console.error('Error adding product to Supabase:', error);
      // Fallback to localStorage
      const products = getProductsFromLocalStorage();
      products.push(product);
      localStorage.setItem('bloom_products', JSON.stringify(products));
      return { success: true, product, fallback: true };
    }
  }

  // Use localStorage only
  const products = getProductsFromLocalStorage();
  products.push(product);
  localStorage.setItem('bloom_products', JSON.stringify(products));
  return { success: true, product };
};

export const updateProduct = async (productId, updates) => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      // Also update localStorage
      const products = getProductsFromLocalStorage();
      const index = products.findIndex((p) => p.id === productId);
      if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        localStorage.setItem('bloom_products', JSON.stringify(products));
      }

      return { success: true, product: data };
    } catch (error) {
      console.error('Error updating product in Supabase:', error);
      // Fallback to localStorage
      const products = getProductsFromLocalStorage();
      const index = products.findIndex((p) => p.id === productId);
      if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        localStorage.setItem('bloom_products', JSON.stringify(products));
      }
      return { success: true, fallback: true };
    }
  }

  // Use localStorage only
  const products = getProductsFromLocalStorage();
  const index = products.findIndex((p) => p.id === productId);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    localStorage.setItem('bloom_products', JSON.stringify(products));
  }
  return { success: true };
};

export const deleteProduct = async (productId) => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      // Also remove from localStorage
      const products = getProductsFromLocalStorage();
      const filtered = products.filter((p) => p.id !== productId);
      localStorage.setItem('bloom_products', JSON.stringify(filtered));

      return { success: true };
    } catch (error) {
      console.error('Error deleting product from Supabase:', error);
      // Fallback to localStorage
      const products = getProductsFromLocalStorage();
      const filtered = products.filter((p) => p.id !== productId);
      localStorage.setItem('bloom_products', JSON.stringify(filtered));
      return { success: true, fallback: true };
    }
  }

  // Use localStorage only
  const products = getProductsFromLocalStorage();
  const filtered = products.filter((p) => p.id !== productId);
  localStorage.setItem('bloom_products', JSON.stringify(filtered));
  return { success: true };
};

// ============ USERS ============

export const getUsers = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users from Supabase:', error);
      // Fallback to localStorage
      return getUsersFromLocalStorage();
    }
  }
  return getUsersFromLocalStorage();
};

export const getUsersFromLocalStorage = () => {
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

export const saveUsers = async (users) => {
  if (isSupabaseConfigured()) {
    try {
      // Delete all existing users and insert new ones
      const { error: deleteError } = await supabase.from('users').delete().neq('id', '0');

      if (deleteError && deleteError.code !== 'PGRST116') {
        throw deleteError;
      }

      if (users.length > 0) {
        const { error: insertError } = await supabase.from('users').insert(users);

        if (insertError) throw insertError;
      }

      // Also save to localStorage as backup
      localStorage.setItem('bloom_users', JSON.stringify(users));
      return { success: true };
    } catch (error) {
      console.error('Error saving users to Supabase:', error);
      // Fallback to localStorage
      localStorage.setItem('bloom_users', JSON.stringify(users));
      return { success: true, fallback: true };
    }
  }

  // Use localStorage only
  localStorage.setItem('bloom_users', JSON.stringify(users));
  return { success: true };
};

export const addUser = async (user) => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();

      if (error) throw error;

      // Also save to localStorage as backup
      const users = getUsersFromLocalStorage();
      users.push(data);
      localStorage.setItem('bloom_users', JSON.stringify(users));

      return { success: true, user: data };
    } catch (error) {
      console.error('Error adding user to Supabase:', error);
      // Fallback to localStorage
      const users = getUsersFromLocalStorage();
      users.push(user);
      localStorage.setItem('bloom_users', JSON.stringify(users));
      return { success: true, user, fallback: true };
    }
  }

  // Use localStorage only
  const users = getUsersFromLocalStorage();
  users.push(user);
  localStorage.setItem('bloom_users', JSON.stringify(users));
  return { success: true, user };
};

export const updateUser = async (userId, updates) => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Also update localStorage
      const users = getUsersFromLocalStorage();
      const index = users.findIndex((u) => u.id === userId);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem('bloom_users', JSON.stringify(users));
      }

      return { success: true, user: data };
    } catch (error) {
      console.error('Error updating user in Supabase:', error);
      // Fallback to localStorage
      const users = getUsersFromLocalStorage();
      const index = users.findIndex((u) => u.id === userId);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem('bloom_users', JSON.stringify(users));
      }
      return { success: true, fallback: true };
    }
  }

  // Use localStorage only
  const users = getUsersFromLocalStorage();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem('bloom_users', JSON.stringify(users));
  }
  return { success: true };
};

export const deleteUser = async (userId) => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);

      if (error) throw error;

      // Also remove from localStorage
      const users = getUsersFromLocalStorage();
      const filtered = users.filter((u) => u.id !== userId);
      localStorage.setItem('bloom_users', JSON.stringify(filtered));

      return { success: true };
    } catch (error) {
      console.error('Error deleting user from Supabase:', error);
      // Fallback to localStorage
      const users = getUsersFromLocalStorage();
      const filtered = users.filter((u) => u.id !== userId);
      localStorage.setItem('bloom_users', JSON.stringify(filtered));
      return { success: true, fallback: true };
    }
  }

  // Use localStorage only
  const users = getUsersFromLocalStorage();
  const filtered = users.filter((u) => u.id !== userId);
  localStorage.setItem('bloom_users', JSON.stringify(filtered));
  return { success: true };
};

// ============ MIGRATION ============

/**
 * Migrate existing localStorage data to Supabase
 * This should be called once when Supabase is first configured
 */
export const migrateToSupabase = async () => {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, skipping migration');
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Check if migration has already been done
    const migrationKey = 'bloom_migrated_to_supabase';
    const alreadyMigrated = localStorage.getItem(migrationKey);
    if (alreadyMigrated === 'true') {
      console.log('Migration already completed');
      return { success: true, alreadyMigrated: true };
    }

    // Migrate products
    const products = getProductsFromLocalStorage();
    if (products.length > 0) {
      const { error: productsError } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'id' });

      if (productsError) {
        console.error('Error migrating products:', productsError);
      } else {
        console.log(`Migrated ${products.length} products to Supabase`);
      }
    }

    // Migrate users
    const users = getUsersFromLocalStorage();
    if (users.length > 0) {
      const { error: usersError } = await supabase
        .from('users')
        .upsert(users, { onConflict: 'id' });

      if (usersError) {
        console.error('Error migrating users:', usersError);
      } else {
        console.log(`Migrated ${users.length} users to Supabase`);
      }
    }

    // Mark migration as complete
    localStorage.setItem(migrationKey, 'true');

    return { success: true };
  } catch (error) {
    console.error('Error during migration:', error);
    return { success: false, error: error.message };
  }
};
