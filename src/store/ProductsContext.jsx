import { createContext, useContext, useState, useEffect } from 'react';
import defaultProducts from '../data/products';
import {
  getProducts,
  addProduct as dbAddProduct,
  updateProduct as dbUpdateProduct,
  deleteProduct as dbDeleteProduct,
} from '../services/database';

const ProductsContext = createContext(null);

// Get popularity from tracking data (moved outside component for stability)
const getProductPopularity = (productId) => {
  const popularityKey = 'bloom_product_popularity';
  const storedPopularity = localStorage.getItem(popularityKey);
  if (storedPopularity) {
    try {
      const popularityData = JSON.parse(storedPopularity);
      return popularityData[productId] || 0;
    } catch (e) {
      return 0;
    }
  }
  return 0;
};

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);

  // Load products from backend (or localStorage fallback) - same pattern as users
  useEffect(() => {
    const loadProducts = async () => {
      console.log('📦 Loading products from backend...');
      const loadedProducts = await getProducts();
      console.log('✅ Loaded products from backend:', loadedProducts?.length || 0);

      // If no products found, use defaults and save them to backend
      if (!loadedProducts || loadedProducts.length === 0) {
        console.log('📦 No products found, initializing defaults');
        // Save defaults to backend one by one (same pattern as users)
        for (const product of defaultProducts) {
          try {
            await dbAddProduct(product);
            console.log('✅ Saved default product to backend:', product.id);
          } catch (error) {
            console.warn('⚠️ Failed to save default product:', product.id, error);
          }
        }
        // Reload products after saving defaults
        const reloadedProducts = await getProducts();
        const productsWithPopularity = (reloadedProducts || []).map((product) => ({
          ...product,
          popularity: getProductPopularity(product.id),
        }));
        setProducts(productsWithPopularity);
        console.log('✅ Products initialized and loaded:', productsWithPopularity.length);
      } else {
        // Products exist - just add popularity data
        const productsWithPopularity = loadedProducts.map((product) => ({
          ...product,
          popularity: getProductPopularity(product.id),
        }));
        setProducts(productsWithPopularity);
        console.log('✅ Products loaded into state:', productsWithPopularity.length);
      }
    };

    loadProducts();
  }, []);

  // Don't auto-save products on every change - this causes issues and is inefficient
  // Products are saved individually when added/updated/deleted
  // This useEffect was causing products to not persist properly across browsers

  // Update products with latest popularity when component mounts or when popularity data might have changed
  useEffect(() => {
    const updatePopularity = () => {
      setProducts((prevProducts) =>
        prevProducts.map((product) => ({
          ...product,
          popularity: getProductPopularity(product.id),
        }))
      );
    };

    // Update popularity on mount
    updatePopularity();

    // Listen for storage changes (in case another tab updates popularity)
    const handleStorageChange = (e) => {
      if (e.key === 'bloom_product_popularity') {
        updatePopularity();
      }
    };

    // Listen for custom event when popularity is updated in same tab
    const handlePopularityUpdate = (e) => {
      // Update all products, not just the one that changed
      updatePopularity();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('popularityUpdated', handlePopularityUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popularityUpdated', handlePopularityUpdate);
    };
  }, []);

  const addProduct = async (product) => {
    // Don't generate ID here - let the backend generate sequential ID
    const productToAdd = {
      ...product,
      // Remove id if it exists, let backend generate it
      createdAt: new Date().toISOString().split('T')[0],
      popularity: 0, // New products start with 0 popularity
    };
    delete productToAdd.id; // Ensure no ID is sent, backend will generate sequential ID

    // Save to database (backend will generate sequential ID)
    const createdProduct = await dbAddProduct(productToAdd);

    // Update local state with the product returned from backend (which has the correct ID)
    setProducts((prev) => [...prev, createdProduct]);
    return createdProduct;
  };

  const updateProduct = async (productId, updates) => {
    // Don't allow updating popularity directly - it's calculated from cart additions
    const { popularity, ...updatesWithoutPopularity } = updates;

    // Save to database
    await dbUpdateProduct(productId, updatesWithoutPopularity);

    // Update local state
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = { ...p, ...updatesWithoutPopularity };
          // Always recalculate popularity from tracking data
          updated.popularity = getProductPopularity(productId);
          return updated;
        }
        return p;
      })
    );
  };

  const deleteProduct = async (productId) => {
    // Delete from database
    await dbDeleteProduct(productId);

    // Update local state
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        setProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductsProvider');
  }
  return context;
};
