import { useEffect, useState } from "react";
import SortBar from "./SortBar";
import ProductGrid from "../../components/product/ProductGrid";
import { useProducts } from "../../store/ProductsContext";

const Catalogue = ({ navigate, searchQuery }) => {
  const { products } = useProducts();
  const [categoryFilter, setCategoryFilter] = useState(null);

  // Read category from URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    setCategoryFilter(category || null);
  }, []); // Read on mount

  // Also listen for URL changes (when navigating with query params)
  useEffect(() => {
    const checkUrl = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const category = urlParams.get('category');
      setCategoryFilter(category || null);
    };
    
    // Check immediately
    checkUrl();
    
    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', checkUrl);
    return () => window.removeEventListener('popstate', checkUrl);
  }, []);

  return (
    <section style={styles.page}>
      <h1 style={styles.title}>Catalogue</h1>
      {/* Sort / Filter Bar */}
      <SortBar
        searchQuery={searchQuery}
        products={products}
        initialCategory={categoryFilter}
      >
        {(visibleProducts) => (
          <>
            <ProductGrid products={visibleProducts} navigate={navigate} searchQuery={searchQuery} />
          </>
        )}
      </SortBar>
    </section>
  );
};

const styles = {
  page: {
    paddingTop: "160px",
    paddingInline: "80px",
    paddingBottom: "80px",
    backgroundColor: "#141414",
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '60px',
    letterSpacing: '-0.04em',
  },
};

export default Catalogue;