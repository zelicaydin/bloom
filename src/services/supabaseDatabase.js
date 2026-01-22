/**
 * Supabase Database Service
 * 
 * This file provides database operations using Supabase.
 * It replaces the JSON file-based backend with Supabase.
 */

import { supabase, isSupabaseConfigured } from './supabase';

// ============================================================================
// USERS
// ============================================================================

export const supabaseGetUsers = async () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching users:', error);
    throw error;
  }

  // Transform to match our data structure
  return data.map(user => ({
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    password: user.password,
    photo: user.photo,
    cardInfo: user.card_info,
    isAdmin: user.is_admin,
    emailVerified: user.email_verified,
    verificationCode: user.verification_code,
    verificationCodeExpiry: user.verification_code_expiry,
    passwordResetCode: user.password_reset_code,
    passwordResetCodeExpiry: user.password_reset_code_expiry,
    createdAt: user.created_at,
  }));
};

export const supabaseGetUser = async (userId) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('❌ Error fetching user:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    surname: data.surname,
    email: data.email,
    password: data.password,
    photo: data.photo,
    cardInfo: data.card_info,
    isAdmin: data.is_admin,
    emailVerified: data.email_verified,
    verificationCode: data.verification_code,
    verificationCodeExpiry: data.verification_code_expiry,
    passwordResetCode: data.password_reset_code,
    passwordResetCodeExpiry: data.password_reset_code_expiry,
    createdAt: data.created_at,
  };
};

export const supabaseLogin = async (email, password) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // Find user by email
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .limit(1);

  if (fetchError) {
    console.error('❌ Error fetching user for login:', fetchError);
    throw fetchError;
  }

  if (!users || users.length === 0) {
    throw new Error('No account found with this email');
  }

  const user = users[0];

  // Compare passwords (both should be hashed)
  const storedPassword = (user.password || '').trim();
  const receivedPassword = (password || '').trim();

  if (storedPassword !== receivedPassword) {
    throw new Error('Incorrect password');
  }

  // Check if email is verified
  if (!user.email_verified) {
    return {
      error: 'Please verify your email address before logging in',
      needsVerification: true,
      userId: user.id,
      verificationCode: user.verification_code, // For demo purposes
    };
  }

  // Return user data (without password)
  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      photo: user.photo,
      cardInfo: user.card_info,
      isAdmin: user.is_admin,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
    },
  };
};

export const supabaseCreateUser = async (userData) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userData.id,
      name: userData.name,
      surname: userData.surname,
      email: userData.email,
      password: userData.password,
      photo: userData.photo,
      card_info: userData.cardInfo,
      is_admin: userData.isAdmin || false,
      email_verified: userData.emailVerified || false,
      verification_code: userData.verificationCode,
      verification_code_expiry: userData.verificationCodeExpiry,
      password_reset_code: userData.passwordResetCode,
      password_reset_code_expiry: userData.passwordResetCodeExpiry,
      created_at: userData.createdAt || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }

  // Return in our format
  return {
    success: true,
    userId: data.id,
    verificationCode: data.verification_code,
    user: {
      id: data.id,
      name: data.name,
      surname: data.surname,
      email: data.email,
      photo: data.photo,
      cardInfo: data.card_info,
      isAdmin: data.is_admin,
      emailVerified: data.email_verified,
      createdAt: data.created_at,
    },
  };
};

export const supabaseUpdateUser = async (userId, updates) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const updateData = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.surname !== undefined) updateData.surname = updates.surname;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.password !== undefined) updateData.password = updates.password;
  if (updates.photo !== undefined) updateData.photo = updates.photo;
  if (updates.cardInfo !== undefined) updateData.card_info = updates.cardInfo;
  if (updates.isAdmin !== undefined) updateData.is_admin = updates.isAdmin;
  if (updates.emailVerified !== undefined) updateData.email_verified = updates.emailVerified;
  if (updates.verificationCode !== undefined) updateData.verification_code = updates.verificationCode;
  if (updates.verificationCodeExpiry !== undefined) updateData.verification_code_expiry = updates.verificationCodeExpiry;
  if (updates.passwordResetCode !== undefined) updateData.password_reset_code = updates.passwordResetCode;
  if (updates.passwordResetCodeExpiry !== undefined) updateData.password_reset_code_expiry = updates.passwordResetCodeExpiry;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error updating user:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    surname: data.surname,
    email: data.email,
    photo: data.photo,
    cardInfo: data.card_info,
    isAdmin: data.is_admin,
    emailVerified: data.email_verified,
    createdAt: data.created_at,
  };
};

export const supabaseDeleteUser = async (userId) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('❌ Error deleting user:', error);
    throw error;
  }

  return { success: true };
};

// ============================================================================
// PRODUCTS
// ============================================================================

export const supabaseGetProducts = async () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching products:', error);
    throw error;
  }

  return data.map(product => ({
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
    createdAt: product.created_at,
  }));
};

export const supabaseCreateProduct = async (productData) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // Generate ID if not provided (sequential like backend)
  let productId = productData.id;
  if (!productId) {
    // Get all products to find max ID
    const { data: allProducts } = await supabase
      .from('products')
      .select('id')
      .order('id', { ascending: false })
      .limit(1000);
    
    if (allProducts && allProducts.length > 0) {
      const numericIds = allProducts
        .map(p => {
          const numId = parseInt(p.id, 10);
          return isNaN(numId) ? 0 : numId;
        })
        .filter(id => id > 0);
      const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
      productId = (maxId + 1).toString();
    } else {
      productId = '1';
    }
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      id: productId,
      name: productData.name,
      price: productData.price,
      brand: productData.brand,
      type: productData.type,
      description: productData.description,
      image: productData.image,
      markers: productData.markers || [],
      rating: productData.rating || 0,
      reviews: productData.reviews || 0,
      created_at: productData.createdAt || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating product:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    price: data.price,
    brand: data.brand,
    type: data.type,
    description: data.description,
    image: data.image,
    markers: data.markers || [],
    rating: data.rating || 0,
    reviews: data.reviews || 0,
    createdAt: data.created_at,
  };
};

export const supabaseUpdateProduct = async (productId, updates) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const updateData = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.price !== undefined) updateData.price = updates.price;
  if (updates.brand !== undefined) updateData.brand = updates.brand;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.image !== undefined) updateData.image = updates.image;
  if (updates.markers !== undefined) updateData.markers = updates.markers;
  if (updates.rating !== undefined) updateData.rating = updates.rating;
  if (updates.reviews !== undefined) updateData.reviews = updates.reviews;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error updating product:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    price: data.price,
    brand: data.brand,
    type: data.type,
    description: data.description,
    image: data.image,
    markers: data.markers || [],
    rating: data.rating || 0,
    reviews: data.reviews || 0,
    createdAt: data.created_at,
  };
};

export const supabaseDeleteProduct = async (productId) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('❌ Error deleting product:', error);
    throw error;
  }

  return { success: true };
};

// ============================================================================
// PURCHASES
// ============================================================================

export const supabaseGetPurchases = async (userId) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('❌ Error fetching purchases:', error);
    throw error;
  }

  return data.map(purchase => ({
    id: purchase.id,
    userId: purchase.user_id,
    items: purchase.items,
    subtotal: purchase.subtotal,
    discount: purchase.discount || 0,
    total: purchase.total,
    coupon: purchase.coupon,
    paymentMethod: purchase.payment_method,
    date: purchase.date || purchase.created_at,
  }));
};

export const supabaseCreatePurchase = async (purchaseData) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('purchases')
    .insert({
      id: purchaseData.id,
      user_id: purchaseData.userId,
      items: purchaseData.items,
      subtotal: purchaseData.subtotal,
      discount: purchaseData.discount || 0,
      total: purchaseData.total,
      coupon: purchaseData.coupon,
      payment_method: purchaseData.paymentMethod,
      date: purchaseData.date || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating purchase:', error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    items: data.items,
    subtotal: data.subtotal,
    discount: data.discount || 0,
    total: data.total,
    coupon: data.coupon,
    paymentMethod: data.payment_method,
    date: data.date || data.created_at,
  };
};

// ============================================================================
// REVIEWS
// ============================================================================

export const supabaseGetReviews = async (productId) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching reviews:', error);
    throw error;
  }

  return data.map(review => ({
    id: review.id,
    userId: review.user_id,
    productId: review.product_id,
    userEmail: review.user_email,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.created_at,
    updatedAt: review.updated_at,
  }));
};

export const supabaseCreateReview = async (reviewData) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      id: reviewData.id,
      user_id: reviewData.userId,
      product_id: reviewData.productId,
      user_email: reviewData.userEmail,
      rating: reviewData.rating,
      comment: reviewData.comment,
      created_at: reviewData.createdAt || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating review:', error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    productId: data.product_id,
    userEmail: data.user_email,
    rating: data.rating,
    comment: data.comment,
    createdAt: data.created_at,
  };
};

// ============================================================================
// COUPONS
// ============================================================================

export const supabaseGetCoupons = async () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching coupons:', error);
    throw error;
  }

  return data.map(coupon => ({
    id: coupon.id,
    code: coupon.code,
    userId: coupon.user_id,
    discountType: coupon.discount_type,
    discount: coupon.discount,
    expiresAt: coupon.expires_at,
    used: coupon.used || false,
    usedAt: coupon.used_at,
    usedInOrderId: coupon.used_in_order_id,
    createdAt: coupon.created_at,
  }));
};

export const supabaseGetUserCoupons = async (userId) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching user coupons:', error);
    throw error;
  }

  return data.map(coupon => ({
    id: coupon.id,
    code: coupon.code,
    userId: coupon.user_id,
    discountType: coupon.discount_type,
    discount: coupon.discount,
    expiresAt: coupon.expires_at,
    used: coupon.used || false,
    usedAt: coupon.used_at,
    usedInOrderId: coupon.used_in_order_id,
    createdAt: coupon.created_at,
  }));
};

export const supabaseCreateCoupon = async (couponData) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('coupons')
    .insert({
      id: couponData.id,
      code: couponData.code,
      user_id: couponData.userId,
      discount_type: couponData.discountType,
      discount: couponData.discount || couponData.amount,
      expires_at: couponData.expiresAt,
      used: couponData.used || false,
      used_at: couponData.usedAt,
      used_in_order_id: couponData.usedInOrderId,
      created_at: couponData.createdAt || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating coupon:', error);
    throw error;
  }

  return {
    id: data.id,
    code: data.code,
    userId: data.user_id,
    discountType: data.discount_type,
    discount: data.discount,
    expiresAt: data.expires_at,
    used: data.used || false,
    usedAt: data.used_at,
    usedInOrderId: data.used_in_order_id,
    createdAt: data.created_at,
  };
};

export const supabaseUpdateCoupon = async (couponId, updates) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const updateData = {};
  if (updates.code !== undefined) updateData.code = updates.code;
  if (updates.userId !== undefined) updateData.user_id = updates.userId;
  if (updates.discountType !== undefined) updateData.discount_type = updates.discountType;
  if (updates.discount !== undefined) updateData.discount = updates.discount;
  if (updates.expiresAt !== undefined) updateData.expires_at = updates.expiresAt;
  if (updates.used !== undefined) updateData.used = updates.used;
  if (updates.usedAt !== undefined) updateData.used_at = updates.usedAt;
  if (updates.usedInOrderId !== undefined) updateData.used_in_order_id = updates.usedInOrderId;

  const { data, error } = await supabase
    .from('coupons')
    .update(updateData)
    .eq('id', couponId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error updating coupon:', error);
    throw error;
  }

  return {
    id: data.id,
    code: data.code,
    userId: data.user_id,
    discountType: data.discount_type,
    discount: data.discount,
    expiresAt: data.expires_at,
    used: data.used || false,
    usedAt: data.used_at,
    usedInOrderId: data.used_in_order_id,
    createdAt: data.created_at,
  };
};

export const supabaseValidateCoupon = async (code, userId) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('user_id', userId)
    .eq('used', false)
    .single();

  if (error || !data) {
    return { success: false, error: 'Invalid or already used coupon code' };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { success: false, error: 'Coupon has expired' };
  }

  return {
    success: true,
    coupon: {
      id: data.id,
      code: data.code,
      userId: data.user_id,
      discountType: data.discount_type,
      discount: data.discount,
      expiresAt: data.expires_at,
      used: data.used || false,
    },
  };
};
