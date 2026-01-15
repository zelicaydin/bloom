import { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useCart } from '../../store/CartContext';
import { useProducts } from '../../store/ProductsContext';
import { useNotification } from '../../store/NotificationContext';
import {
  validateCardNumber,
  validateExpiry,
  validateCVV,
  formatCardNumber,
  formatExpiry,
} from '../../utils/validation';

const Checkout = ({ navigate }) => {
  const { user, updateCardInfo } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { products } = useProducts();
  const { showNotification } = useNotification();

  // Get full product details for cart items
  const getProductDetails = (item) => {
    return products.find((p) => p.id === item.id) || item;
  };
  const [step, setStep] = useState('payment'); // 'payment' or 'success'
  const [needsCardInfo, setNeedsCardInfo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [cardErrors, setCardErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Add CSS animations for success page
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      @keyframes scaleIn {
        from {
          transform: scale(0);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    
    if (!document.head.querySelector('style[data-checkout-animations]')) {
      styleSheet.setAttribute('data-checkout-animations', 'true');
      document.head.appendChild(styleSheet);
    }

    return () => {
      // Cleanup on unmount if needed
    };
  }, []);

  useEffect(() => {
    // Check if user needs to enter card info
    if (user && !user.cardInfo) {
      setNeedsCardInfo(true);
    }
  }, [user]);

  // Redirect if not logged in or cart is empty
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
  }, [user, cartItems, navigate]);

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const newCardErrors = {};

    // Validate card fields
    if (!cardNumber) {
      newCardErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(cardNumber)) {
      newCardErrors.cardNumber = 'Invalid card number (16 digits)';
    }

    if (!expiry) {
      newCardErrors.expiry = 'Expiry date is required';
    } else {
      const expiryValidation = validateExpiry(expiry);
      if (!expiryValidation.valid) {
        newCardErrors.expiry = expiryValidation.error;
      }
    }

    if (!cvv) {
      newCardErrors.cvv = 'CVV is required';
    } else if (!validateCVV(cvv)) {
      newCardErrors.cvv = 'Invalid CVV (3 digits)';
    }

    if (!cardholderName) {
      newCardErrors.cardholderName = 'Cardholder name is required';
    }

    if (Object.keys(newCardErrors).length > 0) {
      setCardErrors(newCardErrors);
      return;
    }

    setIsProcessing(true);

    try {
      // Save card info
      const cardInfo = {
        cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces
        expiry,
        cvv,
        cardholderName,
        billingAddress: billingAddress || null,
      };

      const result = await updateCardInfo(cardInfo);

      if (result.success) {
        setNeedsCardInfo(false);
        // Proceed to payment
        handlePayment();
      } else {
        setSubmitError(result.error || 'Failed to save card information');
      }
    } catch (error) {
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear cart
      clearCart();

      // Show success notification with green checkmark
      showNotification('Checkout completed successfully!', 5000);

      // Show success page with a brief delay to ensure smooth transition
      await new Promise((resolve) => setTimeout(resolve, 300));
      setStep('success');
    } catch (error) {
      setSubmitError('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = () => {
    if (needsCardInfo) {
      // Card form will be shown, payment will be triggered after card is saved
      return;
    }
    handlePayment();
  };

  if (step === 'success') {
    return (
      <section style={styles.container}>
        <div style={styles.successContainer}>
          <div style={styles.successIcon}>✓</div>
          <h1 style={styles.successTitle}>Payment Successful!</h1>
          <p style={styles.successText}>
            Your order has been processed successfully.
          </p>
          <p style={styles.successSubtext}>
            Thank you for your purchase. You will receive a confirmation email shortly.
          </p>
          <button
            onClick={() => navigate('/')}
            style={styles.continueButton}
          >
            Continue Shopping
          </button>
        </div>
      </section>
    );
  }

  // Calculate total using product prices
  const total = cartItems.reduce((sum, item) => {
    const product = getProductDetails(item);
    const itemPrice = product.price || item.price || 0;
    return sum + itemPrice * item.quantity;
  }, 0);
  
  const hasCardInfo = user?.cardInfo;

  return (
    <section style={styles.container}>
      <h1 style={styles.title}>Checkout</h1>

      <div style={styles.content}>
        {/* Order Summary */}
        <div style={styles.summary}>
          <h2 style={styles.sectionTitle}>Order Summary</h2>
          <div style={styles.itemsList}>
            {cartItems.map((item) => {
              const product = getProductDetails(item);
              const itemPrice = product.price || item.price || 0;
              return (
                <div key={item.id} style={styles.summaryItem}>
                  <div>
                    <p style={styles.itemName}>{product.name || item.name}</p>
                    <p style={styles.itemDetails}>
                      Quantity: {item.quantity} × ${itemPrice.toFixed(2)}
                    </p>
                  </div>
                  <p style={styles.itemTotal}>
                  ${(itemPrice * item.quantity).toFixed(2)}
                </p>
                </div>
              );
            })}
          </div>
          <div style={styles.totalRow}>
            <p style={styles.totalLabel}>Total:</p>
            <p style={styles.totalAmount}>${total.toFixed(2)}</p>
          </div>
        </div>

        {/* Payment Section */}
        <div style={styles.payment}>
          {needsCardInfo ? (
            <div>
              <h2 style={styles.sectionTitle}>Payment Information</h2>
              <p style={styles.subtitle}>
                Please enter your payment information to complete your purchase.
              </p>

              {submitError && <div style={styles.errorBox}>{submitError}</div>}

              <form onSubmit={handleCardSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Card Number</label>
                  <input
                    type='text'
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder='1234 5678 9012 3456'
                    maxLength='19'
                    style={{
                      ...styles.input,
                      borderColor: cardErrors.cardNumber
                        ? '#ff4444'
                        : 'rgba(255,255,255,0.2)',
                    }}
                  />
                  {cardErrors.cardNumber && (
                    <span style={styles.errorText}>{cardErrors.cardNumber}</span>
                  )}
                </div>

                <div style={styles.row}>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Expiry Date</label>
                    <input
                      type='text'
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder='MM/YY'
                      maxLength='5'
                      style={{
                        ...styles.input,
                        borderColor: cardErrors.expiry
                          ? '#ff4444'
                          : 'rgba(255,255,255,0.2)',
                      }}
                    />
                    {cardErrors.expiry && (
                      <span style={styles.errorText}>{cardErrors.expiry}</span>
                    )}
                  </div>

                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>CVV</label>
                    <input
                      type='text'
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))
                      }
                      placeholder='123'
                      maxLength='3'
                      style={{
                        ...styles.input,
                        borderColor: cardErrors.cvv
                          ? '#ff4444'
                          : 'rgba(255,255,255,0.2)',
                      }}
                    />
                    {cardErrors.cvv && (
                      <span style={styles.errorText}>{cardErrors.cvv}</span>
                    )}
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Cardholder Name</label>
                  <input
                    type='text'
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder='John Doe'
                    style={{
                      ...styles.input,
                      borderColor: cardErrors.cardholderName
                        ? '#ff4444'
                        : 'rgba(255,255,255,0.2)',
                    }}
                  />
                  {cardErrors.cardholderName && (
                    <span style={styles.errorText}>
                      {cardErrors.cardholderName}
                    </span>
                  )}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Billing Address{' '}
                    <span style={styles.optional}>(Optional)</span>
                  </label>
                  <input
                    type='text'
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder='123 Main St, City, State, ZIP'
                    style={styles.input}
                  />
                </div>

                <button
                  type='submit'
                  disabled={isProcessing}
                  style={{
                    ...styles.submitButton,
                    opacity: isProcessing ? 0.6 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isProcessing ? 'Processing...' : 'Save & Continue'}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h2 style={styles.sectionTitle}>Payment Method</h2>
              {hasCardInfo && (
                <div style={styles.cardInfo}>
                  <p style={styles.cardText}>
                    Card ending in {hasCardInfo.cardNumber?.slice(-4) || '****'}
                  </p>
                  <p style={styles.cardText}>
                    Expires: {hasCardInfo.expiry}
                  </p>
                  <p style={styles.cardText}>
                    {hasCardInfo.cardholderName}
                  </p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                style={{
                  ...styles.submitButton,
                  opacity: isProcessing ? 0.6 : 1,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  marginTop: '32px',
                }}
              >
                {isProcessing ? 'Processing Payment...' : 'Complete Purchase'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const styles = {
  container: {
    paddingTop: '160px',
    paddingInline: '80px',
    paddingBottom: '80px',
    minHeight: '100vh',
    backgroundColor: '#141414',
    color: '#fff',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 400,
    color: '#fff',
    marginBottom: '60px',
    letterSpacing: '-0.02em',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
  },
  summary: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '32px',
    borderRadius: '8px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 500,
    marginBottom: '24px',
    letterSpacing: '-0.02em',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '24px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  itemName: {
    fontSize: '1rem',
    fontWeight: 500,
    margin: 0,
    marginBottom: '4px',
  },
  itemDetails: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  itemTotal: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: 0,
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '24px',
    borderTop: '2px solid rgba(255,255,255,0.2)',
  },
  totalLabel: {
    fontSize: '1.2rem',
    fontWeight: 500,
    margin: 0,
  },
  totalAmount: {
    fontSize: '1.8rem',
    fontWeight: 600,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  payment: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '32px',
    borderRadius: '8px',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 500,
  },
  optional: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 400,
  },
  input: {
    background: 'rgba(44, 44, 44, 1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '14px 16px',
    fontSize: '1rem',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  errorText: {
    fontSize: '0.85rem',
    color: '#ff4444',
    marginTop: '-4px',
  },
  errorBox: {
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid #ff4444',
    padding: '12px 16px',
    color: '#ff4444',
    fontSize: '0.9rem',
    marginBottom: '24px',
  },
  submitButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '14px 24px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  cardInfo: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  cardText: {
    fontSize: '1rem',
    margin: '4px 0',
    color: 'rgba(255,255,255,0.8)',
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    animation: 'fadeIn 0.5s ease-in',
  },
  successIcon: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: '#4caf50',
    color: '#fff',
    fontSize: '4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
    animation: 'scaleIn 0.5s ease-out',
    boxShadow: '0 0 30px rgba(76, 175, 80, 0.5)',
  },
  successTitle: {
    fontSize: '3rem',
    fontWeight: 600,
    marginBottom: '16px',
    letterSpacing: '-0.02em',
    animation: 'slideUp 0.6s ease-out 0.2s both',
  },
  successText: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '12px',
    animation: 'slideUp 0.6s ease-out 0.3s both',
  },
  successSubtext: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '40px',
    animation: 'slideUp 0.6s ease-out 0.4s both',
  },
  continueButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '16px 40px',
    fontSize: '1.1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'transform 0.2s, opacity 0.2s',
    animation: 'slideUp 0.6s ease-out 0.5s both',
  },
};

export default Checkout;
