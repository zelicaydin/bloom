/**
 * BLOOM E-COMMERCE BACKEND SERVER
 * 
 * This is a simple Express.js backend server that handles:
 * - User authentication and management
 * - Product catalog management
 * - Email sending (verification, password reset)
 * - Purchase history
 * - Reviews and ratings
 * - Coupon management
 * 
 * Data is stored in JSON files for simplicity (in production, use a real database)
 * 
 * FOR PRESENTATION:
 * - This demonstrates full-stack development
 * - Shows separation of concerns (frontend vs backend)
 * - Demonstrates API design and RESTful endpoints
 * - Shows secure handling of sensitive operations (email sending)
 */

import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow frontend to make requests
app.use(express.json()); // Parse JSON request bodies

// Data directory
const DATA_DIR = join(__dirname, 'data');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// ============================================================================
// DATA STORAGE HELPERS (JSON File-based)
// ============================================================================

/**
 * Read data from a JSON file
 * Creates file with default value if it doesn't exist
 */
function readDataFile(filename, defaultValue = []) {
  const filePath = join(DATA_DIR, filename);
  if (!existsSync(filePath)) {
    writeDataFile(filename, defaultValue);
    return defaultValue;
  }
  try {
    const data = readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultValue;
  }
}

/**
 * Write data to a JSON file
 */
function writeDataFile(filename, data) {
  const filePath = join(DATA_DIR, filename);
  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// ============================================================================
// EMAIL SERVICE (Mock for Demo - Can be replaced with real service)
// ============================================================================

/**
 * Mock Email Service
 * In production, this would use a real service like Resend, SendGrid, etc.
 * For demo purposes, it logs to console and returns success
 */
class EmailService {
  /**
   * Send verification email with code
   */
  async sendVerificationEmail(email, code) {
    console.log('\n📧 ===== EMAIL SENT (MOCK) =====');
    console.log(`To: ${email}`);
    console.log(`Subject: Verify your Bloom account`);
    console.log(`Body: Your verification code is: ${code}`);
    console.log(`Code expires in 10 minutes`);
    console.log('================================\n');
    
    // In production, this would be:
    // await resend.emails.send({
    //   from: 'noreply@bloom.com',
    //   to: email,
    //   subject: 'Verify your Bloom account',
    //   html: `<p>Your verification code is: <strong>${code}</strong></p>`
    // });
    
    return { success: true };
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, code) {
    console.log('\n📧 ===== EMAIL SENT (MOCK) =====');
    console.log(`To: ${email}`);
    console.log(`Subject: Reset your Bloom password`);
    console.log(`Body: Your password reset code is: ${code}`);
    console.log(`Code expires in 15 minutes`);
    console.log('================================\n');
    
    return { success: true };
  }
}

const emailService = new EmailService();

// ============================================================================
// API ROUTES - STATUS
// ============================================================================

/**
 * GET /api/status
 * Check if backend is alive
 */
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Bloom Backend is running!' });
});

// ============================================================================
// API ROUTES - USERS
// ============================================================================

/**
 * GET /api/users
 * Get all users (admin only in production)
 */
app.get('/api/users', (req, res) => {
  try {
    const users = readDataFile('users.json', []);
    // Remove passwords from response
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/users/:id
 * Get a specific user
 */
app.get('/api/users/:id', (req, res) => {
  try {
    const users = readDataFile('users.json', []);
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * POST /api/users
 * Create a new user (signup)
 */
app.post('/api/users', async (req, res) => {
  try {
    const { name, surname, email, password, photo, cardInfo } = req.body;
    
    // Debug logging
    console.log('📝 Signup request received');
    console.log('📝 Request body:', { 
      name: name ? 'present' : 'missing', 
      surname: surname ? 'present' : 'missing', 
      email: email || 'missing', 
      password: password ? `present (${password.length} chars)` : 'missing',
      photo: photo ? 'present' : 'missing',
      cardInfo: cardInfo ? 'present' : 'missing'
    });
    
    // Validation - check for empty strings too
    if (!name || !name.trim() || !surname || !surname.trim() || !email || !email.trim() || !password || !password.trim()) {
      console.log('❌ Missing or empty required fields:', { 
        name: name ? (name.trim() ? 'valid' : 'empty') : 'missing', 
        surname: surname ? (surname.trim() ? 'valid' : 'empty') : 'missing', 
        email: email ? (email.trim() ? 'valid' : 'empty') : 'missing', 
        password: password ? (password.trim() ? 'valid' : 'empty') : 'missing' 
      });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Trim the values
    const trimmedName = name.trim();
    const trimmedSurname = surname.trim();
    const trimmedEmail = email.trim().toLowerCase();

    const users = readDataFile('users.json', []);
    
    // Check if user already exists (case-insensitive email check)
    const existingUser = users.find(u => u.email && u.email.toLowerCase() === trimmedEmail);
    if (existingUser) {
      console.log('❌ Signup blocked - email already exists:', trimmedEmail);
      console.log('📊 Existing user ID:', existingUser.id);
      console.log('📊 Existing user email (exact):', existingUser.email);
      console.log('📋 All current emails in database:', users.map(u => u.email).join(', '));
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    console.log('✅ Email available for signup:', trimmedEmail);
    console.log('📋 All current emails in database:', users.map(u => u.email).join(', '));

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date();
    verificationCodeExpiry.setMinutes(verificationCodeExpiry.getMinutes() + 10);

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: trimmedName,
      surname: trimmedSurname,
      email: trimmedEmail,
      password: password.trim(), // Already hashed on frontend, trim any whitespace
      photo: photo || null,
      cardInfo: cardInfo || null,
      emailVerified: false,
      verificationCode,
      verificationCodeExpiry: verificationCodeExpiry.toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    // Debug logging
    console.log('📝 Creating user:', trimmedEmail);
    console.log('📝 Password hash length:', password.trim().length);

    users.push(newUser);
    writeDataFile('users.json', users);

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationCode);

    // Return user data (without password) for frontend
    const { password: pwd, verificationCode: vCode, verificationCodeExpiry: vExpiry, ...userResponse } = newUser;
    
    res.status(201).json({
      success: true,
      userId: newUser.id,
      verificationCode, // Return for demo (in production, don't return this)
      user: userResponse, // Also return user object for convenience
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * PUT /api/users/:id
 * Update a user
 */
app.put('/api/users/:id', (req, res) => {
  try {
    const users = readDataFile('users.json', []);
    const index = users.findIndex(u => u.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user (don't allow password update here - use separate endpoint)
    const { password, ...updates } = req.body;
    users[index] = { ...users[index], ...updates };
    writeDataFile('users.json', users);

    const { password: _, ...updatedUser } = users[index];
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user
 */
app.delete('/api/users/:id', (req, res) => {
  try {
    const users = readDataFile('users.json', []);
    const userToDelete = users.find(u => u.id === req.params.id);
    
    if (!userToDelete) {
      console.log('❌ User not found for deletion, ID:', req.params.id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    const filtered = users.filter(u => u.id !== req.params.id);
    writeDataFile('users.json', filtered);
    
    console.log('🗑️ User deleted:', userToDelete.email, '(ID:', req.params.id + ')');
    console.log('📊 Remaining users:', filtered.length);
    console.log('📋 Remaining emails:', filtered.map(u => u.email).join(', '));
    
    res.json({ success: true, deletedEmail: userToDelete.email });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * POST /api/users/login
 * Authenticate user
 */
app.post('/api/users/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const users = readDataFile('users.json', []);
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ error: 'No account found with this email' });
    }

    // Debug logging
    console.log('🔐 Login attempt for:', email);
    console.log('📝 Stored password hash length:', user.password?.length);
    console.log('📝 Received password hash length:', password?.length);
    console.log('📝 Passwords match:', user.password === password);

    // Trim both passwords before comparison to handle any whitespace issues
    const storedPassword = (user.password || '').trim();
    const receivedPassword = (password || '').trim();

    if (storedPassword !== receivedPassword) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ error: 'Incorrect password' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ 
        error: 'Please verify your email address before logging in',
        needsVerification: true,
        userId: user.id
      });
    }

    const { password: _, verificationCode, verificationCodeExpiry, ...userData } = user;
    res.json({ success: true, user: userData });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/users/verify-email
 * Verify email with code
 */
app.post('/api/users/verify-email', async (req, res) => {
  try {
    const { userId, code } = req.body;
    const users = readDataFile('users.json', []);
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (new Date() > new Date(user.verificationCodeExpiry)) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    // Verify email
    const index = users.findIndex(u => u.id === userId);
    users[index] = {
      ...users[index],
      emailVerified: true,
      verificationCode: null,
      verificationCodeExpiry: null,
    };
    writeDataFile('users.json', users);

    const { password, verificationCode, verificationCodeExpiry, ...userData } = users[index];
    res.json({ success: true, user: userData });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * POST /api/users/resend-verification
 * Resend verification code
 */
app.post('/api/users/resend-verification', async (req, res) => {
  try {
    const { userId } = req.body;
    const users = readDataFile('users.json', []);
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date();
    verificationCodeExpiry.setMinutes(verificationCodeExpiry.getMinutes() + 10);

    const index = users.findIndex(u => u.id === userId);
    users[index] = {
      ...users[index],
      verificationCode,
      verificationCodeExpiry: verificationCodeExpiry.toISOString(),
    };
    writeDataFile('users.json', users);

    // Send email
    await emailService.sendVerificationEmail(user.email, verificationCode);

    res.json({ success: true, verificationCode }); // For demo
  } catch (error) {
    res.status(500).json({ error: 'Failed to resend verification code' });
  }
});

/**
 * POST /api/users/forgot-password
 * Request password reset - generates and sends reset code
 */
app.post('/api/users/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const users = readDataFile('users.json', []);
    const trimmedEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email && u.email.toLowerCase() === trimmedEmail);

    if (!user) {
      // Don't reveal if email exists for security, but still return success
      console.log('⚠️ Password reset requested for non-existent email:', trimmedEmail);
      return res.json({ 
        success: true, 
        message: 'If an account exists with this email, a reset code has been sent.',
        resetCode: null // Don't return code for non-existent users
      });
    }

    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date();
    resetCodeExpiry.setMinutes(resetCodeExpiry.getMinutes() + 10); // 10 minutes expiry

    // Update user with reset code
    const index = users.findIndex(u => u.id === user.id);
    users[index] = {
      ...users[index],
      passwordResetCode: resetCode,
      passwordResetCodeExpiry: resetCodeExpiry.toISOString(),
    };
    writeDataFile('users.json', users);

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, resetCode);

    console.log('✅ Password reset code sent to:', user.email);

    res.json({ 
      success: true, 
      resetCode, // For demo purposes only
      message: 'Password reset code sent to your email'
    });
  } catch (error) {
    console.error('❌ Password reset request failed:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

/**
 * POST /api/users/reset-password
 * Reset password with code
 */
app.post('/api/users/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!code || code.length !== 6) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }
    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const users = readDataFile('users.json', []);
    const trimmedEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email && u.email.toLowerCase() === trimmedEmail);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check reset code
    if (!user.passwordResetCode || user.passwordResetCode !== code) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    // Check expiry
    if (!user.passwordResetCodeExpiry || new Date(user.passwordResetCodeExpiry) < new Date()) {
      return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
    }

    // Update password
    const index = users.findIndex(u => u.id === user.id);
    users[index] = {
      ...users[index],
      password: newPassword.trim(), // Already hashed on frontend
      passwordResetCode: null, // Clear reset code
      passwordResetCodeExpiry: null, // Clear expiry
    };
    writeDataFile('users.json', users);

    console.log('✅ Password reset successful for:', user.email);

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('❌ Password reset failed:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ============================================================================
// API ROUTES - PRODUCTS
// ============================================================================

/**
 * GET /api/products
 * Get all products
 */
app.get('/api/products', (req, res) => {
  try {
    const products = readDataFile('products.json', []);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * GET /api/products/:id
 * Get a specific product
 */
app.get('/api/products/:id', (req, res) => {
  try {
    const products = readDataFile('products.json', []);
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

/**
 * POST /api/products
 * Create a new product (admin only)
 */
app.post('/api/products', (req, res) => {
  try {
    const products = readDataFile('products.json', []);
    
    // Generate sequential ID if not provided
    let productId = req.body.id;
    if (!productId) {
      // Find the highest numeric ID and add 1
      const numericIds = products
        .map(p => {
          const numId = parseInt(p.id, 10);
          return isNaN(numId) ? 0 : numId;
        })
        .filter(id => id > 0);
      const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
      productId = (maxId + 1).toString();
    }
    
    const newProduct = {
      ...req.body,
      id: productId, // Use generated or provided ID
      createdAt: new Date().toISOString(),
    };
    products.push(newProduct);
    writeDataFile('products.json', products);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

/**
 * PUT /api/products/:id
 * Update a product
 */
app.put('/api/products/:id', (req, res) => {
  try {
    const products = readDataFile('products.json', []);
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    products[index] = { ...products[index], ...req.body };
    writeDataFile('products.json', products);
    res.json(products[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product
 */
app.delete('/api/products/:id', (req, res) => {
  try {
    const products = readDataFile('products.json', []);
    const filtered = products.filter(p => p.id !== req.params.id);
    writeDataFile('products.json', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ============================================================================
// API ROUTES - PURCHASE HISTORY
// ============================================================================

/**
 * GET /api/purchases/:userId
 * Get purchase history for a user
 */
app.get('/api/purchases/:userId', (req, res) => {
  try {
    const purchases = readDataFile('purchases.json', []);
    const userPurchases = purchases.filter(p => p.userId === req.params.userId);
    res.json(userPurchases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase history' });
  }
});

/**
 * POST /api/purchases
 * Create a new purchase/order
 */
app.post('/api/purchases', (req, res) => {
  try {
    const purchases = readDataFile('purchases.json', []);
    const newPurchase = {
      id: Date.now().toString(),
      ...req.body,
      date: new Date().toISOString(),
    };
    purchases.push(newPurchase);
    writeDataFile('purchases.json', purchases);
    res.status(201).json(newPurchase);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create purchase' });
  }
});

// ============================================================================
// API ROUTES - COUPONS
// ============================================================================

/**
 * GET /api/coupons
 * Get all coupons (admin only)
 */
app.get('/api/coupons', (req, res) => {
  try {
    const coupons = readDataFile('coupons.json', []);
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

/**
 * GET /api/coupons/user/:userId
 * Get coupons for a user
 */
app.get('/api/coupons/user/:userId', (req, res) => {
  try {
    const coupons = readDataFile('coupons.json', []);
    const userCoupons = coupons.filter(c => c.userId === req.params.userId);
    res.json(userCoupons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

/**
 * POST /api/coupons
 * Create a new coupon
 */
app.post('/api/coupons', (req, res) => {
  try {
    const coupons = readDataFile('coupons.json', []);
    const newCoupon = {
      id: Date.now().toString(),
      ...req.body,
      used: false,
      createdAt: new Date().toISOString(),
    };
    coupons.push(newCoupon);
    writeDataFile('coupons.json', coupons);
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

/**
 * POST /api/coupons/validate
 * Validate a coupon code
 */
app.post('/api/coupons/validate', (req, res) => {
  try {
    const { code, userId } = req.body;
    const coupons = readDataFile('coupons.json', []);
    const coupon = coupons.find(
      c => c.code === code.toUpperCase() && c.userId === userId && !c.used
    );

    if (!coupon) {
      return res.status(400).json({ error: 'Invalid or already used coupon code' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

/**
 * PUT /api/coupons/:id/use
 * Mark coupon as used
 */
app.put('/api/coupons/:id/use', (req, res) => {
  try {
    const coupons = readDataFile('coupons.json', []);
    const index = coupons.findIndex(c => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    coupons[index] = {
      ...coupons[index],
      used: true,
      usedAt: new Date().toISOString(),
      usedInOrderId: req.body.orderId,
    };
    writeDataFile('coupons.json', coupons);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to use coupon' });
  }
});

// ============================================================================
// API ROUTES - REVIEWS
// ============================================================================

/**
 * GET /api/reviews/product/:productId
 * Get reviews for a product
 */
app.get('/api/reviews/product/:productId', (req, res) => {
  try {
    const reviews = readDataFile('reviews.json', []);
    const productReviews = reviews.filter(r => r.productId === req.params.productId);
    res.json(productReviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/**
 * POST /api/reviews
 * Create a new review
 */
app.post('/api/reviews', (req, res) => {
  try {
    const reviews = readDataFile('reviews.json', []);
    const newReview = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    reviews.push(newReview);
    writeDataFile('reviews.json', reviews);
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// ============================================================================
// API ROUTES - MIGRATION / BULK IMPORT
// ============================================================================

/**
 * POST /api/migrate/import
 * Bulk import data from localStorage (for migration)
 * Accepts: { users, products, coupons, purchases, reviews }
 */
app.post('/api/migrate/import', (req, res) => {
  try {
    const { users, products, coupons, purchases, reviews } = req.body;
    let imported = { users: 0, products: 0, coupons: 0, purchases: 0, reviews: 0 };

    // Import users
    if (users && Array.isArray(users)) {
      const existingUsers = readDataFile('users.json', []);
      const existingEmails = new Set(existingUsers.map(u => u.email));
      
      users.forEach(user => {
        if (!existingEmails.has(user.email)) {
          existingUsers.push(user);
          existingEmails.add(user.email);
          imported.users++;
        }
      });
      writeDataFile('users.json', existingUsers);
    }

    // Import products
    if (products && Array.isArray(products)) {
      const existingProducts = readDataFile('products.json', []);
      const existingIds = new Set(existingProducts.map(p => p.id));
      
      products.forEach(product => {
        if (!existingIds.has(product.id)) {
          existingProducts.push(product);
          existingIds.add(product.id);
          imported.products++;
        }
      });
      writeDataFile('products.json', existingProducts);
    }

    // Import coupons
    if (coupons && Array.isArray(coupons)) {
      const existingCoupons = readDataFile('coupons.json', []);
      const existingIds = new Set(existingCoupons.map(c => c.id));
      
      coupons.forEach(coupon => {
        if (!existingIds.has(coupon.id)) {
          existingCoupons.push(coupon);
          existingIds.add(coupon.id);
          imported.coupons++;
        }
      });
      writeDataFile('coupons.json', existingCoupons);
    }

    // Import purchases
    if (purchases && Array.isArray(purchases)) {
      const existingPurchases = readDataFile('purchases.json', []);
      const existingIds = new Set(existingPurchases.map(p => p.id));
      
      purchases.forEach(purchase => {
        if (!existingIds.has(purchase.id)) {
          existingPurchases.push(purchase);
          existingIds.add(purchase.id);
          imported.purchases++;
        }
      });
      writeDataFile('purchases.json', existingPurchases);
    }

    // Import reviews
    if (reviews && Array.isArray(reviews)) {
      const existingReviews = readDataFile('reviews.json', []);
      const existingIds = new Set(existingReviews.map(r => r.id));
      
      reviews.forEach(review => {
        if (!existingIds.has(review.id)) {
          existingReviews.push(review);
          existingIds.add(review.id);
          imported.reviews++;
        }
      });
      writeDataFile('reviews.json', existingReviews);
    }

    res.json({ 
      success: true, 
      message: 'Data imported successfully',
      imported 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import data', details: error.message });
  }
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log('\n🚀 Bloom Backend Server Running!');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📁 Data Directory: ${DATA_DIR}`);
  console.log(`📧 Email Service: Mock (logs to console)`);
  console.log('\nAvailable Endpoints:');
  console.log('  Users:     GET/POST/PUT/DELETE /api/users');
  console.log('  Products:  GET/POST/PUT/DELETE /api/products');
  console.log('  Purchases: GET/POST /api/purchases');
  console.log('  Coupons:   GET/POST /api/coupons');
  console.log('  Reviews:   GET/POST /api/reviews');
  console.log('\n');
});
