import { useState } from 'react';

const PreferenceQuiz = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    productTypes: [],
    brands: [],
    sustainabilityPriorities: [],
    skinConcerns: [],
    skinType: '',
    budget: '',
    hairType: '',
    hairConcerns: [],
    preferredScents: [],
    productFrequency: '',
    priceRange: '',
  });

  const totalSteps = 10;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(preferences);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleArrayItem = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const setSingleValue = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 style={styles.stepTitle}>What product types interest you?</h2>
            <div style={styles.optionsGrid}>
              {['shampoo', 'body-wash', 'face-care', 'lotion', 'serum', 'cleanser'].map((type) => (
                <button
                  key={type}
                  onClick={() => toggleArrayItem('productTypes', type)}
                  style={{
                    ...styles.optionButton,
                    ...(preferences.productTypes.includes(type) ? styles.optionButtonActive : {}),
                  }}
                >
                  {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 style={styles.stepTitle}>Which brands do you prefer?</h2>
            <div style={styles.optionsGrid}>
              {['Bloom Labs', 'Prada', 'Single Origin', 'All Natural'].map((brand) => (
                <button
                  key={brand}
                  onClick={() => toggleArrayItem('brands', brand)}
                  style={{
                    ...styles.optionButton,
                    ...(preferences.brands.includes(brand) ? styles.optionButtonActive : {}),
                  }}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 style={styles.stepTitle}>What sustainability priorities matter to you?</h2>
            <div style={styles.optionsGrid}>
              {[
                { value: 'organicIngredients', label: 'Organic Ingredients' },
                { value: 'crueltyFree', label: 'Cruelty Free' },
                { value: 'sustainablePackaging', label: 'Sustainable Packaging' },
                { value: 'recyclable', label: 'Recyclable' },
              ].map((priority) => (
                <button
                  key={priority.value}
                  onClick={() => toggleArrayItem('sustainabilityPriorities', priority.value)}
                  style={{
                    ...styles.optionButton,
                    ...(preferences.sustainabilityPriorities.includes(priority.value) ? styles.optionButtonActive : {}),
                  }}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2 style={styles.stepTitle}>What are your main skin concerns?</h2>
            <div style={styles.optionsGrid}>
              {['dryness', 'acne', 'sensitivity', 'aging', 'oily'].map((concern) => (
                <button
                  key={concern}
                  onClick={() => toggleArrayItem('skinConcerns', concern)}
                  style={{
                    ...styles.optionButton,
                    ...(preferences.skinConcerns.includes(concern) ? styles.optionButtonActive : {}),
                  }}
                >
                  {concern.charAt(0).toUpperCase() + concern.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h2 style={styles.stepTitle}>What's your skin type?</h2>
            <div style={styles.optionsGrid}>
              {['dry', 'oily', 'combination', 'sensitive', 'normal'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSingleValue('skinType', type)}
                  style={{
                    ...styles.optionButton,
                    ...(preferences.skinType === type ? styles.optionButtonActive : {}),
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div>
            <h2 style={styles.stepTitle}>What's your hair type?</h2>
            <div style={styles.optionsGrid}>
              {['straight', 'wavy', 'curly', 'coily', 'fine', 'thick'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSingleValue('hairType', type)}
                  style={{
                    ...styles.optionButton,
                    ...(preferences.hairType === type ? styles.optionButtonActive : {}),
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );
      case 7:
        return (
          <div>
            <h2 style={styles.stepTitle}>What are your main hair concerns?</h2>
            <div style={styles.optionsGrid}>
              {['frizz', 'dryness', 'damage', 'dullness', 'volume', 'scalp issues'].map((concern) => (
                <button
                  key={concern}
                  onClick={() => toggleArrayItem('hairConcerns', concern)}
                  style={{
                    ...styles.optionButton,
                    ...(preferences.hairConcerns.includes(concern) ? styles.optionButtonActive : {}),
                  }}
                >
                  {concern.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        );
      case 8:
        return (
          <div>
            <h2 style={styles.stepTitle}>What scents do you prefer?</h2>
            <div style={styles.optionsGrid}>
              {['floral', 'citrus', 'woody', 'herbal', 'fresh', 'vanilla', 'unscented'].map((scent) => (
                <button
                  key={scent}
                  onClick={() => toggleArrayItem('preferredScents', scent)}
                  style={{
                    ...styles.optionButton,
                    ...(preferences.preferredScents.includes(scent) ? styles.optionButtonActive : {}),
                  }}
                >
                  {scent.charAt(0).toUpperCase() + scent.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );
      case 9:
        return (
          <div>
            <h2 style={styles.stepTitle}>How often do you use beauty products?</h2>
            <div style={styles.optionsGrid}>
              {['daily', 'few times a week', 'weekly', 'occasionally'].map((frequency) => (
                <button
                  key={frequency}
                  onClick={() => setSingleValue('productFrequency', frequency)}
                  style={{
                    ...styles.optionButton,
                    ...(preferences.productFrequency === frequency ? styles.optionButtonActive : {}),
                  }}
                >
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );
      case 10:
        return (
          <div>
            <h2 style={styles.stepTitle}>What's your preferred price range per product?</h2>
            <div style={styles.optionsGrid}>
              {['$0-$25', '$25-$50', '$50-$75', '$75+'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSingleValue('priceRange', range)}
                  style={{
                    ...styles.optionButton,
                    ...(preferences.priceRange === range ? styles.optionButtonActive : {}),
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h1 style={styles.title}>Personalization Quiz</h1>
          <p style={styles.subtitle}>Step {step} of {totalSteps}</p>
        </div>

        <div style={styles.content}>{renderStep()}</div>

        <div style={styles.footer}>
          {step > 1 && (
            <button onClick={handleBack} style={styles.backButton}>
              Back
            </button>
          )}
          <button onClick={handleNext} style={styles.nextButton}>
            {step === totalSteps ? 'Complete' : 'Next'}
          </button>
          {onCancel && (
            <button onClick={onCancel} style={styles.cancelButton}>
              Cancel
            </button>
          )}
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
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 500,
    color: '#fff',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  content: {
    marginBottom: '32px',
    minHeight: '300px',
  },
  stepTitle: {
    fontSize: '1.5rem',
    fontWeight: 500,
    color: '#fff',
    marginBottom: '24px',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  optionButton: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.8)',
    padding: '16px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderRadius: 0,
  },
  optionButtonActive: {
    background: '#fff',
    color: '#000',
    borderColor: '#fff',
    borderRadius: 0,
  },
  footer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  backButton: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '12px 24px',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: 0,
  },
  nextButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
  },
  cancelButton: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: 'none',
    padding: '12px 24px',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: 0,
  },
};

export default PreferenceQuiz;
