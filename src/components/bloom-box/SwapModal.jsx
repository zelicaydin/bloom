import { useState, useMemo } from 'react';
import { useProducts } from '../../store/ProductsContext';

const SwapModal = ({ currentProduct, onSelect, onClose }) => {
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter products - exclude current product and filter by search/type
  const availableProducts = useMemo(() => {
    let filtered = products.filter(p => p.id !== currentProduct.id);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.type.toLowerCase().includes(query)
      );
    }
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(p => p.type === selectedFilter);
    }
    
    return filtered;
  }, [products, currentProduct.id, searchQuery, selectedFilter]);

  const productTypes = useMemo(() => {
    return [...new Set(products.map(p => p.type))];
  }, [products]);

  const handleSelect = (product) => {
    onSelect(product);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Swap Product</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>
        
        <div style={styles.currentProduct}>
          <p style={styles.currentLabel}>Currently selected:</p>
          <div style={styles.currentCard}>
            <img
              src={currentProduct.image || 'https://via.placeholder.com/80'}
              alt={currentProduct.name}
              style={styles.currentImage}
            />
            <div>
              <p style={styles.currentName}>{currentProduct.name}</p>
              <p style={styles.currentBrand}>{currentProduct.brand}</p>
            </div>
          </div>
        </div>

        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Types</option>
            {productTypes.map(type => (
              <option key={type} value={type}>
                {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.productsContainer}>
          {availableProducts.length > 0 ? (
            <div style={styles.productsGrid}>
              {availableProducts.map((product) => (
                <div
                  key={product.id}
                  style={styles.swapCard}
                  onClick={() => handleSelect(product)}
                >
                  <div style={styles.swapImageWrapper}>
                    <img
                      src={product.image || 'https://via.placeholder.com/200'}
                      alt={product.name}
                      style={styles.swapImage}
                    />
                  </div>
                  <div style={styles.swapInfo}>
                    <p style={styles.swapTypeBrand}>
                      {product.type} • {product.brand}
                    </p>
                    <h4 style={styles.swapName}>{product.name}</h4>
                    <p style={styles.swapPrice}>${product.price}</p>
                  </div>
                  <button style={styles.selectButton}>Select</button>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.noResults}>No products found. Try adjusting your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
  },
  modal: {
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 0,
    width: '100%',
    maxWidth: '1200px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 500,
    color: '#fff',
    margin: 0,
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '2rem',
    cursor: 'pointer',
    padding: 0,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentProduct: {
    padding: '20px 24px',
    background: 'rgba(255,255,255,0.05)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  currentLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: '0 0 12px 0',
  },
  currentCard: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  currentImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: 0,
  },
  currentName: {
    fontSize: '1rem',
    fontWeight: 500,
    color: '#fff',
    margin: 0,
  },
  currentBrand: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    margin: '4px 0 0 0',
  },
  filters: {
    display: 'flex',
    gap: '16px',
    padding: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    background: 'rgba(44, 44, 44, 1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '12px 16px',
    fontSize: '0.9rem',
    color: '#fff',
    outline: 'none',
    borderRadius: 0,
  },
  filterSelect: {
    background: 'rgba(44, 44, 44, 1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '12px 40px 12px 16px',
    fontSize: '0.9rem',
    color: '#fff',
    outline: 'none',
    minWidth: '180px',
    borderRadius: 0,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23ffffff' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
  },
  productsContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
  },
  swapCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 0,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s, background 0.2s',
    position: 'relative',
  },
  swapImageWrapper: {
    width: '100%',
    height: '200px',
    overflow: 'hidden',
    background: '#1a1a1a',
  },
  swapImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 0,
  },
  swapInfo: {
    padding: '16px',
  },
  swapTypeBrand: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.6)',
    margin: '0 0 8px 0',
  },
  swapName: {
    fontSize: '0.95rem',
    fontWeight: 500,
    color: '#fff',
    margin: '0 0 8px 0',
  },
  swapPrice: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
    fontWeight: 500,
  },
  selectButton: {
    width: '100%',
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '10px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '8px',
    borderRadius: 0,
  },
  noResults: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    padding: '40px',
    fontSize: '1rem',
  },
};

export default SwapModal;
