import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ReviewsContext = createContext(null);

export const ReviewsProvider = ({ children }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);

  // Load reviews from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('bloom_reviews');
    if (stored) {
      try {
        setReviews(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing reviews:', e);
        setReviews([]);
      }
    }
  }, []);

  // Save reviews to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bloom_reviews', JSON.stringify(reviews));
  }, [reviews]);

  const getProductReviews = (productId) => {
    return reviews.filter((r) => r.productId === productId);
  };

  const getUserReview = (productId) => {
    if (!user) return null;
    return reviews.find((r) => r.productId === productId && r.userId === user.id);
  };

  const addReview = (productId, rating, comment) => {
    if (!user) return { success: false, error: 'Not logged in' };

    const newReview = {
      id: `review_${Date.now()}`,
      productId,
      userId: user.id,
      userEmail: user.email,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    setReviews((prev) => [...prev, newReview]);
    
    // Dispatch event to update product page
    window.dispatchEvent(new CustomEvent('reviewsUpdated', { detail: { productId } }));

    return { success: true, review: newReview };
  };

  const updateReview = (reviewId, rating, comment) => {
    if (!user) return { success: false, error: 'Not logged in' };

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId && r.userId === user.id
          ? { ...r, rating, comment, updatedAt: new Date().toISOString() }
          : r
      )
    );

    const review = reviews.find((r) => r.id === reviewId);
    if (review) {
      window.dispatchEvent(new CustomEvent('reviewsUpdated', { detail: { productId: review.productId } }));
    }

    return { success: true };
  };

  const deleteReview = (reviewId) => {
    if (!user) return { success: false, error: 'Not logged in' };

    const review = reviews.find((r) => r.id === reviewId);
    if (review && review.userId === user.id) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      window.dispatchEvent(new CustomEvent('reviewsUpdated', { detail: { productId: review.productId } }));
      return { success: true };
    }

    return { success: false, error: 'Review not found or unauthorized' };
  };

  const hasUserPurchasedProduct = (productId) => {
    if (!user) return false;
    
    const purchaseHistory = localStorage.getItem(`bloom_purchase_history_${user.id}`);
    if (!purchaseHistory) return false;

    try {
      const history = JSON.parse(purchaseHistory);
      return history.some((order) =>
        order.items.some((item) => item.id === productId)
      );
    } catch (e) {
      return false;
    }
  };

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        getProductReviews,
        getUserReview,
        addReview,
        updateReview,
        deleteReview,
        hasUserPurchasedProduct,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within ReviewsProvider');
  }
  return context;
};
