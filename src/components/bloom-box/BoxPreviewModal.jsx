import React from 'react';
import SwapModal from './SwapModal';

const BoxPreviewModal = ({ products, onAccept, onEdit, onClose, onSwap }) => {
  const [showSwapModal, setShowSwapModal] = React.useState(false);
  const [productToSwap, setProductToSwap] = React.useState(null);

  const handleSwapClick = (product) => {
    setProductToSwap(product);
    setShowSwapModal(true);
  };

  const handleSwapSelect = (newProduct) => {
    if (onSwap && productToSwap) {
      onSwap(productToSwap.id, newProduct);
      // Update local products state
      const updatedProducts = products.map((p) =>
        p.id === productToSwap.id ? newProduct : p
      );
      // Note: We can't directly update products here, so we rely on parent callback
    }
    setShowSwapModal(false);
    setProductToSwap(null);
  };

  const totalPrice = products.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <h2 style={styles.title}>Your Personalized BloomBox</h2>
            <button onClick={onClose} style={styles.closeButton}>
              ×
            </button>
          </div>

          <div style={styles.content}>
            <p style={styles.description}>
              We've curated these products based on your preferences. Review and customize your box before accepting.
            </p>

            <div style={styles.productsGrid}>
              {products.map((product) => (
                <div key={product.id} style={styles.productCard}>
                  <div style={styles.imageWrapper}>
                    <img
                      src={product.image || 'https://via.placeholder.com/200'}
                      alt={product.name}
                      style={styles.productImage}
                    />
                    <button
                      onClick={() => handleSwapClick(product)}
                      style={styles.swapButton}
                    >
                      Swap
                    </button>
                  </div>
                  <div style={styles.productInfo}>
                    <p style={styles.productTypeBrand}>
                      {product.type} • {product.brand}
                    </p>
                    <h4 style={styles.productName}>{product.name}</h4>
                    <p style={styles.productPrice}>${product.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.summary}>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Total Value:</span>
                <span style={styles.summaryValue}>${totalPrice.toFixed(2)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Your Price:</span>
                <span style={styles.summaryValue}>$99.99</span>
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            <button onClick={onEdit} style={styles.editButton}>
              Edit Box
            </button>
            <button onClick={onAccept} style={styles.acceptButton}>
              Accept Box
            </button>
          </div>
        </div>
      </div>

      {showSwapModal && productToSwap && (
        <SwapModal
          currentProduct={productToSwap}
          onSelect={(newProduct) => {
            if (onSwap && productToSwap) {
              onSwap(productToSwap.id, newProduct);
            }
            setShowSwapModal(false);
            setProductToSwap(null);
          }}
          onClose={() => {
            setShowSwapModal(false);
            setProductToSwap(null);
          }}
        />
      )}
    </>
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
    maxWidth: '1000px',
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
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
  },
  description: {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '24px',
    lineHeight: 1.5,
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },
  productCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '200px',
    overflow: 'hidden',
    background: '#1a1a1a',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 0,
  },
  swapButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '6px 12px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    borderRadius: 0,
  },
  productInfo: {
    padding: '12px',
  },
  productTypeBrand: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.6)',
    margin: '0 0 6px 0',
  },
  productName: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#fff',
    margin: '0 0 6px 0',
  },
  productPrice: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
    fontWeight: 500,
  },
  summary: {
    padding: '20px',
    background: 'rgba(255,255,255,0.05)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  summaryLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.7)',
  },
  summaryValue: {
    fontSize: '1rem',
    fontWeight: 500,
    color: '#fff',
  },
  footer: {
    display: 'flex',
    gap: '12px',
    padding: '24px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  editButton: {
    flex: 1,
    background: 'transparent',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
  },
  acceptButton: {
    flex: 1,
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
  },
};

export default BoxPreviewModal;
