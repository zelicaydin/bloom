import { useMemo, useState } from "react";
import { useProducts } from "../../store/ProductsContext";
import ProductFilters from "../../components/product/ProductFilters";

const SortBar = ({ children, searchQuery = "" }) => {
  const { products } = useProducts();
  const [filters, setFilters] = useState({
    type: null,
    brand: null,
    price: null,
    category: null,
  });

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
      const ranges = { low: [0, 20], medium: [20, 40], high: [40, Infinity] };
      const [min, max] = ranges[filters.price];
      list = list.filter((p) => p.price >= min && p.price < max);
    }
    if (filters.category === "popular") list.sort((a, b) => b.popularity - a.popularity);

    // Apply sorting
    switch (sortBy) {
      case "price_asc": list.sort((a, b) => a.price - b.price); break;
      case "price_desc": list.sort((a, b) => b.price - a.price); break;
      case "brand": list.sort((a, b) => a.brand.localeCompare(b.brand)); break;
      case "type": list.sort((a, b) => a.type.localeCompare(b.type)); break;
      case "oldest": list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      default: list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [filters, sortBy, searchQuery, products]);

  return (
    <>
      {/* BAR */}
      <div style={styles.bar}>
        <div style={styles.left}>
          <ProductFilters filters={filters} setFilters={setFilters} brands={brands} types={types} />
        </div>

        <div style={styles.right}>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.select}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_desc">Price ↓</option>
            <option value="price_asc">Price ↑</option>
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
  },
  left: { display: "flex", gap: "40px" },
  right: {},
  select: { background: "transparent", border: "none", color: "#fff", fontSize: "16px" },
};

export default SortBar;