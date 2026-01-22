import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../store/AuthContext';
import { hashPasswordAsync } from '../../utils/hash';
import { validatePassword, validateCardNumber, validateExpiry, validateCVV } from '../../utils/validation';
import { updateUser as dbUpdateUser, getUsers, getUserCoupons } from '../../services/database';

const ProfileDropdown = ({ user, onClose, navigate }) => {
  const { logout, updateCardInfo } = useAuth();
  const [activeSection, setActiveSection] = useState('main'); // 'main', 'changePassword', 'addCard', 'removeCard'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Sustainability score and breakdown
  const [sustainabilityScore, setSustainabilityScore] = useState(0);
  const [sustainabilityBreakdown, setSustainabilityBreakdown] = useState({
    sustainablePackaging: 0,
    organicIngredients: 0,
    recyclable: 0,
    crueltyFree: 0,
    totalItems: 0,
  });

  // Handle sign out
  const handleSignOut = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('handleSignOut called'); // Debug
    
    // Get user ID before clearing anything
    const userId = user?.id;
    console.log('User ID:', userId); // Debug
    
    // Close dropdown immediately
    if (onClose) {
      onClose();
    }
    
    // Clear all user-related localStorage synchronously FIRST
    try {
      localStorage.removeItem('bloom_user');
      localStorage.removeItem('bloom_remember_me');
      console.log('Cleared bloom_user and bloom_remember_me'); // Debug
      
      // Clear cart data if user exists
      if (userId) {
        localStorage.removeItem(`bloom_cart_${userId}`);
        localStorage.removeItem(`bloom_subscription_${userId}`);
        localStorage.removeItem(`bloom_purchase_history_${userId}`);
        localStorage.removeItem(`bloom_preferences_${userId}`);
        console.log('Cleared user-specific data'); // Debug
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    
    // Clear user state via logout function
    try {
      if (logout && typeof logout === 'function') {
        console.log('Calling logout function'); // Debug
        logout();
        console.log('Logout function called'); // Debug
      } else {
        console.error('logout is not a function:', typeof logout); // Debug
      }
    } catch (error) {
      console.error('Error calling logout:', error);
    }
    
    // Navigate to home page
    if (navigate && typeof navigate === 'function') {
      navigate('/');
    }
    
    // Force reload after ensuring everything is cleared
    setTimeout(() => {
      console.log('Reloading page now'); // Debug
      window.location.href = '/';
    }, 300);
  };
  
  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Add card state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [cardErrors, setCardErrors] = useState({});
  
  // Coupon state
  const [userCoupons, setUserCoupons] = useState([]);
  
  const dropdownRef = useRef(null);
  

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return 'No card on file';
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length === 16) {
      return `**** **** **** ${cleaned.slice(-4)}`;
    }
    return cardNumber;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    // Validate current password
    const users = await getUsers();
    const userData = users.find((u) => u.id === user.id);
    
    if (!userData) {
      setPasswordError('User not found');
      return;
    }

    const hashedCurrent = await hashPasswordAsync(currentPassword);
    if (userData.password !== hashedCurrent) {
      setPasswordError('Current password is incorrect');
      return;
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.error);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Update password in database
    const hashedNew = await hashPasswordAsync(newPassword);
    await dbUpdateUser(user.id, { password: hashedNew });

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setTimeout(() => {
      setActiveSection('main');
      setPasswordSuccess(false);
    }, 2000);
  };
  
  // Load user coupons
  useEffect(() => {
    if (!user) return;
    
    const loadCoupons = async () => {
      try {
        const coupons = await getUserCoupons(user.id);
        setUserCoupons(coupons);
      } catch (e) {
        console.error('Error loading coupons:', e);
        setUserCoupons([]);
      }
    };
    
    loadCoupons();
  }, [user]);

  // Calculate sustainability score
  useEffect(() => {
    if (!user) return;
    
    const calculateSustainabilityScore = () => {
      const purchaseHistoryKey = `bloom_purchase_history_${user.id}`;
      const stored = localStorage.getItem(purchaseHistoryKey);
      if (!stored) {
        setSustainabilityScore(0);
        return;
      }
      
      try {
        const history = JSON.parse(stored);
        const products = JSON.parse(localStorage.getItem('bloom_products') || '[]');
        const breakdown = {
          sustainablePackaging: 0,
          organicIngredients: 0,
          recyclable: 0,
          crueltyFree: 0,
          totalItems: 0,
        };
        
        history.forEach((order) => {
          order.items.forEach((item) => {
            breakdown.totalItems += item.quantity;
            const product = products.find((p) => p.id === item.id);
            if (product && product.markers) {
              // Count each marker type across all purchased items
              product.markers.forEach((marker) => {
                if (marker === 'sustainablePackaging') {
                  breakdown.sustainablePackaging += item.quantity;
                } else if (marker === 'organicIngredients') {
                  breakdown.organicIngredients += item.quantity;
                } else if (marker === 'recyclable') {
                  breakdown.recyclable += item.quantity;
                } else if (marker === 'crueltyFree') {
                  breakdown.crueltyFree += item.quantity;
                }
              });
            }
          });
        });
        
        // Calculate score: percentage of items that have each marker
        // Each marker type contributes 25% to the total score
        // Score = average of (marker count / total items) for each marker type * 100
        const markerScores = [
          breakdown.sustainablePackaging / Math.max(breakdown.totalItems, 1),
          breakdown.organicIngredients / Math.max(breakdown.totalItems, 1),
          breakdown.recyclable / Math.max(breakdown.totalItems, 1),
          breakdown.crueltyFree / Math.max(breakdown.totalItems, 1),
        ];
        const avgScore = markerScores.reduce((sum, score) => sum + score, 0) / 4;
        const score = Math.min(100, Math.round(avgScore * 100));
        
        setSustainabilityScore(score);
        setSustainabilityBreakdown(breakdown);
      } catch (e) {
        console.error('Error calculating sustainability score:', e);
        setSustainabilityScore(0);
        setSustainabilityBreakdown({
          sustainablePackaging: 0,
          organicIngredients: 0,
          recyclable: 0,
          crueltyFree: 0,
          totalItems: 0,
        });
      }
    };
    
    calculateSustainabilityScore();
  }, [user]);
  
  const handleAddCard = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCardErrors({});

    const newCardErrors = {};
    if (!cardNumber || !validateCardNumber(cardNumber)) {
      newCardErrors.cardNumber = 'Invalid card number (16 digits)';
    }
    const expiryValidation = validateExpiry(expiry);
    if (!expiry || !expiryValidation.valid) {
      newCardErrors.expiry = expiryValidation.error || 'Invalid format. Use MM/YY';
    }
    if (!cvv || !validateCVV(cvv)) {
      newCardErrors.cvv = 'Invalid CVV (3 digits)';
    }
    if (!cardholderName) {
      newCardErrors.cardholderName = 'Cardholder name is required';
    }

    if (Object.keys(newCardErrors).length > 0) {
      setCardErrors(newCardErrors);
      return;
    }

    const cardInfo = {
      cardNumber: cardNumber.replace(/\s/g, ''),
      expiry,
      cvv,
      cardholderName,
      billingAddress: billingAddress || null,
    };

    try {
      const result = await updateCardInfo(cardInfo);
      if (result && result.success) {
        setActiveSection('main');
        setCardNumber('');
        setExpiry('');
        setCvv('');
        setCardholderName('');
        setBillingAddress('');
      } else {
        setCardErrors({ submit: result?.error || 'Failed to add card' });
      }
    } catch (error) {
      setCardErrors({ submit: 'An error occurred. Please try again.' });
    }
  };

  const handleRemoveCard = () => {
    updateCardInfo(null);
    setActiveSection('main');
  };

  const handleDeleteAccount = () => {
    const users = JSON.parse(localStorage.getItem('bloom_users') || '[]');
    const filteredUsers = users.filter((u) => u.id !== user.id);
    localStorage.setItem('bloom_users', JSON.stringify(filteredUsers));
    localStorage.removeItem('bloom_user');
    logout();
    navigate('/');
    onClose();
  };

  if (activeSection === 'changePassword') {
    return (
      <div ref={dropdownRef} style={styles.dropdown}>
        <div style={styles.header}>
          <button
            onClick={() => setActiveSection('main')}
            style={styles.backButton}
          >
            ← Back
          </button>
          <h3 style={styles.title}>Change Password</h3>
        </div>
        <form onSubmit={handleChangePassword} style={styles.form}>
          {passwordError && (
            <div style={styles.errorBox}>{passwordError}</div>
          )}
          {passwordSuccess && (
            <div style={styles.successBox}>Password changed successfully!</div>
          )}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
              placeholder="8+ chars, starts uppercase, has punctuation"
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.submitButton}>
            Change Password
          </button>
        </form>
      </div>
    );
  }

  if (activeSection === 'addCard') {
    return (
      <div ref={dropdownRef} style={styles.dropdown}>
        <div style={styles.header}>
          <button
            onClick={() => setActiveSection('main')}
            style={styles.backButton}
          >
            ← Back
          </button>
          <h3 style={styles.title}>Add Payment Card</h3>
        </div>
        <form onSubmit={handleAddCard} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              style={{
                ...styles.input,
                borderColor: cardErrors.cardNumber ? '#ff4444' : 'rgba(255,255,255,0.2)',
              }}
            />
            {cardErrors.cardNumber && (
              <span style={styles.errorText}>{cardErrors.cardNumber}</span>
            )}
          </div>
          <div style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: '1 1 0', minWidth: 0 }}>
              <label style={styles.label}>Expiry</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength="5"
                style={{
                  ...styles.input,
                  width: '100%',
                  boxSizing: 'border-box',
                  borderColor: cardErrors.expiry ? '#ff4444' : 'rgba(255,255,255,0.2)',
                }}
              />
              {cardErrors.expiry && (
                <span style={styles.errorText}>{cardErrors.expiry}</span>
              )}
            </div>
            <div style={{ ...styles.inputGroup, flex: '1 1 0', minWidth: 0 }}>
              <label style={styles.label}>CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="123"
                maxLength="3"
                style={{
                  ...styles.input,
                  width: '100%',
                  boxSizing: 'border-box',
                  borderColor: cardErrors.cvv ? '#ff4444' : 'rgba(255,255,255,0.2)',
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
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="John Doe"
              style={{
                ...styles.input,
                borderColor: cardErrors.cardholderName ? '#ff4444' : 'rgba(255,255,255,0.2)',
              }}
            />
            {cardErrors.cardholderName && (
              <span style={styles.errorText}>{cardErrors.cardholderName}</span>
            )}
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Billing Address <span style={styles.optional}>(Optional)</span>
            </label>
            <input
              type="text"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder="123 Main St, City, State, ZIP"
              style={styles.input}
            />
          </div>
          {cardErrors.submit && (
            <div style={styles.errorBox}>{cardErrors.submit}</div>
          )}
          <button type="submit" style={styles.submitButton}>
            Add Card
          </button>
        </form>
      </div>
    );
  }

  if (activeSection === 'removeCard') {
    return (
      <div ref={dropdownRef} style={styles.dropdown}>
        <div style={styles.header}>
          <button
            onClick={() => setActiveSection('main')}
            style={styles.backButton}
          >
            ← Back
          </button>
          <h3 style={styles.title}>Remove Payment Card</h3>
        </div>
        <div style={styles.confirmSection}>
          <p style={styles.confirmText}>
            Are you sure you want to remove your payment card?
          </p>
          <div style={styles.buttonRow}>
            <button
              onClick={() => setActiveSection('main')}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              onClick={handleRemoveCard}
              style={styles.dangerButton}
            >
              Remove Card
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} style={styles.dropdown}>
      <div style={styles.userInfo}>
        <img src={user.photo} alt="Profile" style={styles.userPhoto} />
        <div>
          {user.name && user.surname ? (
            <p style={styles.userName}>{user.name} {user.surname}</p>
          ) : null}
          <p style={styles.userEmail}>{user.email}</p>
          <p style={styles.userSince}>
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Sustainability Score - Redesigned with Statistics */}
      <div style={styles.sustainabilitySection}>
        <p style={styles.sectionTitle}>Sustainability Score</p>
        {sustainabilityBreakdown.totalItems > 0 ? (
          <>
            <div style={styles.scoreDisplay}>
              <div style={styles.scoreText}>
                <span style={styles.scoreValue}>{sustainabilityScore}</span>
                <span style={styles.scorePercent}>%</span>
              </div>
              <div style={styles.statsSummary}>
                <p style={styles.totalItems}>{sustainabilityBreakdown.totalItems} items purchased</p>
                <p style={styles.scoreLabel}>Overall sustainability</p>
              </div>
            </div>
            
            <div style={styles.markersStats}>
              {[
                { key: 'sustainablePackaging', label: 'Sustainable Packaging', color: '#4caf50' },
                { key: 'organicIngredients', label: 'Organic Ingredients', color: '#81c784' },
                { key: 'recyclable', label: 'Recyclable', color: '#66bb6a' },
                { key: 'crueltyFree', label: 'Cruelty Free', color: '#a5d6a7' },
              ].map((marker) => {
                const count = sustainabilityBreakdown[marker.key];
                const percentage = Math.round((count / sustainabilityBreakdown.totalItems) * 100);
                const barWidth = percentage;
                
                return (
                  <div key={marker.key} style={styles.markerStat}>
                    <div style={styles.markerHeader}>
                      <span style={styles.markerLabel}>{marker.label}</span>
                      <span style={styles.markerCount}>{count}/{sustainabilityBreakdown.totalItems}</span>
                    </div>
                    <div style={styles.progressBarContainer}>
                      <div 
                        style={{
                          ...styles.progressBar,
                          width: `${barWidth}%`,
                          backgroundColor: marker.color,
                        }}
                      />
                    </div>
                    <span style={styles.markerPercentage}>{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No purchases yet</p>
            <p style={styles.emptySubtext}>Start shopping to build your sustainability score</p>
          </div>
        )}
      </div>

      <div style={styles.divider} />

      {/* Coupons Section */}
      <div style={styles.menuSection}>
        <p style={styles.sectionTitle}>Coupons</p>
        {userCoupons.length > 0 ? (
          <div style={styles.couponsList}>
            {userCoupons.map((coupon) => (
              <div key={coupon.id} style={styles.couponItem}>
                <div style={styles.couponInfo}>
                  <p style={styles.couponCode}>{coupon.code}</p>
                  <p style={styles.couponDiscount}>
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discount}% off`
                      : `$${coupon.discount} off`}
                  </p>
                </div>
                {coupon.expiresAt && (
                  <p style={styles.couponExpiry}>
                    Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.noCoupons}>No active coupons</p>
        )}
      </div>

      <div style={styles.divider} />

      <div style={styles.menu}>
        <div style={styles.menuSection}>
          <p style={styles.sectionTitle}>Payment</p>
          {user.cardInfo ? (
            <>
              <div style={styles.cardInfo}>
                <p style={styles.cardNumber}>{maskCardNumber(user.cardInfo.cardNumber)}</p>
                <p style={styles.cardDetails}>
                  {user.cardInfo.cardholderName} • Expires {user.cardInfo.expiry}
                </p>
              </div>
              <button
                onClick={() => setActiveSection('removeCard')}
                style={styles.menuItem}
              >
                Remove Card
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveSection('addCard');
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              style={styles.menuItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderRadius = '0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderRadius = '0';
              }}
            >
              Add Payment Card
            </button>
          )}
        </div>

        <div style={styles.divider} />

        <div style={styles.menuSection}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClose) {
                onClose();
              }
              if (navigate) {
                navigate('/purchase-history');
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            style={styles.menuItem}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Purchase History
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClose) {
                onClose();
              }
              if (navigate) {
                navigate('/profile/edit');
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            style={styles.menuItem}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Edit Profile
          </button>
        </div>

        <div style={styles.divider} />

        <div style={styles.menuSection}>
          <button
            onClick={() => setActiveSection('changePassword')}
            style={styles.menuItem}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Change Password
          </button>
        </div>

        <div style={styles.divider} />

        <div style={styles.menuSection}>
          <button
            type="button"
            onClick={handleSignOut}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            style={styles.menuItem}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Sign Out
          </button>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ ...styles.menuItem, ...styles.dangerItem }}
            >
              Delete Account
            </button>
          ) : (
            <div style={styles.deleteConfirm}>
              <p style={styles.deleteText}>Are you sure? This cannot be undone.</p>
              <div style={styles.buttonRow}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  style={styles.dangerButton}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  dropdown: {
    position: 'relative',
    width: '360px',
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    zIndex: 1001,
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  backButton: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '4px 8px',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 500,
    color: '#fff',
    margin: 0,
  },
  userInfo: {
    display: 'flex',
    gap: '16px',
    padding: '20px',
    alignItems: 'center',
  },
  userPhoto: {
    width: '56px',
    height: '56px',
    objectFit: 'cover',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '50%',
  },
  userName: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 500,
    color: '#fff',
    marginBottom: '4px',
  },
  userEmail: {
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.7)',
  },
  userSince: {
    margin: '4px 0 0 0',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
    margin: '0',
  },
  menu: {
    padding: '8px 0',
  },
  menuSection: {
    padding: '8px 0',
  },
  sectionTitle: {
    padding: '8px 20px',
    paddingBottom: '16px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
  },
  cardInfo: {
    padding: '12px 20px',
    background: 'rgba(255,255,255,0.05)',
    margin: '0 20px 8px 20px',
  },
  cardNumber: {
    margin: '0 0 4px 0',
    fontSize: '0.9rem',
    color: '#fff',
    fontWeight: 500,
  },
  cardDetails: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
  },
  menuItem: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    textAlign: 'left',
    padding: '12px 20px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
    borderRadius: 0,
  },
  dangerItem: {
    color: '#ff4444',
  },
  form: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.85rem',
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
    padding: '10px 12px',
    fontSize: '0.9rem',
    color: '#fff',
    outline: 'none',
    borderRadius: 0,
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ff4444',
  },
  errorBox: {
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid #ff4444',
    padding: '10px 12px',
    color: '#ff4444',
    fontSize: '0.85rem',
  },
  successBox: {
    background: 'rgba(76, 175, 80, 0.1)',
    border: '1px solid #4caf50',
    padding: '10px 12px',
    color: '#4caf50',
    fontSize: '0.85rem',
  },
  submitButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '12px 20px',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '8px',
    borderRadius: 0,
  },
  confirmSection: {
    padding: '20px',
  },
  confirmText: {
    margin: '0 0 20px 0',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.95rem',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
  },
  cancelButton: {
    flex: 1,
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '10px 20px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: 0,
  },
  dangerButton: {
    flex: 1,
    background: '#ff4444',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: 0,
  },
  deleteConfirm: {
    padding: '12px 20px',
  },
  deleteText: {
    margin: '0 0 12px 0',
    color: '#ff4444',
    fontSize: '0.9rem',
  },
  sustainabilitySection: {
    padding: '8px 0',
  },
  scoreDisplay: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px',
    alignItems: 'flex-start',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  scoreText: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  scoreValue: {
    fontSize: '2rem',
    fontWeight: 600,
    color: '#4caf50',
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  scorePercent: {
    fontSize: '1.2rem',
    fontWeight: 500,
    color: 'rgba(76, 175, 80, 0.7)',
    lineHeight: 1,
  },
  statsSummary: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
  },
  totalItems: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
    fontWeight: 500,
  },
  scoreLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  markersStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  markerStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  markerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markerLabel: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 500,
  },
  markerCount: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
  },
  progressBarContainer: {
    width: '100%',
    height: '6px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: 0,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: 0,
  },
  markerPercentage: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.5)',
    alignSelf: 'flex-end',
  },
  emptyState: {
    textAlign: 'left',
    padding: '20px',
  },
  emptyText: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: '0 0 4px 0',
  },
  emptySubtext: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    margin: 0,
  },
  couponsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  couponItem: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '12px',
    borderRadius: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  couponInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  couponCode: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
    letterSpacing: '0.05em',
  },
  couponDiscount: {
    fontSize: '0.85rem',
    color: '#4caf50',
    margin: 0,
    fontWeight: 500,
  },
  couponExpiry: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
  },
  noCoupons: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.5)',
    paddingLeft: '20px',
    paddingRight: '20px',
    margin: 0,
  },
};

export default ProfileDropdown;
