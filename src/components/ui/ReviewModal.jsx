import { useState } from 'react';
import { useReviews } from '../../store/ReviewsContext';
import { useNotification } from '../../store/NotificationContext';

const ReviewModal = ({ product, isOpen, onClose }) => {
  const { addReview, updateReview, getUserReview } = useReviews();
  const { showNotification } = useNotification();
  
  const existingReview = getUserReview(product?.id);
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      showNotification('Please select a rating', 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        // Update existing review
        const result = updateReview(existingReview.id, rating, comment);
        if (result.success) {
          showNotification('Review updated successfully!', 3000);
          onClose();
        } else {
          showNotification(result.error || 'Failed to update review', 3000);
        }
      } else {
        // Add new review
        const result = addReview(product.id, rating, comment);
        if (result.success) {
          showNotification('Review submitted successfully!', 3000);
          onClose();
        } else {
          showNotification(result.error || 'Failed to submit review', 3000);
        }
      }
    } catch (error) {
      showNotification('An error occurred. Please try again.', 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStar = (value) => {
    const isFilled = value <= (hoveredRating || rating);
    return (
      <button
        type="button"
        key={value}
        onClick={() => setRating(value)}
        onMouseEnter={() => setHoveredRating(value)}
        onMouseLeave={() => setHoveredRating(0)}
        style={{
          background: 'none',
          border: 'none',
          padding: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill={isFilled ? '#FFD700' : 'none'}
          stroke={isFilled ? '#FFD700' : 'rgba(255,255,255,0.3)'}
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
    );
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {existingReview ? 'Update Your Review' : 'Leave a Review'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={styles.productInfo}>
          <img
            src={product.image || 'https://via.placeholder.com/60x60'}
            alt={product.name}
            style={styles.productImage}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/60x60';
            }}
          />
          <div>
            <h3 style={styles.productName}>{product.name}</h3>
            <p style={styles.productBrand}>{product.brand}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.ratingSection}>
            <label style={styles.label}>Rating *</label>
            <div style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(renderStar)}
            </div>
            {rating > 0 && (
              <p style={styles.ratingText}>
                {rating} {rating === 1 ? 'star' : 'stars'}
              </p>
            )}
          </div>

          <div style={styles.commentSection}>
            <label style={styles.label} htmlFor="comment">
              Your Review (Optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              style={styles.textarea}
              rows={5}
            />
          </div>

          <div style={styles.buttonRow}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 0,
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '32px',
    cursor: 'pointer',
    padding: 0,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  productInfo: {
    display: 'flex',
    gap: '16px',
    padding: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  productImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: 0,
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
  form: {
    padding: '24px',
  },
  ratingSection: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#fff',
    marginBottom: '12px',
  },
  starsContainer: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  ratingText: {
    margin: '8px 0 0 0',
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.7)',
  },
  commentSection: {
    marginBottom: '24px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 0,
    color: '#fff',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 0,
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: 0,
    color: '#000',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default ReviewModal;
