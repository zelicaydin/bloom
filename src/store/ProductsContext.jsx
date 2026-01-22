import { createContext, useContext, useState, useEffect } from 'react';
import defaultProducts from '../data/products';
import {
  getProducts,
  saveProducts,
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

  // Load products from localStorage
  useEffect(() => {
    const loadProducts = async () => {
      let loadedProducts = await getProducts();

      // If no products found, use defaults
      if (!loadedProducts || loadedProducts.length === 0) {
        loadedProducts = [...defaultProducts];
        await saveProducts(loadedProducts);
      } else {
        // Merge default product data (like images) with existing products
        // This ensures existing products get new fields from defaults
        const defaultProductsMap = new Map(
          defaultProducts.map((p) => [p.id, p])
        );
        loadedProducts = loadedProducts.map((product) => {
          const defaultProduct = defaultProductsMap.get(product.id);
          if (defaultProduct) {
            // Merge default product data (especially image) with existing product
            return {
              ...defaultProduct,
              ...product, // Existing product data takes precedence
              // But ensure image is set from default if missing
              image: product.image || defaultProduct.image,
            };
          }
          return product;
        });
        // Save merged products back to localStorage
        await saveProducts(loadedProducts);
      }

      // Merge popularity data from tracking
      const productsWithPopularity = loadedProducts.map((product) => ({
        ...product,
        popularity: getProductPopularity(product.id),
      }));

      setProducts(productsWithPopularity);
    };

    loadProducts();
  }, []);

  // Save products to database whenever they change (but don't save popularity, it's tracked separately)
  useEffect(() => {
    if (products.length > 0) {
      const saveProductsAsync = async () => {
        await saveProducts(products);
      };
      saveProductsAsync();
    }
  }, [products]);

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
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      popularity: 0, // New products start with 0 popularity
    };

    // Save to database
    await dbAddProduct(newProduct);

    // Update local state
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
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
