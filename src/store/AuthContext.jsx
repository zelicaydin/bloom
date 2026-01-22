import { createContext, useContext, useState, useEffect } from 'react';
import { hashPasswordAsync } from '../utils/hash';
import {
  getUsers,
  saveUsers,
  addUser as dbAddUser,
  updateUser as dbUpdateUser,
  deleteUser as dbDeleteUser,
} from '../services/database';

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

      // Check if admin exists and has correct password hash
      const existingAdmin = users.find((u) => u.email === 'admin@bloom.com');

      const adminPhoto =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzQ0NDQ0NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BPC90ZXh0Pjwvc3ZnPg==';

      // Always hash the admin password with the correct method (same as login uses)
      const adminPassword = await hashPasswordAsync('Admin123!');

      // Only update admin if it doesn't exist or needs password update
      if (!existingAdmin || existingAdmin.password !== adminPassword) {
        // Remove any existing admin accounts
        const filteredUsers = users.filter(
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
        };

        filteredUsers.push(adminUser);
        await saveUsersLocal(filteredUsers);
      } else {
        // Admin exists and is correct, just ensure all users are saved (preserve existing users)
        await saveUsersLocal(users);
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
    const users = await getUsersLocal();

    // Check if user already exists
    if (users.find((u) => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }

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
    };

    // Save to database
    await dbAddUser(newUser);

    // Auto-login after signup
    const userData = { ...newUser };
    delete userData.password; // Don't store password in user state
    setUser(userData);
    localStorage.setItem('bloom_user', JSON.stringify(userData));

    return { success: true };
  };

  const login = async (email, password) => {
    const users = await getUsersLocal();
    const user = users.find((u) => u.email === email);

    if (!user) {
      return { success: false, error: 'No account found with this email' };
    }

    // Verify password (compare hashes)
    if (user.password !== password) {
      return { success: false, error: 'Incorrect password' };
    }

    // Login successful
    const userData = { ...user };
    delete userData.password; // Don't store password in user state
    setUser(userData);
    localStorage.setItem('bloom_user', JSON.stringify(userData));

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
