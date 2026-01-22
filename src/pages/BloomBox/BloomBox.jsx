import { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useSubscription } from '../../store/SubscriptionContext';
import { useCart } from '../../store/CartContext';
import { useProducts } from '../../store/ProductsContext';
import PreferenceQuiz from '../../components/bloom-box/PreferenceQuiz';
import BoxPreviewModal from '../../components/bloom-box/BoxPreviewModal';
import BloomBoxStatus from '../../components/bloom-box/BloomBoxStatus';
import SwapModal from '../../components/bloom-box/SwapModal';

const BloomBox = ({ navigate }) => {
  const { user } = useAuth();
  const { 
    subscription, 
    preferences, 
    getRecommendations, 
    subscribe, 
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    clearQuizRetakeFlag 
  } = useSubscription();
  const { addToCart } = useCart();
  const { products } = useProducts();
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [showBoxPreview, setShowBoxPreview] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [productToSwap, setProductToSwap] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Show quiz if no subscription, cancelled subscription, or needs retake
    if (!subscription || subscription.status === 'cancelled' || (subscription.needsQuizRetake === true)) {
      setShowQuiz(true);
    } else if (subscription && subscription.status === 'active') {
      setShowQuiz(false);
      // Load recommendations
      const recommendations = getRecommendations(4);
      setRecommendedProducts(recommendations);
    } else if (subscription && subscription.status === 'paused') {
      setShowQuiz(false);
      // Load recommendations even if paused
      const recommendations = getRecommendations(4);
      setRecommendedProducts(recommendations);
    }
  }, [user, subscription, getRecommendations, navigate]);

  const handleQuizComplete = (quizPreferences) => {
    // Subscribe - this creates a new subscription with needsQuizRetake: false
    const result = subscribe(quizPreferences);
    if (result.success) {
      // Load recommendations
      const recommendations = getRecommendations(4);
      setRecommendedProducts(recommendations);
      // Show box preview modal
      setShowBoxPreview(true);
      setShowQuiz(false);
    }
  };

  const handleBoxPreviewAccept = () => {
    // Add all products to cart
    recommendedProducts.forEach((product) => {
      addToCart(product, 1);
    });
    // Close modal and navigate to checkout
    setShowBoxPreview(false);
    navigate('/checkout');
  };

  const handleBoxPreviewEdit = () => {
    // Keep modal open, allow swapping
    // The swap functionality is already in BoxPreviewModal
  };

  const handleBoxPreviewSwap = (oldProductId, newProduct) => {
    setRecommendedProducts((prev) =>
      prev.map((p) => (p.id === oldProductId ? newProduct : p))
    );
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      cancelSubscription();
      setShowQuiz(true);
    }
  };

  const handleRedoQuiz = () => {
    if (subscription) {
      const updatedSubscription = {
        ...subscription,
        needsQuizRetake: true,
      };
      // Update subscription to trigger quiz
      localStorage.setItem(`bloom_subscription_${user.id}`, JSON.stringify(updatedSubscription));
      setShowQuiz(true);
    }
  };

  const handlePause = () => {
    if (window.confirm('Pause your subscription? You can resume anytime.')) {
      pauseSubscription();
    }
  };

  const handleResume = () => {
    resumeSubscription();
  };

  const handleSwapClick = (product) => {
    setProductToSwap(product);
    setShowSwapModal(true);
  };

  const handleSwapSelect = (newProduct) => {
    if (productToSwap) {
      setRecommendedProducts((prev) =>
        prev.map((p) => (p.id === productToSwap.id ? newProduct : p))
      );
      setProductToSwap(null);
      setShowSwapModal(false);
    }
  };

  const handleAcceptBox = () => {
    // Add all products to cart
    recommendedProducts.forEach((product) => {
      addToCart(product, 1);
    });
    // Navigate directly to checkout
    navigate('/checkout');
  };

  if (showQuiz) {
    return (
      <PreferenceQuiz
        onComplete={handleQuizComplete}
        onCancel={() => navigate('/')}
      />
    );
  }

  if (!subscription || subscription.status === 'cancelled') {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>BloomBox</h1>
        <p style={styles.text}>Please complete the quiz to get started.</p>
      </div>
    );
  }

  const isPaused = subscription.status === 'paused';
  const isActive = subscription.status === 'active';

  return (
    <div style={styles.container}>
      {/* Title */}
      <h1 style={styles.title}>BloomBox</h1>

      {/* Description */}
      <p style={styles.description}>
        Your personalized monthly beauty box, curated based on your preferences. 
        Discover sustainable, high-quality products tailored just for you.
      </p>

      {/* Status Component */}
      <BloomBoxStatus
        subscription={subscription}
        onCancel={handleCancelSubscription}
        onRedoQuiz={handleRedoQuiz}
        onPause={handlePause}
        onResume={handleResume}
      />

      {/* Your Next BloomBox Section */}
      <div style={styles.nextBoxSection}>
        <h2 style={styles.sectionTitle}>Your Next BloomBox</h2>
        
        {subscription.nextBoxDate && isActive && (
          <p style={styles.scheduledDate}>
            Scheduled for: {new Date(subscription.nextBoxDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}

        {isPaused && (
          <p style={styles.statusMessage}>
            Your subscription is currently paused. Resume to receive your next box.
          </p>
        )}

        {subscription.status === 'cancelled' && (
          <p style={styles.statusMessage}>
            Your subscription has been cancelled. Complete the quiz to start a new subscription.
          </p>
        )}

        {/* Product Cards */}
        {recommendedProducts.length > 0 && (
          <div style={styles.productsGrid}>
            {recommendedProducts.map((product) => (
              <div key={product.id} style={styles.productCard}>
                <div style={styles.imageWrapper}>
                  <img
                    src={product.image || 'https://via.placeholder.com/300x400'}
                    alt={product.name}
                    style={styles.productImage}
                  />
                </div>
                <div style={styles.productInfo}>
                  <p style={styles.productTypeBrand}>
                    {product.type} • {product.brand}
                  </p>
                  <h3 style={styles.productName}>{product.name}</h3>
                  <p style={styles.productPrice}>${product.price}</p>
                </div>
                <button
                  onClick={() => handleSwapClick(product)}
                  style={styles.swapButton}
                >
                  Swap
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Accept Box Button */}
        {isActive && recommendedProducts.length > 0 && (
          <div style={styles.acceptSection}>
            <button onClick={handleAcceptBox} style={styles.acceptButton}>
              Accept Box & Checkout
            </button>
          </div>
        )}
      </div>

      {/* Box Preview Modal (shown after quiz) */}
      {showBoxPreview && (
        <BoxPreviewModal
          products={recommendedProducts}
          onAccept={handleBoxPreviewAccept}
          onEdit={handleBoxPreviewEdit}
          onClose={() => setShowBoxPreview(false)}
          onSwap={handleBoxPreviewSwap}
        />
      )}

      {/* Swap Modal */}
      {showSwapModal && productToSwap && (
        <SwapModal
          currentProduct={productToSwap}
          onSelect={handleSwapSelect}
          onClose={() => {
            setShowSwapModal(false);
            setProductToSwap(null);
          }}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    paddingTop: '160px',
    paddingInline: '80px',
    paddingBottom: '80px',
    backgroundColor: '#141414',
    color: '#fff',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 600,
    color: '#fff',
    margin: '0 0 16px 0',
    letterSpacing: '-0.04em',
  },
  description: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '40px',
    lineHeight: 1.6,
    maxWidth: '800px',
  },
  nextBoxSection: {
    marginTop: '40px',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: 500,
    color: '#fff',
    margin: '0 0 24px 0',
    letterSpacing: '-0.02em',
  },
  scheduledDate: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '32px',
  },
  statusMessage: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '32px',
    padding: '16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '32px',
    marginBottom: '40px',
  },
  productCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  imageWrapper: {
    width: '100%',
    height: '330px',
    overflow: 'hidden',
    background: '#1a1a1a',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 0,
  },
  productInfo: {
    padding: '20px',
  },
  productTypeBrand: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    margin: '0 0 8px 0',
    textTransform: 'capitalize',
  },
  productName: {
    fontSize: '1.1rem',
    fontWeight: 500,
    color: '#fff',
    margin: '0 0 8px 0',
  },
  productPrice: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
    fontWeight: 500,
  },
  swapButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '8px 16px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    borderRadius: 0,
  },
  acceptSection: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '40px',
  },
  acceptButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '14px 32px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
  },
  text: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.8)',
  },
};

export default BloomBox;
