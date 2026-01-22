import { useState } from 'react';

const FeedbackModal = ({ products, onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState({});

  const handleFeedbackChange = (productId, liked) => {
    setFeedback((prev) => ({ ...prev, [productId]: liked }));
  };

  const handleSubmit = () => {
    onSubmit(feedback);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>How did you like your box?</h2>
        <p style={styles.subtitle}>Help us improve your next box by sharing your feedback</p>

        <div style={styles.productsList}>
          {products.map((product) => (
            <div key={product.id} style={styles.productItem}>
              <div style={styles.productInfo}>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productBrand}>{product.brand}</p>
              </div>
              <div style={styles.feedbackButtons}>
                <button
                  onClick={() => handleFeedbackChange(product.id, true)}
                  style={{
                    ...styles.feedbackButton,
                    ...(feedback[product.id] === true ? styles.feedbackButtonActive : {}),
                  }}
                >
                  ✓ Like
                </button>
                <button
                  onClick={() => handleFeedbackChange(product.id, false)}
                  style={{
                    ...styles.feedbackButton,
                    ...(feedback[product.id] === false ? styles.feedbackButtonActive : {}),
                  }}
                >
                  ✗ Dislike
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Skip
          </button>
          <button onClick={handleSubmit} style={styles.submitButton}>
            Submit Feedback
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
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modal: {
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '40px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 500,
    color: '#fff',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: '0 0 32px 0',
  },
  productsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '32px',
  },
  productItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 0,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: '1.1rem',
    fontWeight: 500,
    color: '#fff',
    margin: '0 0 4px 0',
  },
  productBrand: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  feedbackButtons: {
    display: 'flex',
    gap: '8px',
  },
  feedbackButton: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.8)',
    padding: '8px 16px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderRadius: 0,
  },
  feedbackButtonActive: {
    background: '#fff',
    color: '#000',
    borderColor: '#fff',
  },
  footer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '12px 24px',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: 0,
  },
  submitButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
  },
};

export default FeedbackModal;
