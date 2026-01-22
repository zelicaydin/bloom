import React, { useState, useEffect } from 'react';
import { useProducts } from '../../store/ProductsContext';
import { useCart } from '../../store/CartContext';
import { useReviews } from '../../store/ReviewsContext';
import { useAuth } from '../../store/AuthContext';
import { useNotification } from '../../store/NotificationContext';
import ProductGrid from '../../components/product/ProductGrid';
import Button from '../../components/ui/Button';
import QuantityPicker from '../../components/ui/QuantityPicker';
import Rating from '../../components/ui/Rating';
import SustainabilityMarkers from '../../components/ui/SustainabilityMarkers';

const Product = ({ path, navigate }) => {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { getProductReviews } = useReviews();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  // Scroll to top is handled globally by the router

  // Get product ID from path
  const id = path.split('/').pop();
  const product = products.find((p) => p.id.toString() === id);

  // Set loading to false once products are loaded
  useEffect(() => {
    if (products.length > 0) {
      setLoading(false);
    }
  }, [products]);

  // Load and update reviews for this product
  useEffect(() => {
    if (!product) return;

    const loadReviews = async () => {
      const productReviews = await getProductReviews(product.id);
      setReviews(productReviews);

      // Calculate average rating from actual reviews
      if (productReviews.length > 0) {
        const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = sum / productReviews.length;
        setAverageRating(avg);
      } else {
        // Fallback to product's default rating if no reviews
        setAverageRating(product.rating || 0);
      }
    };

    loadReviews();

    // Listen for review updates
    const handleReviewUpdate = (event) => {
      if (event.detail.productId === product.id) {
        loadReviews();
      }
    };

    window.addEventListener('reviewsUpdated', handleReviewUpdate);
    return () =>
      window.removeEventListener('reviewsUpdated', handleReviewUpdate);
  }, [product, getProductReviews]);

  if (loading) {
    return (
      <div
        style={{ padding: '160px 80px', color: '#fff', textAlign: 'center' }}
      >
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{ padding: '160px 80px', color: '#fff', textAlign: 'center' }}
      >
        <h1>Product not found</h1>
        <button
          onClick={() => navigate('/catalogue')}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            background: '#fff',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Back to Catalogue
        </button>
      </div>
    );
  }

  // Related products logic
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
      showNotification(`${product.name} added to cart!`, 3000);
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
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x800';
              }}
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
                        
            <div style={{ paddingBottom: '32px' }}>
              <Rating
                rating={reviews.length > 0 ? averageRating : 0}
                reviews={reviews.length}
                size={24}
                color='#ffffff'
              />
            </div>
                        
            <p style={styles.description}>
                            
              {product.description ||
                'This is a placeholder product description.'}
                          
            </p>
                        {/* Sustainability markers component */}
                        
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
            {/* ===== Reviews Section ===== */}
            
      {reviews.length > 0 && (
        <section style={styles.reviewsSection}>
          <h2 style={styles.reviewsTitle}>Customer Reviews</h2>
          <div style={styles.reviewsList}>
            {reviews.map((review) => (
              <div key={review.id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div style={styles.reviewRating}>
                    <Rating
                      rating={review.rating}
                      reviews={1}
                      size={16}
                      color='#ffffff'
                    />
                  </div>
                  <div style={styles.reviewMeta}>
                    <p style={styles.reviewAuthor}>{review.userEmail}</p>
                    <p style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {review.comment && (
                  <p style={styles.reviewComment}>{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
            {/* ===== Related products ===== */}
            
      <section style={styles.relatedSection}>
                <h2 style={styles.relatedTitle}>You might also like</h2>
                
        <ProductGrid products={suggested} navigate={navigate} />
      </section>
    </div>
  );
};

const styles = {
  container: {
    color: '#fff',
    width: '100%',
    overflowX: 'hidden',
  }, // ----- Hero Section -----

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
    height: 'calc(100vh - 112px - 40px)',
  },
  imageWrapper: {
    flex: 1,
    backgroundColor: '#222',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 0,
    height: '100%',
  },
  image: {
    borderRadius: 0,
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
  }, // ----- Structured Info -----

  typeBrand: {
    color: '#fff',
    fontSize: '20px',
    letterSpacing: '-0.02em',
    margin: 0,
    paddingBottom: '32px',
  },
  name: {
    fontWeight: 600,
    letterSpacing: '-0.04em',
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
    paddingBottom: '32px',
  },
  markers: {
    paddingBottom: '60px',
    color: '#4caf50',
  },
  cartRow: {
    display: 'flex',
    gap: 0,
    height: '48px',
  }, // ----- Related Section -----

  relatedSection: {
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '80px',
    backgroundColor: '#111',
    boxSizing: 'border-box',
  },
  relatedTitle: {
    marginBottom: '24px',
  },
  // ----- Reviews Section -----
  reviewsSection: {
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '80px',
    backgroundColor: '#111',
    boxSizing: 'border-box',
  },
  reviewsTitle: {
    fontSize: '2rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '32px',
    letterSpacing: '-0.02em',
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  reviewCard: {
    background: 'rgba(255,255,255,0.05)',
    padding: '24px',
    borderRadius: 0,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    gap: '20px',
  },
  reviewRating: {
    flexShrink: 0,
  },
  reviewMeta: {
    flex: 1,
    textAlign: 'right',
  },
  reviewAuthor: {
    fontSize: '0.95rem',
    fontWeight: 500,
    color: '#fff',
    margin: '0 0 4px 0',
  },
  reviewDate: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  reviewComment: {
    fontSize: '0.95rem',
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.9)',
    margin: 0,
  },
};

export default Product;
