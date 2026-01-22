import { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { validateEmail } from '../../utils/validation';
import { hashPasswordAsync } from '../../utils/hash';

const ForgotPassword = ({ navigate }) => {
  const { requestPasswordReset, resetPassword } = useAuth();
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter code and new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccess('');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setResetCode(result.resetCode); // For demo purposes
        setSuccess('Password reset code sent! Check your email.');
        setStep(2);
        setResendTimer(60); // 60 second cooldown
      } else {
        setSubmitError(result.error || 'Failed to send reset code');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      setSubmitError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccess('');
    const newErrors = {};

    if (!code || code.length !== 6) {
      newErrors.code = 'Please enter the 6-digit reset code';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const hashedPassword = await hashPasswordAsync(newPassword);
      const result = await resetPassword(email, code, hashedPassword);
      if (result.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setSubmitError(result.error || 'Failed to reset password');
      }
    } catch (error) {
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setSubmitError('');
    setSuccess('');
    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setResetCode(result.resetCode);
        setSuccess('New reset code sent!');
        setResendTimer(60);
        setCode(''); // Clear input
      } else {
        setSubmitError(result.error || 'Failed to resend code');
      }
    } catch (error) {
      setSubmitError('An error occurred. Please try again.');
    }
  };

  return (
    <section style={styles.container}>
      <div style={styles.formWrapper}>
        <h1 style={styles.title}>
          {step === 1 ? 'Forgot Password' : 'Reset Password'}
        </h1>
        <p style={styles.subtitle}>
          {step === 1
            ? 'Enter your email address and we\'ll send you a reset code'
            : `We've sent a reset code to ${email}`}
        </p>

        {step === 1 ? (
          <form onSubmit={handleRequestReset} style={styles.form}>
            {submitError && <div style={styles.errorBox}>{submitError}</div>}
            {success && <div style={styles.successBox}>{success}</div>}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="your.email@example.com"
                style={{
                  ...styles.input,
                  borderColor: errors.email ? '#ff4444' : 'rgba(255,255,255,0.2)',
                }}
              />
              {errors.email && (
                <span style={styles.errorText}>{errors.email}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.submitButton,
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={styles.form}>
            {submitError && <div style={styles.errorBox}>{submitError}</div>}
            {success && <div style={styles.successBox}>{success}</div>}

            {/* Demo code display */}
            {resetCode && (
              <div style={styles.codeDisplay}>
                <p style={styles.codeLabel}>Your reset code (for demo):</p>
                <div style={styles.codeBox}>
                  <span style={styles.codeText}>{resetCode}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(resetCode);
                      alert('Code copied to clipboard!');
                    }}
                    style={styles.copyButton}
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Reset Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
                }}
                placeholder="Enter 6-digit code"
                maxLength="6"
                style={{
                  ...styles.input,
                  borderColor: errors.code ? '#ff4444' : 'rgba(255,255,255,0.2)',
                  textAlign: 'center',
                  fontSize: '1.2rem',
                  letterSpacing: '0.2em',
                }}
              />
              {errors.code && (
                <span style={styles.errorText}>{errors.code}</span>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
                  }}
                  placeholder="Enter new password"
                  style={{
                    ...styles.input,
                    width: '100%',
                    paddingRight: '48px',
                    borderColor: errors.newPassword ? '#ff4444' : 'rgba(255,255,255,0.2)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <span style={styles.errorText}>{errors.newPassword}</span>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="Confirm new password"
                  style={{
                    ...styles.input,
                    width: '100%',
                    paddingRight: '48px',
                    borderColor: errors.confirmPassword ? '#ff4444' : 'rgba(255,255,255,0.2)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span style={styles.errorText}>{errors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.submitButton,
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>

            <div style={styles.resendContainer}>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendTimer > 0}
                style={styles.resendButton}
              >
                Resend Code {resendTimer > 0 && `(${resendTimer}s)`}
              </button>
            </div>
          </form>
        )}

        <p style={styles.switchText}>
          Remember your password?{' '}
          <span style={styles.link} onClick={() => navigate('/login')}>
            Log in
          </span>
        </p>
      </div>
    </section>
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
    paddingBottom: '80px',
    backgroundColor: '#141414',
    boxSizing: 'border-box',
  },
  formWrapper: {
    width: '100%',
    maxWidth: '440px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '8px',
    letterSpacing: '-0.04em',
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
  input: {
    background: 'rgba(44, 44, 44, 1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '14px 16px',
    fontSize: '1rem',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
    borderRadius: 0,
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
  },
  successBox: {
    background: 'rgba(76, 175, 80, 0.1)',
    border: '1px solid #4caf50',
    padding: '12px 16px',
    color: '#4caf50',
    fontSize: '0.9rem',
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
    borderRadius: 0,
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
  codeDisplay: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '16px',
    borderRadius: 0,
    marginBottom: '8px',
  },
  codeLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '8px',
  },
  codeBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  codeText: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#fff',
    letterSpacing: '0.2em',
    fontFamily: 'monospace',
  },
  copyButton: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '6px 12px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    borderRadius: 0,
  },
  resendContainer: {
    textAlign: 'center',
    marginTop: '8px',
  },
  resendButton: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textDecoration: 'underline',
    padding: 0,
    opacity: 1,
  },
};

export default ForgotPassword;
