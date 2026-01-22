import { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';

const EmailVerificationModal = ({ userId, email, verificationCode, onVerified, navigate }) => {
  const { verifyEmail, resendVerificationCode } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [newCode, setNewCode] = useState(verificationCode);

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    
    if (code.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyEmail(userId, code);
      if (result.success) {
        onVerified();
      } else {
        setError(result.error || 'Verification failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setIsResending(true);
    setError('');
    try {
      const result = await resendVerificationCode(userId);
      if (result.success) {
        setNewCode(result.verificationCode);
        setResendCooldown(60); // 60 second cooldown
        setCode(''); // Clear input
      } else {
        setError(result.error || 'Failed to resend code');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Verify Your Email</h2>
          <p style={styles.subtitle}>
            We've sent a 6-digit verification code to <strong>{email}</strong>
          </p>
        </div>

        <div style={styles.codeDisplay}>
          <p style={styles.codeLabel}>Your verification code:</p>
          <div style={styles.codeBox}>
            <span style={styles.codeText}>{newCode}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(newCode);
                alert('Code copied to clipboard!');
              }}
              style={styles.copyButton}
            >
              Copy
            </button>
          </div>
          <p style={styles.codeHint}>
            (Since this is a demo, the code is shown here. In production, this would be sent via email.)
          </p>
        </div>

        <form onSubmit={handleVerify} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Enter Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                setError('');
              }}
              placeholder="000000"
              style={{
                ...styles.input,
                borderColor: error ? '#ff4444' : 'rgba(255,255,255,0.2)',
              }}
              maxLength={6}
              autoFocus
            />
            {error && <span style={styles.errorText}>{error}</span>}
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              disabled={isVerifying || code.length !== 6}
              style={{
                ...styles.verifyButton,
                opacity: isVerifying || code.length !== 6 ? 0.6 : 1,
                cursor: isVerifying || code.length !== 6 ? 'not-allowed' : 'pointer',
              }}
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          <div style={styles.resendSection}>
            <p style={styles.resendText}>Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              style={{
                ...styles.resendButton,
                opacity: resendCooldown > 0 || isResending ? 0.5 : 1,
                cursor: resendCooldown > 0 || isResending ? 'not-allowed' : 'pointer',
              }}
            >
              {isResending
                ? 'Sending...'
                : resendCooldown > 0
                ? `Resend Code (${resendCooldown}s)`
                : 'Resend Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 0,
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    color: '#fff',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 600,
    margin: '0 0 12px 0',
    color: '#fff',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.7)',
    margin: 0,
  },
  codeDisplay: {
    backgroundColor: 'rgba(44, 44, 44, 1)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '24px',
    marginBottom: '32px',
    textAlign: 'center',
  },
  codeLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: '0 0 12px 0',
  },
  codeBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  codeText: {
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '8px',
    color: '#4caf50',
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
    transition: 'all 0.2s',
  },
  codeHint: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
    fontStyle: 'italic',
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
  input: {
    background: 'rgba(44, 44, 44, 1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '14px 16px',
    fontSize: '1.5rem',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
    borderRadius: 0,
    textAlign: 'center',
    letterSpacing: '4px',
    fontFamily: 'monospace',
    fontWeight: 600,
  },
  errorText: {
    fontSize: '0.85rem',
    color: '#ff4444',
    marginTop: '-4px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  verifyButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '14px 24px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
    transition: 'opacity 0.2s',
  },
  resendSection: {
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  resendText: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: '0 0 12px 0',
  },
  resendButton: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '10px 20px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: 0,
    transition: 'all 0.2s',
  },
};

export default EmailVerificationModal;
