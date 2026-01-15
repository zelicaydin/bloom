import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../store/AuthContext';
import { hashPasswordAsync } from '../../utils/hash';
import { validatePassword, validateCardNumber, validateExpiry, validateCVV } from '../../utils/validation';

const ProfileDropdown = ({ user, onClose, navigate }) => {
  const { logout, updateCardInfo } = useAuth();
  const [activeSection, setActiveSection] = useState('main'); // 'main', 'changePassword', 'addCard', 'removeCard'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
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
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

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
    const users = JSON.parse(localStorage.getItem('bloom_users') || '[]');
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

    // Update password
    const hashedNew = await hashPasswordAsync(newPassword);
    userData.password = hashedNew;
    localStorage.setItem('bloom_users', JSON.stringify(users));

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setTimeout(() => {
      setActiveSection('main');
      setPasswordSuccess(false);
    }, 2000);
  };

  const handleAddCard = (e) => {
    e.preventDefault();
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

    const result = updateCardInfo(cardInfo);
    if (result.success) {
      setActiveSection('main');
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setCardholderName('');
      setBillingAddress('');
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
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Expiry</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength="5"
                style={{
                  ...styles.input,
                  borderColor: cardErrors.expiry ? '#ff4444' : 'rgba(255,255,255,0.2)',
                }}
              />
              {cardErrors.expiry && (
                <span style={styles.errorText}>{cardErrors.expiry}</span>
              )}
            </div>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="123"
                maxLength="3"
                style={{
                  ...styles.input,
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
          <p style={styles.userEmail}>{user.email}</p>
          <p style={styles.userSince}>
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
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
              onClick={() => setActiveSection('addCard')}
              style={styles.menuItem}
            >
              Add Payment Card
            </button>
          )}
        </div>

        <div style={styles.divider} />

        <div style={styles.menuSection}>
          <button
            onClick={() => setActiveSection('changePassword')}
            style={styles.menuItem}
          >
            Change Password
          </button>
        </div>

        <div style={styles.divider} />

        <div style={styles.menuSection}>
          <button
            onClick={() => {
              logout();
              navigate('/');
              onClose();
            }}
            style={styles.menuItem}
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
    position: 'absolute',
    top: 'calc(100% + 16px)',
    right: '0',
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
  userEmail: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 500,
    color: '#fff',
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
  },
  dangerButton: {
    flex: 1,
    background: '#ff4444',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  deleteConfirm: {
    padding: '12px 20px',
  },
  deleteText: {
    margin: '0 0 12px 0',
    color: '#ff4444',
    fontSize: '0.9rem',
  },
};

export default ProfileDropdown;
