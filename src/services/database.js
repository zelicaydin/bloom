/**
 * Database service layer using localStorage
 */

// ============ PRODUCTS ============

export const getProducts = async () => {
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
  localStorage.setItem('bloom_products', JSON.stringify(productsWithoutPopularity));
  return { success: true };
};

export const addProduct = async (product) => {
  const products = getProductsFromLocalStorage();
  products.push(product);
  localStorage.setItem('bloom_products', JSON.stringify(products));
  return { success: true, product };
};

export const updateProduct = async (productId, updates) => {
  const products = getProductsFromLocalStorage();
  const index = products.findIndex((p) => p.id === productId);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    localStorage.setItem('bloom_products', JSON.stringify(products));
  }
  return { success: true };
};

export const deleteProduct = async (productId) => {
  const products = getProductsFromLocalStorage();
  const filtered = products.filter((p) => p.id !== productId);
  localStorage.setItem('bloom_products', JSON.stringify(filtered));
  return { success: true };
};

// ============ USERS ============

export const getUsers = async () => {
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
  localStorage.setItem('bloom_users', JSON.stringify(users));
  return { success: true };
};

export const addUser = async (user) => {
  const users = getUsersFromLocalStorage();
  users.push(user);
  localStorage.setItem('bloom_users', JSON.stringify(users));
  return { success: true, user };
};

export const updateUser = async (userId, updates) => {
  const users = getUsersFromLocalStorage();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem('bloom_users', JSON.stringify(users));
  }
  return { success: true };
};

export const deleteUser = async (userId) => {
  const users = getUsersFromLocalStorage();
  const filtered = users.filter((u) => u.id !== userId);
  localStorage.setItem('bloom_users', JSON.stringify(filtered));
  return { success: true };
};

// ============ COUPONS ============

export const getCoupons = async () => {
  return getCouponsFromLocalStorage();
};

export const getCouponsFromLocalStorage = () => {
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

export const getUserCoupons = async (userId) => {
  const coupons = await getCoupons();
  return coupons.filter((c) => c.userId === userId && !c.used);
};

export const addCoupon = async (coupon) => {
  const coupons = getCouponsFromLocalStorage();
  coupons.push(coupon);
  localStorage.setItem('bloom_coupons', JSON.stringify(coupons));
  return { success: true, coupon };
};

export const updateCoupon = async (couponId, updates) => {
  const coupons = getCouponsFromLocalStorage();
  const index = coupons.findIndex((c) => c.id === couponId);
  if (index !== -1) {
    coupons[index] = { ...coupons[index], ...updates };
    localStorage.setItem('bloom_coupons', JSON.stringify(coupons));
  }
  return { success: true };
};

export const validateCoupon = async (code, userId) => {
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
  return updateCoupon(couponId, { used: true, usedInOrderId: orderId, usedAt: new Date().toISOString() });
};
