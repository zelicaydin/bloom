import { useMemo, useState, useEffect } from "react";
import { useProducts } from "../../store/ProductsContext";
import { useReviews } from "../../store/ReviewsContext";
import ProductFilters from "../../components/product/ProductFilters";

const SortBar = ({ children, searchQuery = "", initialCategory = null }) => {
  const { products } = useProducts();
  const { reviews } = useReviews();
  const [filters, setFilters] = useState({
    type: null,
    brand: null,
    price: null,
    category: initialCategory || null,
  });

  // Update category filter when initialCategory changes
  useEffect(() => {
    if (initialCategory) {
      setFilters(prev => ({ ...prev, category: initialCategory }));
    }
  }, [initialCategory]);

  const [sortBy, setSortBy] = useState("newest");

  const brands = [...new Set(products.map((p) => p.brand))];
  const types = [...new Set(products.map((p) => p.type))];

  // Compute visible products
  const visibleProducts = useMemo(() => {
    let list = [...products];

    // Apply search filter first
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter((p) =>
        [p.name, p.brand, p.type].join(" ").toLowerCase().includes(query)
      );
    }

    // Apply selected filters
    if (filters.type) list = list.filter((p) => p.type === filters.type);
    if (filters.brand) list = list.filter((p) => p.brand === filters.brand);
    if (filters.price) {
      const ranges = { 
        low: [0, 25], 
        medium: [25, 50], 
        high: [50, Infinity] 
      };
      const [min, max] = ranges[filters.price] || [0, Infinity];
      list = list.filter((p) => p.price >= min && (max === Infinity || p.price < max));
    }
    
    // Apply category filters (these override sortBy)
    if (filters.category === "popular") {
      list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else if (filters.category === "new") {
      list.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Newest first
      });
    } else if (filters.category === "bestReviewed") {
      // Sort by average rating from reviews (highest first)
      list.sort((a, b) => {
        const reviewsA = reviews.filter(r => r.productId === a.id);
        const reviewsB = reviews.filter(r => r.productId === b.id);
        const avgA = reviewsA.length > 0 
          ? reviewsA.reduce((sum, r) => sum + r.rating, 0) / reviewsA.length 
          : (a.rating || 0);
        const avgB = reviewsB.length > 0 
          ? reviewsB.reduce((sum, r) => sum + r.rating, 0) / reviewsB.length 
          : (b.rating || 0);
        return avgB - avgA; // Highest rating first
      });
    } else if (filters.category === "sustainable") {
      // Sort by number of sustainability markers (most markers first)
      list.sort((a, b) => {
        const markersA = (a.markers || []).length;
        const markersB = (b.markers || []).length;
        return markersB - markersA; // Most markers first
      });
    } else if (filters.category === "cheapest") {
      // Sort by price ascending (cheapest first)
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (filters.category === "premium") {
      // Sort by price descending (premium/highest price first)
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      // Apply regular sorting if no category filter
      switch (sortBy) {
        case "price_asc": 
          list.sort((a, b) => (a.price || 0) - (b.price || 0)); 
          break;
        case "price_desc": 
          list.sort((a, b) => (b.price || 0) - (a.price || 0)); 
          break;
        case "brand": 
          list.sort((a, b) => (a.brand || '').localeCompare(b.brand || '')); 
          break;
        case "type": 
          list.sort((a, b) => (a.type || '').localeCompare(b.type || '')); 
          break;
        case "oldest": 
          list.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateA - dateB;
          }); 
          break;
        default: 
          list.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA; // Newest first
          });
      }
    }

    return list;
  }, [filters, sortBy, searchQuery, products, reviews]);

  return (
    <>
      {/* BAR */}
      <div style={styles.bar}>
        <div style={styles.left}>
          <ProductFilters filters={filters} setFilters={setFilters} brands={brands} types={types} />
        </div>

        <div style={styles.right}>
          <label style={styles.sortLabel}>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            style={styles.select}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="brand">Brand A–Z</option>
            <option value="type">Type A–Z</option>
          </select>
        </div>
      </div>

      {/* OUTPUT */}
      {children(visibleProducts)}
    </>
  );
};

const styles = {
  bar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBlock: "40px",
    marginBottom: "80px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    flexWrap: "wrap",
    gap: "20px",
  },
  left: { 
    display: "flex", 
    gap: "40px",
    flex: 1,
    minWidth: "0",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  sortLabel: {
    fontSize: "0.9rem",
    color: "rgba(255,255,255,0.7)",
    fontWeight: 500,
  },
  select: { 
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff", 
    fontSize: "0.9rem",
    padding: "10px 40px 10px 16px",
    borderRadius: 0,
    cursor: "pointer",
    outline: "none",
    minWidth: "180px",
    transition: "all 0.2s ease",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23ffffff' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
  },
};

export default SortBar;