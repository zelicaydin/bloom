import { useEffect, useState } from 'react';

const Notification = ({ message, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible && !message) return null;

  return (
    <div
      style={{
        ...styles.notification,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
      }}
    >
      <div style={styles.content}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={styles.icon}
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <span style={styles.message}>{message}</span>
      </div>
    </div>
  );
};

const styles = {
  notification: {
    position: 'fixed',
    top: '100px',
    right: '80px',
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '16px 24px',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  icon: {
    color: '#4caf50',
    flexShrink: 0,
  },
  message: {
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
};

export default Notification;
