import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductsContext';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const { products } = useProducts();
  const [subscription, setSubscription] = useState(null);
  const [preferences, setPreferences] = useState(null);

  // Load subscription and preferences
  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setPreferences(null);
      return;
    }

    const loadSubscription = () => {
      const key = `bloom_subscription_${user.id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setSubscription(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing subscription:', e);
        }
      }
    };

    const loadPreferences = () => {
      const key = `bloom_preferences_${user.id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setPreferences(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing preferences:', e);
        }
      }
    };

    loadSubscription();
    loadPreferences();
  }, [user?.id]);

  // Calculate product recommendations based on preferences
  const getRecommendations = (count = 4) => {
    if (!preferences || !products || products.length === 0) {
      return products.slice(0, count);
    }

    // Score products based on preferences
    const scoredProducts = products.map((product) => {
      let score = 0;

      // Product type matching
      if (preferences.productTypes && preferences.productTypes.includes(product.type)) {
        score += 10;
      }

      // Brand preference
      if (preferences.brands && preferences.brands.includes(product.brand)) {
        score += 5;
      }

      // Sustainability markers
      if (preferences.sustainabilityPriorities && product.markers) {
        preferences.sustainabilityPriorities.forEach((priority) => {
          if (product.markers.includes(priority)) {
            score += 3;
          }
        });
      }

      // Skin concerns
      if (preferences.skinConcerns && product.type) {
        // Simple matching logic - can be enhanced
        preferences.skinConcerns.forEach((concern) => {
          if (product.type.toLowerCase().includes(concern.toLowerCase())) {
            score += 2;
          }
        });
      }

      // Popularity boost
      score += (product.popularity || 0) * 0.1;

      return { ...product, score };
    });

    // Sort by score and return top products
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(({ score, ...product }) => product);
  };

  const subscribe = (preferencesData) => {
    if (!user) return { success: false, error: 'Not logged in' };

    const newSubscription = {
      id: `sub_${Date.now()}`,
      userId: user.id,
      status: 'active',
      createdAt: new Date().toISOString(),
      nextBoxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      needsQuizRetake: false,
    };

    setSubscription(newSubscription);
    setPreferences(preferencesData);

    // Save to localStorage
    localStorage.setItem(`bloom_subscription_${user.id}`, JSON.stringify(newSubscription));
    localStorage.setItem(`bloom_preferences_${user.id}`, JSON.stringify(preferencesData));

    return { success: true, subscription: newSubscription };
  };

  const cancelSubscription = () => {
    if (!user || !subscription) return { success: false, error: 'No active subscription' };

    const cancelledSubscription = {
      ...subscription,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      needsQuizRetake: true,
    };

    setSubscription(cancelledSubscription);
    localStorage.setItem(`bloom_subscription_${user.id}`, JSON.stringify(cancelledSubscription));

    return { success: true };
  };

  const updatePreferences = (newPreferences) => {
    if (!user) return { success: false, error: 'Not logged in' };

    setPreferences(newPreferences);
    localStorage.setItem(`bloom_preferences_${user.id}`, JSON.stringify(newPreferences));

    return { success: true };
  };

  const clearQuizRetakeFlag = () => {
    if (!user) return;

    // Get current subscription from state or localStorage
    const key = `bloom_subscription_${user.id}`;
    const stored = localStorage.getItem(key);
    let currentSubscription = subscription;
    
    if (!currentSubscription && stored) {
      try {
        currentSubscription = JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing subscription:', e);
        return;
      }
    }

    if (!currentSubscription) return;

    const updatedSubscription = {
      ...currentSubscription,
      needsQuizRetake: false,
    };

    setSubscription(updatedSubscription);
    localStorage.setItem(key, JSON.stringify(updatedSubscription));
  };

  const pauseSubscription = () => {
    if (!user || !subscription) return { success: false, error: 'No active subscription' };

    const pausedSubscription = {
      ...subscription,
      status: 'paused',
      pausedAt: new Date().toISOString(),
    };

    setSubscription(pausedSubscription);
    localStorage.setItem(`bloom_subscription_${user.id}`, JSON.stringify(pausedSubscription));

    return { success: true };
  };

  const resumeSubscription = () => {
    if (!user || !subscription) return { success: false, error: 'No subscription' };

    const resumedSubscription = {
      ...subscription,
      status: 'active',
      resumedAt: new Date().toISOString(),
      // Reset next box date if it's in the past
      nextBoxDate: subscription.nextBoxDate && new Date(subscription.nextBoxDate) > new Date()
        ? subscription.nextBoxDate
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setSubscription(resumedSubscription);
    localStorage.setItem(`bloom_subscription_${user.id}`, JSON.stringify(resumedSubscription));

    return { success: true };
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        preferences,
        getRecommendations,
        subscribe,
        cancelSubscription,
        updatePreferences,
        clearQuizRetakeFlag,
        pauseSubscription,
        resumeSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};
