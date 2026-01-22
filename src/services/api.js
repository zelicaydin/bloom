/**
 * API Service
 * 
 * Handles all communication with the backend server.
 * Provides fallback to localStorage if backend is unavailable.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Check if backend is available
 * Always checks fresh - doesn't cache permanently to ensure we detect backend status changes
 */
let backendCheckPromise = null;
let lastCheckTime = 0;
const CHECK_CACHE_DURATION = 5000; // Cache for 5 seconds to avoid excessive checks

export const checkBackend = async (forceCheck = false) => {
  const now = Date.now();
  
  // If we have a recent check and it's still pending or recent, use it
  if (!forceCheck && backendCheckPromise && (now - lastCheckTime) < CHECK_CACHE_DURATION) {
    return backendCheckPromise;
  }

  // Start a new check
  lastCheckTime = now;
  backendCheckPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000), // 2 second timeout
      });
      const isAvailable = response.ok;
      console.log('🔍 Backend check:', isAvailable ? '✅ Available' : '❌ Unavailable');
      return isAvailable;
    } catch (error) {
      console.log('🔍 Backend check: ❌ Unavailable (error:', error.message, ')');
      return false;
    }
  })();

  return backendCheckPromise;
};

/**
 * Make API request with error handling
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage = error.error || `Request failed with status ${response.status}`;
      console.error(`❌ API Error (${response.status}):`, errorMessage);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    // If network error, backend is likely unavailable
    if (error.name === 'TypeError' || error.name === 'AbortError') {
      backendAvailable = false;
    }
    throw error;
  }
};

// ============================================================================
// USERS API
// ============================================================================

export const apiGetUsers = async () => {
  return apiRequest('/users');
};

export const apiGetUser = async (userId) => {
  return apiRequest(`/users/${userId}`);
};

export const apiCreateUser = async (userData) => {
  try {
    const result = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    // Backend returns { success, userId, verificationCode, user }
    // Return the full result object so signUp can access verificationCode and userId
    return result;
  } catch (error) {
    // If the error is about email already existing, throw it with a clear message
    if (error.message && (error.message.includes('already registered') || error.message.includes('Email already'))) {
      console.log('❌ API: Email already registered:', userData.email);
      throw new Error('Email already registered');
    }
    console.error('❌ API: Signup error:', error.message);
    throw error;
  }
};

export const apiUpdateUser = async (userId, updates) => {
  return apiRequest(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const apiDeleteUser = async (userId) => {
  return apiRequest(`/users/${userId}`, {
    method: 'DELETE',
  });
};

export const apiLogin = async (email, password) => {
  return apiRequest('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const apiVerifyEmail = async (userId, code) => {
  return apiRequest('/users/verify-email', {
    method: 'POST',
    body: JSON.stringify({ userId, code }),
  });
};

export const apiResendVerification = async (userId) => {
  return apiRequest('/users/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
};

export const apiRequestPasswordReset = async (email) => {
  return apiRequest('/users/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const apiResetPassword = async (email, code, newPassword) => {
  return apiRequest('/users/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword }),
  });
};

// ============================================================================
// PRODUCTS API
// ============================================================================

export const apiGetProducts = async () => {
  return apiRequest('/products');
};

export const apiGetProduct = async (productId) => {
  return apiRequest(`/products/${productId}`);
};

export const apiCreateProduct = async (productData) => {
  return apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

export const apiUpdateProduct = async (productId, updates) => {
  return apiRequest(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const apiDeleteProduct = async (productId) => {
  return apiRequest(`/products/${productId}`, {
    method: 'DELETE',
  });
};

// ============================================================================
// PURCHASES API
// ============================================================================

export const apiGetPurchases = async (userId) => {
  return apiRequest(`/purchases/${userId}`);
};

export const apiCreatePurchase = async (purchaseData) => {
  return apiRequest('/purchases', {
    method: 'POST',
    body: JSON.stringify(purchaseData),
  });
};

// ============================================================================
// COUPONS API
// ============================================================================

export const apiGetCoupons = async () => {
  return apiRequest('/coupons');
};

export const apiGetUserCoupons = async (userId) => {
  return apiRequest(`/coupons/user/${userId}`);
};

export const apiCreateCoupon = async (couponData) => {
  return apiRequest('/coupons', {
    method: 'POST',
    body: JSON.stringify(couponData),
  });
};

export const apiValidateCoupon = async (code, userId) => {
  return apiRequest('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, userId }),
  });
};

export const apiUseCoupon = async (couponId, orderId) => {
  return apiRequest(`/coupons/${couponId}/use`, {
    method: 'PUT',
    body: JSON.stringify({ orderId }),
  });
};

// ============================================================================
// REVIEWS API
// ============================================================================

export const apiGetProductReviews = async (productId) => {
  return apiRequest(`/reviews/product/${productId}`);
};

export const apiCreateReview = async (reviewData) => {
  return apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
};

// ============================================================================
// MIGRATION API
// ============================================================================

export const apiMigrateData = async (migrationData) => {
  return apiRequest('/migrate/import', {
    method: 'POST',
    body: JSON.stringify(migrationData),
  });
};
