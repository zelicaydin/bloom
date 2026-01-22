/**
 * Migration Utility
 * 
 * This utility migrates data from localStorage to the backend server.
 * It reads all existing localStorage data and sends it to the backend API.
 * 
 * Usage: Call migrateToBackend() once when switching to backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Check if backend is available
 */
export const checkBackendAvailable = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Migrate all localStorage data to backend
 */
export const migrateToBackend = async () => {
  try {
    // Check if backend is available
    const backendAvailable = await checkBackendAvailable();
    if (!backendAvailable) {
      console.warn('Backend not available, skipping migration');
      return { success: false, error: 'Backend server not available' };
    }

    // Collect all localStorage data
    const migrationData = {
      users: [],
      products: [],
      coupons: [],
      purchases: [],
      reviews: [],
    };

    // Migrate users
    const usersData = localStorage.getItem('bloom_users');
    if (usersData) {
      try {
        migrationData.users = JSON.parse(usersData);
      } catch (e) {
        console.error('Error parsing users:', e);
      }
    }

    // Migrate products
    const productsData = localStorage.getItem('bloom_products');
    if (productsData) {
      try {
        migrationData.products = JSON.parse(productsData);
      } catch (e) {
        console.error('Error parsing products:', e);
      }
    }

    // Migrate coupons
    const couponsData = localStorage.getItem('bloom_coupons');
    if (couponsData) {
      try {
        migrationData.coupons = JSON.parse(couponsData);
      } catch (e) {
        console.error('Error parsing coupons:', e);
      }
    }

    // Migrate purchase history (check all user purchase histories)
    const purchaseHistoryKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('bloom_purchase_history_')
    );
    purchaseHistoryKeys.forEach(key => {
      try {
        const userId = key.replace('bloom_purchase_history_', '');
        const historyData = localStorage.getItem(key);
        if (historyData) {
          const purchases = JSON.parse(historyData);
          // Add userId to each purchase if not present
          purchases.forEach(purchase => {
            if (!purchase.userId) {
              purchase.userId = userId;
            }
          });
          migrationData.purchases.push(...purchases);
        }
      } catch (e) {
        console.error(`Error parsing purchase history from ${key}:`, e);
      }
    });

    // Migrate reviews (if stored in localStorage)
    const reviewsData = localStorage.getItem('bloom_reviews');
    if (reviewsData) {
      try {
        migrationData.reviews = JSON.parse(reviewsData);
      } catch (e) {
        console.error('Error parsing reviews:', e);
      }
    }

    // Send to backend
    const response = await fetch(`${API_BASE_URL}/migrate/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(migrationData),
    });

    if (!response.ok) {
      throw new Error('Failed to import data to backend');
    }

    const result = await response.json();
    console.log('✅ Migration successful:', result);

    // Only mark migration as complete if we actually imported data
    // This allows re-migration if new data appears in localStorage
    if (result.imported && Object.values(result.imported).some(v => v > 0)) {
      localStorage.setItem('bloom_migration_complete', 'true');
      localStorage.setItem('bloom_migration_date', new Date().toISOString());
    }

    return { success: true, ...result };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if migration has been completed
 */
export const isMigrationComplete = () => {
  return localStorage.getItem('bloom_migration_complete') === 'true';
};

/**
 * Reset migration status (allows re-migration)
 */
export const resetMigration = () => {
  localStorage.removeItem('bloom_migration_complete');
  localStorage.removeItem('bloom_migration_date');
};
