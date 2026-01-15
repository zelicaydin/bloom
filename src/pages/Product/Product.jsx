import React, { useState, useEffect } from 'react';
import { useProducts } from '../../store/ProductsContext';
import ProductGrid from '../../components/product/ProductGrid';
import Button from '../../components/ui/Button';
import QuantityPicker from '../../components/ui/QuantityPicker';
import Rating from '../../components/ui/Rating';
import SustainabilityMarkers from '../../components/ui/SustainabilityMarkers';
import { useCart } from '../../store/CartContext';

const Product = ({ path, navigate }) => {
  const { addToCart } = useCart();
  const { products } = useProducts();
  const id = path.split('/').pop();
  const product = products.find((p) => p.id.toString() === id);

  const [quantity, setQuantity] = useState(1);

  // Scroll to top when product page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [path]);

  if (!product) {
    return (
      <div style={{ padding: '80px', color: '#fff' }}>Product not found</div>
    );
  }

  // ---- Related products logic ----
  const related = products
    .filter((p) => p.id !== product.id)
    .filter((p) => p.brand === product.brand || p.type === product.type);

  let suggested = [...related];

  if (suggested.length < 4) {
    const remaining = products.filter(
      (p) => p.id !== product.id && !suggested.includes(p)
    );
    while (suggested.length < 4 && remaining.length > 0) {
      const randIndex = Math.floor(Math.random() * remaining.length);
      suggested.push(remaining[randIndex]);
      remaining.splice(randIndex, 1);
    }
  } else {
    suggested = suggested.slice(0, 4);
  }

  const handleAddToCart = (qty) => {
    if (product) {
      addToCart(product, qty);
      // Reset quantity after adding
      setQuantity(1);
    }
  };

  return (
    <div style={styles.container}>
      {/* ===== Hero / product section ===== */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.imageWrapper}>
            <img
              src={product.image || 'https://via.placeholder.com/600x800'}
              alt={product.name}
              style={styles.image}
            />
          </div>

          <div style={styles.info}>
            {/* Type • Brand line */}
            <p style={styles.typeBrand}>
              {product.type} • {product.brand}
            </p>

            <h1 style={styles.name}>{product.name}</h1>

            <p style={styles.price}>${product.price}</p>

            {/* Rating component */}
            <Rating
              rating={product.rating || 0} // default 0 if not set
              reviews={product.reviews || 0} // default 0
              style={{ paddingBottom: '32px' }}
            />

            <p style={styles.description}>
              {product.description ||
                'This is a placeholder product description.'}
            </p>

            {product.markers && product.markers.length > 0 && (
              <SustainabilityMarkers markers={product.markers} />
            )}

            <div style={styles.cartRow}>
              <QuantityPicker
                value={quantity}
                onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
                onIncrease={() => setQuantity((q) => q + 1)}
              />
              <Button
                label='Add to Cart'
                onClick={() => handleAddToCart(quantity)}
                style={{
                  flex: 1,
                  height: '100%',
                  borderRadius: 0,
                  borderLeft: '1px solid #111',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Related products ===== */}
      <section style={styles.relatedSection}>
        <div style={styles.relatedContent}>
          <h2 style={styles.relatedTitle}>You might also like</h2>
          <ProductGrid products={suggested} navigate={navigate} />
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    color: '#fff',
    width: '100%',
    overflowX: 'hidden',
  },

  // ----- Hero Section -----
  heroSection: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#111',
    padding: '112px 80px 40px 80px',
    boxSizing: 'border-box',
    display: 'flex',
  },
  heroContent: {
    display: 'flex',
    maxWidth: '1440px',
    margin: '0 auto',
    width: '100%',
    gap: '40px',
    boxSizing: 'border-box',
    flex: 1,
    height: 'calc(100vh - 112px - 40px)', // subtract top and bottom padding
  },
  imageWrapper: {
    flex: 1,
    backgroundColor: '#222',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    height: '100%', // fill parent height
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#111',
    boxSizing: 'border-box',
  },

  // ----- Structured Info -----
  typeBrand: {
    color: '#fff',
    fontSize: '20px',
    letterSpacing: '-0.02em',
    margin: 0,
    paddingBottom: '32px',
  },
  name: {
    fontSize: '48px',
    fontWeight: 600,
    letterSpacing: '-0.04em',
    margin: 0,
    paddingBottom: '12px',
  },
  price: {
    fontSize: '20px',
    fontWeight: 600,
    margin: 0,
    paddingBottom: '32px',
  },
  description: {
    lineHeight: 1.5,
    paddingBottom: '16px',
    paddingTop: '16px',
  },
  cartRow: {
    display: 'flex',
    gap: 0,
    height: '48px',
    paddingTop: '32px',
  },

  // ----- Related Section -----
  relatedSection: {
    width: '100%',
    backgroundColor: '#111',
    boxSizing: 'border-box',
  },
  relatedContent: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '80px',
    boxSizing: 'border-box',
  },
  relatedTitle: {
    marginBottom: '24px',
  },
};

export default Product;
