import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [cartItems, setCartItems] = useState([]);

  // Get cart key for current user
  const getCartKey = (userId) => {
    return userId ? `bloom_cart_${userId}` : 'bloom_cart_guest';
  };

  // Test items for demonstration (only for admin)
  const getTestItems = () => [
    {
      id: '1',
      name: 'Organic Shampoo',
      price: 18,
      brand: 'Bloom Labs',
      type: 'shampoo',
      popularity: 120,
      createdAt: '2026-01-05',
      quantity: 2,
    },
    {
      id: '3',
      name: 'Botanical Face Cream',
      price: 45,
      brand: 'Bloom Labs',
      type: 'face-care',
      popularity: 160,
      createdAt: '2025-12-20',
      quantity: 1,
    },
    {
      id: '5',
      name: 'Blood Orange Body Lotion',
      price: 45,
      brand: 'Prada',
      type: 'Single Origin',
      popularity: 160,
      createdAt: '2025-12-20',
      quantity: 3,
    },
  ];

  // Load cart when user changes or on mount
  useEffect(() => {
    if (!user) {
      // User logged out, clear cart
      setCartItems([]);
      return;
    }

    const cartKey = getCartKey(user.id);
    const storedCart = localStorage.getItem(cartKey);
    
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
      } catch (e) {
        console.error('Error parsing cart data:', e);
        localStorage.removeItem(cartKey);
        setCartItems([]);
      }
    } else {
      // No cart for this user, check if admin and add test items
      if (user.isAdmin || user.email === 'admin@bloom.com') {
        const testItems = getTestItems();
        setCartItems(testItems);
        localStorage.setItem(cartKey, JSON.stringify(testItems));
      } else {
        // Regular user, start with empty cart
        setCartItems([]);
      }
    }
  }, [user?.id]); // Reload when user ID changes

  // Save cart to localStorage whenever it changes (only if user is logged in)
  useEffect(() => {
    if (user) {
      const cartKey = getCartKey(user.id);
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, user?.id]);

  const addToCart = (product, quantity = 1) => {
    // Track popularity - increment count when product is added to cart
    const popularityKey = 'bloom_product_popularity';
    const storedPopularity = localStorage.getItem(popularityKey);
    const popularityData = storedPopularity ? JSON.parse(storedPopularity) : {};
    
    // Increment popularity count for this product
    const currentCount = popularityData[product.id] || 0;
    popularityData[product.id] = currentCount + quantity;
    localStorage.setItem(popularityKey, JSON.stringify(popularityData));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('popularityUpdated', { detail: { productId: product.id } }));

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      let updatedItems;
      
      if (existingItem) {
        updatedItems = prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        showNotification(`${product.name} quantity updated in cart`);
      } else {
        updatedItems = [...prevItems, { ...product, quantity }];
        showNotification(`${product.name} added to cart`);
      }
      
      return updatedItems;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
