import { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useReviews } from '../../store/ReviewsContext';
import { getPurchases } from '../../services/database';
import ReviewModal from '../../components/ui/ReviewModal';

const PurchaseHistory = ({ navigate }) => {
  const { user } = useAuth();
  const { getUserReview } = useReviews();
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadPurchaseHistory = async () => {
      try {
        const history = await getPurchases(user.id);
        // Sort by date, newest first
        history.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        setPurchaseHistory(history);
      } catch (e) {
        console.error('Error loading purchase history:', e);
        setPurchaseHistory([]);
      }
    };

    loadPurchaseHistory();
  }, [user, navigate]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleReviewClick = (e, item) => {
    e.stopPropagation(); // Prevent navigating to product page
    setSelectedProduct(item);
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedProduct(null);
  };

  if (purchaseHistory.length === 0) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Purchase History</h1>
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No purchases yet</p>
          <button
            onClick={() => navigate('/catalogue')}
            style={styles.shopButton}
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Purchase History</h1>

      <div style={styles.ordersList}>
        {purchaseHistory.map((order) => (
          <div key={order.id} style={styles.orderCard}>
            <div style={styles.orderHeader}>
              <div>
                <h2 style={styles.orderId}>Order #{order.id}</h2>
                <p style={styles.orderDate}>
                  {new Date(order.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div style={styles.orderTotal}>
                <p style={styles.totalLabel}>Total</p>
                <p style={styles.totalAmount}>${order.total.toFixed(2)}</p>
              </div>
            </div>

            <div style={styles.itemsList}>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={styles.itemCard}
                  onClick={() => handleProductClick(item.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <img
                    src={item.image || 'https://via.placeholder.com/100x100'}
                    alt={item.name}
                    style={styles.itemImage}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100';
                    }}
                  />
                  <div style={styles.itemInfo}>
                    <h3 style={styles.itemName}>{item.name}</h3>
                    <p style={styles.itemBrand}>{item.brand}</p>
                    <p style={styles.itemQuantity}>Quantity: {item.quantity}</p>
                  </div>
                  <div style={styles.itemActions}>
                    <div style={styles.itemPrice}>
                      <p style={styles.priceAmount}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleReviewClick(e, item)}
                      style={styles.reviewButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {getUserReview(item.id) ? 'Update Review' : 'Leave Review'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary with Discount */}
            <div style={styles.orderSummary}>
              {order.subtotal && order.subtotal !== order.total && (
                <div style={styles.summaryRow}>
                  <p style={styles.summaryLabel}>Subtotal:</p>
                  <p style={styles.summaryValue}>${order.subtotal.toFixed(2)}</p>
                </div>
              )}
              {order.coupon && (
                <div style={styles.summaryRow}>
                  <p style={styles.summaryLabel}>
                    Discount ({order.coupon.code}):
                  </p>
                  <p style={styles.discountValue}>
                    -${order.discount ? order.discount.toFixed(2) : '0.00'}
                  </p>
                </div>
              )}
              <div style={styles.summaryRow}>
                <p style={styles.summaryLabel}>Total:</p>
                <p style={styles.summaryValue}>${order.total.toFixed(2)}</p>
              </div>
            </div>

            {order.paymentMethod && (
              <div style={styles.paymentInfo}>
                <p style={styles.paymentText}>
                  Paid with card ending in{' '}
                  {order.paymentMethod.cardLast4 || '****'}
                </p>
              </div>
            )}
            
            {order.coupon && (
              <div style={styles.couponInfo}>
                <p style={styles.couponText}>
                  Coupon used: <strong>{order.coupon.code}</strong> ({order.coupon.discountType === 'percentage' ? `${order.coupon.discount}%` : `$${order.coupon.discount}`} off)
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {reviewModalOpen && selectedProduct && (
        <ReviewModal
          product={selectedProduct}
          isOpen={reviewModalOpen}
          onClose={handleCloseReviewModal}
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
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '60px',
    letterSpacing: '-0.04em',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
    gap: '24px',
  },
  emptyText: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  shopButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '14px 24px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },
  orderCard: {
    background: 'rgba(255,255,255,0.05)',
    padding: '32px',
    borderRadius: 0,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  orderId: {
    fontSize: '1.3rem',
    fontWeight: 500,
    color: '#fff',
    margin: '0 0 8px 0',
  },
  orderDate: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  orderTotal: {
    textAlign: 'right',
  },
  totalLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: '0 0 4px 0',
  },
  totalAmount: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  itemCard: {
    display: 'flex',
    gap: '20px',
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 0,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  itemImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: 0,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: '1.1rem',
    fontWeight: 500,
    color: '#fff',
    margin: '0 0 4px 0',
  },
  itemBrand: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: '0 0 4px 0',
  },
  itemQuantity: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
  },
  itemActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '12px',
  },
  itemPrice: {
    display: 'flex',
    alignItems: 'center',
  },
  priceAmount: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },
  reviewButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 0,
    color: '#fff',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  paymentInfo: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '0',
  },
  paymentText: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  orderSummary: {
    marginTop: '24px',
    paddingTop: '24px',
    paddingBottom: '0',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.7)',
    margin: 0,
  },
  summaryValue: {
    fontSize: '1rem',
    fontWeight: 500,
    color: '#fff',
    margin: 0,
  },
  discountValue: {
    fontSize: '1rem',
    fontWeight: 500,
    color: '#4caf50',
    margin: 0,
  },
  couponInfo: {
    marginTop: '16px',
    padding: '12px',
    background: 'rgba(76, 175, 80, 0.1)',
    border: '1px solid rgba(76, 175, 80, 0.3)',
    borderRadius: 0,
  },
  couponText: {
    fontSize: '0.9rem',
    color: '#4caf50',
    margin: 0,
  },
};

export default PurchaseHistory;
