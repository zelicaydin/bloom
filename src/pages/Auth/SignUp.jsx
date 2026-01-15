import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../store/AuthContext';
import {
  validateEmail,
  validatePassword,
  validateCardNumber,
  validateExpiry,
  validateCVV,
  formatCardNumber,
  formatExpiry,
} from '../../utils/validation';
import { hashPasswordAsync } from '../../utils/hash';
import RememberMeModal from '../../components/ui/RememberMeModal';

const SignUp = ({ navigate }) => {
  const { signUp, setRememberMe } = useAuth();
  const [step, setStep] = useState(1);

  // Step 1: Account creation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Step 2: Card information (optional)
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [cardErrors, setCardErrors] = useState({});
  const [showRememberModal, setShowRememberModal] = useState(false);
  const fileInputRef = useRef(null);

  // Clear errors when user types
  useEffect(() => {
    if (errors.email && email) setErrors((prev) => ({ ...prev, email: '' }));
    if (errors.password && password)
      setErrors((prev) => ({ ...prev, password: '' }));
    if (errors.confirmPassword && confirmPassword)
      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
    if (errors.photo && photo) setErrors((prev) => ({ ...prev, photo: '' }));
    if (submitError) setSubmitError('');
  }, [email, password, confirmPassword, photo]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        photo: 'Please select an image file',
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        photo: 'Image must be less than 5MB',
      }));
      return;
    }

    setPhoto(file);
    setErrors((prev) => ({ ...prev, photo: '' }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const newErrors = {};

    // Validate email
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.error;
      }
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Validate photo (mandatory)
    if (!photo) {
      newErrors.photo = 'Profile photo is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Move to step 2
    setStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setCardErrors({});

    // If user filled any card field, validate all required fields
    const hasAnyCardData =
      cardNumber || expiry || cvv || cardholderName || billingAddress;

    if (hasAnyCardData) {
      const newCardErrors = {};

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
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Convert photo to base64 for storage
      const photoBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(photo);
      });

      // Hash password
      const hashedPassword = await hashPasswordAsync(password);

      // Prepare card info (if provided)
      const cardInfo = hasAnyCardData
        ? {
            cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces
            expiry,
            cvv,
            cardholderName,
            billingAddress: billingAddress || null,
          }
        : null;

      // Create account
      const result = await signUp(email, hashedPassword, photoBase64, cardInfo);

      if (result.success) {
        setShowRememberModal(true);
      } else {
        setSubmitError(result.error || 'Sign up failed');
        setStep(1); // Go back to step 1 to show error
      }
    } catch (error) {
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipCard = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Convert photo to base64
      const photoBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(photo);
      });

      // Hash password
      const hashedPassword = await hashPasswordAsync(password);

      // Create account without card info
      const result = await signUp(email, hashedPassword, photoBase64, null);

      if (result.success) {
        setShowRememberModal(true);
      } else {
        setSubmitError(result.error || 'Sign up failed');
        setStep(1);
      }
    } catch (error) {
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showRememberModal && (
        <RememberMeModal
          onRemember={() => {
            setRememberMe(true);
            navigate('/');
          }}
          onDontRemember={() => {
            setRememberMe(false);
            navigate('/');
          }}
        />
      )}
      <section style={styles.container}>
        <div style={styles.formWrapper}>
          <h1 style={styles.title}>Sign Up</h1>
          <p style={styles.subtitle}>
            {step === 1
              ? 'Create your Bloom account'
              : 'Add payment information (optional)'}
          </p>
          {step === 2 && (
            <p style={styles.optionalNote}>
              You can skip this step and add payment information later.
            </p>
          )}

          {submitError && <div style={styles.errorBox}>{submitError}</div>}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='your.email@example.com'
                  style={{
                    ...styles.input,
                    borderColor: errors.email
                      ? '#ff4444'
                      : 'rgba(255,255,255,0.2)',
                  }}
                />
                {errors.email && (
                  <span style={styles.errorText}>{errors.email}</span>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Password (8+ chars, starts uppercase, has punctuation)'
                    style={{
                      ...styles.input,
                      width: '100%',
                      paddingRight: '48px',
                      borderColor: errors.password
                        ? '#ff4444'
                        : 'rgba(255,255,255,0.2)',
                    }}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                    onMouseEnter={(e) =>
                      (e.target.style.color = 'rgba(255,255,255,0.9)')
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = 'rgba(255,255,255,0.6)')
                    }
                  >
                    {showPassword ? (
                      <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
                        <line x1='1' y1='1' x2='23' y2='23' />
                      </svg>
                    ) : (
                      <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                        <circle cx='12' cy='12' r='3' />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span style={styles.errorText}>{errors.password}</span>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Confirm your password'
                    style={{
                      ...styles.input,
                      width: '100%',
                      paddingRight: '48px',
                      borderColor: errors.confirmPassword
                        ? '#ff4444'
                        : 'rgba(255,255,255,0.2)',
                    }}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.passwordToggle}
                    onMouseEnter={(e) =>
                      (e.target.style.color = 'rgba(255,255,255,0.9)')
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = 'rgba(255,255,255,0.6)')
                    }
                  >
                    {showConfirmPassword ? (
                      <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
                        <line x1='1' y1='1' x2='23' y2='23' />
                      </svg>
                    ) : (
                      <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                        <circle cx='12' cy='12' r='3' />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span style={styles.errorText}>{errors.confirmPassword}</span>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Profile Photo (Required)</label>
                <div style={styles.photoSection}>
                  {photoPreview ? (
                    <div style={styles.photoPreview}>
                      <img
                        src={photoPreview}
                        alt='Preview'
                        style={styles.previewImage}
                      />
                      <button
                        type='button'
                        onClick={() => {
                          setPhoto(null);
                          setPhotoPreview(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = '';
                        }}
                        style={styles.removePhoto}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      style={styles.photoUpload}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <svg
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='1.5'
                      >
                        <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                        <polyline points='17 8 12 3 7 8' />
                        <line x1='12' y1='3' x2='12' y2='15' />
                      </svg>
                      <span>Click to upload photo</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </div>
                {errors.photo && (
                  <span style={styles.errorText}>{errors.photo}</span>
                )}
              </div>

              <button type='submit' style={styles.submitButton}>
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Card Number</label>
                <input
                  type='text'
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCardNumber(e.target.value))
                  }
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

              <div style={styles.buttonRow}>
                <button
                  type='button'
                  onClick={handleSkipCard}
                  disabled={isSubmitting}
                  style={{
                    ...styles.skipButton,
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  Skip for now
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  style={{
                    ...styles.submitButton,
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? 'Creating account...' : 'Complete Sign Up'}
                </button>
              </div>
            </form>
          )}

          <p style={styles.switchText}>
            {step === 1 ? (
              <>
                Already have an account?{' '}
                <span style={styles.link} onClick={() => navigate('/login')}>
                  Log in
                </span>
              </>
            ) : (
              <span style={styles.link} onClick={() => setStep(1)}>
                ← Back to account details
              </span>
            )}
          </p>
        </div>
      </section>
    </>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px',
    paddingTop: '160px',
    paddingBottom: '160px',
    backgroundColor: '#141414',
  },
  formWrapper: {
    width: '100%',
    maxWidth: '440px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 400,
    color: '#fff',
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '40px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
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
  optionalNote: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '32px',
    marginTop: '-8px',
    fontStyle: 'italic',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  },
  photoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  photoUpload: {
    background: 'rgba(44, 44, 44, 1)',
    border: '2px dashed rgba(255,255,255,0.2)',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    color: 'rgba(255,255,255,0.6)',
  },
  photoPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  previewImage: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: '50%',
  },
  removePhoto: {
    background: '#ff4444',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
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
    marginTop: '8px',
    flex: '1 1 0',
    minWidth: 0,
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  skipButton: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '14px 24px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    flex: '1 1 0',
    minWidth: 0,
  },
  switchText: {
    marginTop: '32px',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.9rem',
  },
  link: {
    color: '#fff',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default SignUp;
