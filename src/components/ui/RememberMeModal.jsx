import { useState } from 'react';

const RememberMeModal = ({ onRemember, onDontRemember, userAction }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  const handleRemember = () => {
    setIsOpen(false);
    if (onRemember) onRemember();
  };

  const handleDontRemember = () => {
    setIsOpen(false);
    if (onDontRemember) onDontRemember();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Stay Signed In?</h2>
        <p style={styles.message}>
          Would you like Bloom to remember you? You'll stay signed in until you manually sign out.
        </p>
        <div style={styles.buttonRow}>
          <button
            onClick={handleDontRemember}
            style={styles.cancelButton}
          >
            No, sign me out when I close
          </button>
          <button
            onClick={handleRemember}
            style={styles.confirmButton}
          >
            Yes, remember me
          </button>
        </div>
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
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modal: {
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '32px',
    maxWidth: '440px',
    width: '90%',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 500,
    color: '#fff',
    margin: '0 0 16px 0',
  },
  message: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.8)',
    margin: '0 0 24px 0',
    lineHeight: 1.5,
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
    padding: '12px 20px',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  confirmButton: {
    flex: 1,
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '12px 20px',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
};

export default RememberMeModal;
