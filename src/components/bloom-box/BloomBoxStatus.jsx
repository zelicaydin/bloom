import React from 'react';

const BloomBoxStatus = ({ subscription, onCancel, onRedoQuiz, onPause, onResume }) => {
  const isPaused = subscription?.status === 'paused';
  const isCancelled = subscription?.status === 'cancelled';
  const isActive = subscription?.status === 'active';

  // Calculate total price of box (assuming 4 products, average $25)
  const boxPrice = 99.99; // Standard BloomBox price

  return (
    <div style={styles.container}>
      <div style={styles.statusRow}>
        <div style={styles.statusItem}>
          <p style={styles.label}>Status</p>
          <div style={styles.statusBadge}>
            <span style={{
              ...styles.statusDot,
              backgroundColor: isActive ? '#4caf50' : isPaused ? '#ff9800' : '#ff4444'
            }} />
            <span style={styles.statusText}>
              {isActive ? 'Active' : isPaused ? 'Paused' : 'Cancelled'}
            </span>
          </div>
        </div>

        <div style={styles.statusItem}>
          <p style={styles.label}>Price</p>
          <p style={styles.value}>${boxPrice.toFixed(2)}/month</p>
        </div>

        <div style={styles.statusItem}>
          <p style={styles.label}>Frequency</p>
          <p style={styles.value}>Monthly</p>
        </div>
      </div>

      <div style={styles.actionsRow}>
        {isActive && (
          <button onClick={onPause} style={styles.actionButton}>
            Pause Subscription
          </button>
        )}
        {isPaused && (
          <button onClick={onResume} style={styles.actionButton}>
            Resume Subscription
          </button>
        )}
        <button onClick={onRedoQuiz} style={styles.actionButton}>
          Re-do Quiz
        </button>
        <button onClick={onCancel} style={styles.cancelButton}>
          Cancel Subscription
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '24px',
    marginBottom: '40px',
  },
  statusRow: {
    display: 'flex',
    gap: '40px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  statusItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  value: {
    fontSize: '1.1rem',
    fontWeight: 500,
    color: '#fff',
    margin: 0,
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  statusText: {
    fontSize: '1rem',
    fontWeight: 500,
    color: '#fff',
  },
  actionsRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  actionButton: {
    background: 'transparent',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '10px 20px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderRadius: 0,
  },
  cancelButton: {
    background: 'transparent',
    color: 'rgba(255,68,68,0.9)',
    border: '1px solid rgba(255,68,68,0.3)',
    padding: '10px 20px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderRadius: 0,
  },
};

export default BloomBoxStatus;
