const ProductFilters = ({ filters, setFilters, brands, types }) => {
  const update = (key, value) =>
    setFilters({ ...filters, [key]: value || null });

  const hasActiveFilters = filters.type || filters.brand || filters.price || filters.category;
  
  const clearAll = () => {
    setFilters({
      type: null,
      brand: null,
      price: null,
      category: null,
    });
  };

  const formatType = (type) => {
    return type
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div style={styles.container}>
      <select 
        value={filters.type || ''} 
        onChange={(e) => update("type", e.target.value)}
        style={{
          ...styles.select,
          ...(filters.type ? { borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)' } : {}),
        }}
        onMouseEnter={(e) => {
          if (!filters.type) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          }
        }}
        onMouseLeave={(e) => {
          if (!filters.type) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }
        }}
      >
        <option value="">Product Type</option>
        {types.map((type) => (
          <option key={type} value={type}>
            {formatType(type)}
          </option>
        ))}
      </select>

      <select 
        value={filters.price || ''} 
        onChange={(e) => update("price", e.target.value)}
        style={{
          ...styles.select,
          ...(filters.price ? { borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)' } : {}),
        }}
        onMouseEnter={(e) => {
          if (!filters.price) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          }
        }}
        onMouseLeave={(e) => {
          if (!filters.price) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }
        }}
      >
        <option value="">Price Range</option>
        <option value="low">$0 - $25</option>
        <option value="medium">$25 - $50</option>
        <option value="high">$50+</option>
      </select>

      <select 
        value={filters.brand || ''} 
        onChange={(e) => update("brand", e.target.value)}
        style={{
          ...styles.select,
          ...(filters.brand ? { borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)' } : {}),
        }}
        onMouseEnter={(e) => {
          if (!filters.brand) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          }
        }}
        onMouseLeave={(e) => {
          if (!filters.brand) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }
        }}
      >
        <option value="">Brand</option>
        {brands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>

      <select 
        value={filters.category || ''} 
        onChange={(e) => update("category", e.target.value)}
        style={{
          ...styles.select,
          ...(filters.category ? { borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)' } : {}),
        }}
        onMouseEnter={(e) => {
          if (!filters.category) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          }
        }}
        onMouseLeave={(e) => {
          if (!filters.category) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }
        }}
      >
        <option value="">Category</option>
        <option value="new">Newest Arrivals</option>
        <option value="popular">Most Popular</option>
        <option value="bestReviewed">Best Reviewed</option>
        <option value="sustainable">Sustainable</option>
        <option value="cheapest">Cheapest</option>
        <option value="premium">Premium</option>
      </select>

      {hasActiveFilters && (
        <button 
          onClick={clearAll} 
          style={styles.clearButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderRadius = '0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderRadius = '0';
          }}
        >
          Clear All
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  select: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    padding: '10px 16px',
    fontSize: '0.9rem',
    borderRadius: 0,
    cursor: 'pointer',
    outline: 'none',
    minWidth: '160px',
    transition: 'all 0.2s ease',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23ffffff' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '40px',
  },
  clearButton: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.8)',
    padding: '10px 20px',
    fontSize: '0.9rem',
    borderRadius: 0,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: 500,
  },
};

export default ProductFilters;
