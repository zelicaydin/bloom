import { createContext, useContext, useState, useEffect } from 'react';
import { hashPasswordAsync } from '../utils/hash';
import {
  getUsers,
  saveUsers,
  addUser as dbAddUser,
  updateUser as dbUpdateUser,
  deleteUser as dbDeleteUser,
} from '../services/database';
import {
  generateVerificationCode,
  createVerificationCodeExpiry,
  isVerificationCodeExpired,
} from '../utils/verification';
import { apiLogin, apiCreateUser, apiVerifyEmail, apiResendVerification, apiRequestPasswordReset, apiResetPassword, checkBackend } from '../services/api';
import { isSupabaseConfigured } from '../services/supabase';
import * as supabaseDb from '../services/supabaseDatabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to get users from database (wrapped for backward compatibility)
  const getUsersLocal = async () => {
    return await getUsers();
  };

  // Helper to save users to database (wrapped for backward compatibility)
  const saveUsersLocal = async (users) => {
    await saveUsers(users);
  };

  // Load user from database on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Get all existing users from database
      const users = await getUsersLocal();

      // Auto-verify existing users (backward compatibility)
      let usersUpdated = false;
      const updatedUsers = users.map((u) => {
        if (u.emailVerified === undefined) {
          usersUpdated = true;
          return { ...u, emailVerified: true };
        }
        return u;
      });

      if (usersUpdated) {
        await saveUsersLocal(updatedUsers);
      }

      // Check if admin exists and has correct password hash
      const existingAdmin = updatedUsers.find((u) => u.email === 'admin@bloom.com');

      const adminPhoto =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzQ0NDQ0NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BPC90ZXh0Pjwvc3ZnPg==';

      // Always hash the admin password with the correct method (same as login uses)
      const adminPassword = await hashPasswordAsync('Admin123!');

      // Only update admin if it doesn't exist or needs password update
      if (!existingAdmin || existingAdmin.password !== adminPassword) {
        // Remove any existing admin accounts
        const filteredUsers = updatedUsers.filter(
          (u) => u.email !== 'admin@bloom.com'
        );

        // Create/update admin account
        const adminUser = {
          id: 'admin-001',
          name: 'Admin',
          surname: 'Bloom',
          email: 'admin@bloom.com',
          password: adminPassword,
          photo: adminPhoto,
          cardInfo: null,
          createdAt: existingAdmin?.createdAt || new Date().toISOString(),
          isAdmin: true,
          emailVerified: true, // Admin is always verified
        };

        filteredUsers.push(adminUser);
        await saveUsersLocal(filteredUsers);
      } else if (usersUpdated) {
        // Admin exists and is correct, just ensure all users are saved (preserve existing users)
        await saveUsersLocal(updatedUsers);
      }

      const storedUser = localStorage.getItem('bloom_user');
      const rememberMe = localStorage.getItem('bloom_remember_me') === 'true';

      if (storedUser && rememberMe) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Only set user if it's a valid user object with an id
          if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
            setUser(parsedUser);
          } else {
            // Invalid user data, clear it
            localStorage.removeItem('bloom_user');
            localStorage.removeItem('bloom_remember_me');
            setUser(null);
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
          localStorage.removeItem('bloom_user');
          localStorage.removeItem('bloom_remember_me');
          setUser(null);
        }
      } else {
        // No remember me or no stored user - ensure user is null and clear any stale data
        if (storedUser) {
          localStorage.removeItem('bloom_user');
        }
        // Always clear remember_me if it's not explicitly true
        if (!rememberMe) {
          localStorage.removeItem('bloom_remember_me');
        }
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signUp = async (name, surname, email, password, photo, cardInfo = null) => {
    // Try backend API first if available
    const backendAvailable = await checkBackend();
    if (backendAvailable) {
      try {
        console.log('📝 Attempting signup via backend API for:', email);
        console.log('📝 Signup data:', { 
          name: name ? 'present' : 'missing', 
          surname: surname ? 'present' : 'missing', 
          email: email || 'missing', 
          password: password ? `present (${password.length} chars)` : 'missing',
          photo: photo ? 'present' : 'missing',
          cardInfo: cardInfo ? 'present' : 'missing'
        });
        const result = await apiCreateUser({
          name: name?.trim(),
          surname: surname?.trim(),
          email: email?.trim(),
          password, // Already hashed before calling this
          photo: photo || null,
          cardInfo: cardInfo || null,
        });
        
        // Backend returns { success: true, userId, verificationCode, user }
        if (result && result.success && result.userId) {
          // Backend signup successful
          console.log('✅ Signup successful via backend');
          return { 
            success: true, 
            verificationCode: result.verificationCode, // Backend returns code for demo
            userId: result.userId
          };
        } else if (result && result.error) {
          // Backend returned error (email already exists, etc.)
          console.log('❌ Backend signup failed:', result.error);
          return { success: false, error: result.error || 'Signup failed' };
        } else {
          // Unexpected response
          console.warn('⚠️ Unexpected backend response, trying localStorage fallback');
          // Fall through to localStorage
        }
      } catch (error) {
        console.warn('⚠️ Backend signup error:', error);
        // Check if it's an "email already exists" error from the API
        if (error.message && (error.message.includes('already registered') || error.message.includes('Email already'))) {
          return { success: false, error: 'Email already registered' };
        }
        // If backend is available but signup failed, don't fall back to localStorage
        // This ensures we always use the backend's current state
        return { success: false, error: error.message || 'Signup failed. Please try again.' };
      }
    }

    // Fallback to localStorage check (only if backend is not available)
    console.log('📝 Attempting signup via localStorage for:', email);
    const users = await getUsersLocal();

    // Check if user already exists (case-insensitive)
    const existingUser = users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = createVerificationCodeExpiry();

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      surname,
      email,
      password, // Already hashed before calling this
      photo,
      cardInfo,
      createdAt: new Date().toISOString(),
      emailVerified: false,
      verificationCode,
      verificationCodeExpiry,
    };

    // Save to database
    await dbAddUser(newUser);

    // Return success with verification code (don't auto-login)
    return { 
      success: true, 
      verificationCode, // Return code to display to user
      userId: newUser.id 
    };
  };

  const login = async (email, password) => {
    // Priority: Supabase > Backend API > localStorage
    
    // Try Supabase first
    if (isSupabaseConfigured()) {
      try {
        console.log('🔐 Attempting login via Supabase for:', email);
        const result = await supabaseDb.supabaseLogin(email, password);
        
        if (result && result.success && result.user) {
          const userData = result.user;
          setUser(userData);
          localStorage.setItem('bloom_user', JSON.stringify(userData));
          console.log('✅ Login successful via Supabase');
          return { success: true };
        } else if (result && result.needsVerification) {
          console.log('⚠️ Login blocked: Email not verified');
          return {
            success: false,
            error: result.error || 'Please verify your email address before logging in',
            needsVerification: true,
            userId: result.userId,
            verificationCode: result.verificationCode,
          };
        } else if (result && result.error) {
          console.log('❌ Supabase login failed:', result.error);
          return { success: false, error: result.error || 'Login failed' };
        }
      } catch (error) {
        console.warn('⚠️ Supabase login error:', error);
        // Fall through to backend API
      }
    }
    
    // Try backend API
    const backendAvailable = await checkBackend();
    if (backendAvailable) {
      try {
        console.log('🔐 Attempting login via backend API for:', email);
        const result = await apiLogin(email, password);
        if (result.success && result.user) {
          const userData = result.user;
          setUser(userData);
          localStorage.setItem('bloom_user', JSON.stringify(userData));
          console.log('✅ Login successful via backend');
          return { success: true };
        } else {
          console.log('❌ Backend login failed:', result.error);
          return result;
        }
      } catch (error) {
        console.warn('⚠️ Backend login error:', error);
        // Fall through to localStorage
      }
    }

    // Fallback to localStorage check (for backward compatibility)
    console.log('🔐 Attempting login via localStorage for:', email);
    const users = await getUsersLocal();
    const user = users.find((u) => u.email === email);

    if (!user) {
      return { success: false, error: 'No account found with this email' };
    }

    // Verify password (compare hashes)
    if (user.password !== password) {
      return { success: false, error: 'Incorrect password' };
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return { 
        success: false, 
        error: 'Please verify your email address before logging in.',
        needsVerification: true,
        userId: user.id
      };
    }

    // Login successful
    const userData = { ...user };
    delete userData.password;
    delete userData.verificationCode;
    delete userData.verificationCodeExpiry;
    setUser(userData);
    localStorage.setItem('bloom_user', JSON.stringify(userData));
    console.log('✅ Login successful via localStorage');

    return { success: true };
  };

  const logout = () => {
    // Get user ID before clearing (for cart cleanup)
    const userId = user?.id;
    
    // Clear user state immediately
    setUser(null);
    
    // Clear all user-related localStorage
    localStorage.removeItem('bloom_user');
    localStorage.removeItem('bloom_remember_me');
    
    // Clear cart data if user exists
    if (userId) {
      localStorage.removeItem(`bloom_cart_${userId}`);
    }
    
    // Clear subscription data if exists
    if (userId) {
      localStorage.removeItem(`bloom_subscription_${userId}`);
    }
  };

  const setRememberMe = (remember) => {
    if (remember) {
      localStorage.setItem('bloom_remember_me', 'true');
    } else {
      localStorage.setItem('bloom_remember_me', 'false');
    }
  };

  const updateCardInfo = async (cardInfo) => {
    if (!user) return { success: false, error: 'Not logged in' };

    // Update in database
    await dbUpdateUser(user.id, { cardInfo });

    const updatedUser = { ...user, cardInfo };
    setUser(updatedUser);
    localStorage.setItem('bloom_user', JSON.stringify(updatedUser));

    return { success: true };
  };

  const updateUser = async (userData) => {
    if (!user) return { success: false, error: 'Not logged in' };

    // Update in database
    await dbUpdateUser(user.id, userData);

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('bloom_user', JSON.stringify(updatedUser));

    return { success: true };
  };

  const deleteAccount = async () => {
    if (!user) return { success: false, error: 'Not logged in' };

    // Delete from database
    await dbDeleteUser(user.id);

    setUser(null);
    localStorage.removeItem('bloom_user');

    return { success: true };
  };

  const verifyEmail = async (userId, code) => {
    // Try backend API first if available
    const backendAvailable = await checkBackend();
    if (backendAvailable) {
      try {
        console.log('✅ Verifying email via backend API for user:', userId);
        const result = await apiVerifyEmail(userId, code);
        if (result.success && result.user) {
          // Verification successful via backend
          const userData = result.user;
          // Update state if this is the current user
          if (user && user.id === userId) {
            setUser(userData);
            localStorage.setItem('bloom_user', JSON.stringify(userData));
          }
          console.log('✅ Email verified successfully via backend');
          return { success: true };
        } else {
          // Backend returned error
          console.log('❌ Backend verification failed:', result.error);
          return { success: false, error: result.error || 'Verification failed' };
        }
      } catch (error) {
        console.warn('⚠️ Backend verification error, trying localStorage fallback:', error);
        // Fall through to localStorage check
      }
    }

    // Fallback to localStorage check (for backward compatibility)
    console.log('✅ Verifying email via localStorage for user:', userId);
    const users = await getUsersLocal();
    const dbUser = users.find((u) => u.id === userId);

    if (!dbUser) {
      return { success: false, error: 'User not found' };
    }

    // Check if code matches
    if (dbUser.verificationCode !== code) {
      return { success: false, error: 'Invalid verification code' };
    }

    // Check if code is expired
    if (isVerificationCodeExpired(dbUser.verificationCodeExpiry)) {
      return { success: false, error: 'Verification code has expired. Please request a new one.' };
    }

    // Verify email
    await dbUpdateUser(userId, {
      emailVerified: true,
      verificationCode: null,
      verificationCodeExpiry: null,
    });

    // Get updated user from database
    const updatedUsers = await getUsersLocal();
    const updatedDbUser = updatedUsers.find((u) => u.id === userId);
    if (updatedDbUser) {
      const userData = { ...updatedDbUser };
      delete userData.password;
      delete userData.verificationCode;
      delete userData.verificationCodeExpiry;
      // Update state if this is the current user
      if (user && user.id === userId) {
        setUser(userData);
        localStorage.setItem('bloom_user', JSON.stringify(userData));
      }
    }

    return { success: true };
  };

  const resendVerificationCode = async (userId) => {
    // Try backend API first if available
    const backendAvailable = await checkBackend();
    if (backendAvailable) {
      try {
        console.log('✅ Resending verification code via backend API for user:', userId);
        const result = await apiResendVerification(userId);
        if (result.success) {
          console.log('✅ Verification code resent successfully via backend');
          return { 
            success: true, 
            verificationCode: result.verificationCode // Backend returns code for demo
          };
        } else {
          console.log('❌ Backend resend failed:', result.error);
          return { success: false, error: result.error || 'Failed to resend code' };
        }
      } catch (error) {
        console.warn('⚠️ Backend resend error, trying localStorage fallback:', error);
        // Fall through to localStorage check
      }
    }

    // Fallback to localStorage check (for backward compatibility)
    console.log('✅ Resending verification code via localStorage for user:', userId);
    const users = await getUsersLocal();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email is already verified' };
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = createVerificationCodeExpiry();

    // Update user with new code
    await dbUpdateUser(userId, {
      verificationCode,
      verificationCodeExpiry,
    });

    return { success: true, verificationCode };
  };

  const requestVerificationByEmail = async (email) => {
    // Try backend API first if available
    const backendAvailable = await checkBackend();
    if (backendAvailable) {
      try {
        // First, get the user by email to find their userId
        const users = await getUsersLocal();
        const user = users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
          return { success: false, error: 'User not found' };
        }

        if (user.emailVerified) {
          return { success: false, error: 'Email is already verified' };
        }

        console.log('✅ Requesting verification code via backend API for user:', user.id);
        const result = await apiResendVerification(user.id);
        if (result.success) {
          console.log('✅ Verification code sent successfully via backend');
          return { 
            success: true, 
            verificationCode: result.verificationCode,
            userId: user.id
          };
        } else {
          console.log('❌ Backend verification request failed:', result.error);
          return { success: false, error: result.error || 'Failed to send verification code' };
        }
      } catch (error) {
        console.warn('⚠️ Backend verification request error, trying localStorage fallback:', error);
        // Fall through to localStorage
      }
    }

    // Fallback to localStorage
    console.log('✅ Requesting verification code via localStorage for email:', email);
    const users = await getUsersLocal();
    const user = users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email is already verified' };
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = createVerificationCodeExpiry();

    // Update user with new code
    await dbUpdateUser(user.id, {
      verificationCode,
      verificationCodeExpiry,
    });

    return { success: true, verificationCode, userId: user.id };
  };

  const requestPasswordReset = async (email) => {
    // Try backend API first if available
    const backendAvailable = await checkBackend();
    if (backendAvailable) {
      try {
        console.log('✅ Requesting password reset via backend API for:', email);
        const result = await apiRequestPasswordReset(email);
        if (result.success) {
          console.log('✅ Password reset code sent successfully via backend');
          return { 
            success: true, 
            resetCode: result.resetCode // Backend returns code for demo
          };
        } else {
          console.log('❌ Backend password reset request failed:', result.error);
          return { success: false, error: result.error || 'Failed to send reset code' };
        }
      } catch (error) {
        console.error('⚠️ Backend password reset request error:', error);
        const errorMessage = error.message || 'Failed to send reset code';
        // Check if it's a network error
        if (error.message && (error.message.includes('fetch') || error.message.includes('Network'))) {
          return { success: false, error: 'Cannot connect to server. Please ensure the backend server is running.' };
        }
        return { success: false, error: errorMessage };
      }
    }

    // Fallback to localStorage (for backward compatibility)
    console.log('✅ Requesting password reset via localStorage for:', email);
    const users = await getUsersLocal();
    const user = users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Don't reveal if email exists for security
      return { success: true, resetCode: null };
    }

    // Generate reset code
    const resetCode = generateVerificationCode();
    const passwordResetCodeExpiry = createVerificationCodeExpiry();

    // Update user with reset code
    await dbUpdateUser(user.id, {
      passwordResetCode: resetCode,
      passwordResetCodeExpiry: passwordResetCodeExpiry,
    });

    return { success: true, resetCode };
  };

  const resetPassword = async (email, code, newPassword) => {
    // Try backend API first if available
    const backendAvailable = await checkBackend();
    if (backendAvailable) {
      try {
        console.log('✅ Resetting password via backend API for:', email);
        const result = await apiResetPassword(email, code, newPassword);
        if (result.success) {
          console.log('✅ Password reset successful via backend');
          return { success: true };
        } else {
          console.log('❌ Backend password reset failed:', result.error);
          return { success: false, error: result.error || 'Failed to reset password' };
        }
      } catch (error) {
        console.warn('⚠️ Backend password reset error:', error);
        return { success: false, error: error.message || 'Failed to reset password' };
      }
    }

    // Fallback to localStorage (for backward compatibility)
    console.log('✅ Resetting password via localStorage for:', email);
    const users = await getUsersLocal();
    const user = users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check reset code
    if (!user.passwordResetCode || user.passwordResetCode !== code) {
      return { success: false, error: 'Invalid reset code' };
    }

    // Check expiry
    if (!user.passwordResetCodeExpiry || isVerificationCodeExpired(user.passwordResetCodeExpiry)) {
      return { success: false, error: 'Reset code has expired. Please request a new one.' };
    }

    // Update password
    await dbUpdateUser(user.id, {
      password: newPassword,
      passwordResetCode: null,
      passwordResetCodeExpiry: null,
    });

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        login,
        logout,
        updateCardInfo,
        updateUser,
        deleteAccount,
        setRememberMe,
        verifyEmail,
        resendVerificationCode,
        requestVerificationByEmail,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
