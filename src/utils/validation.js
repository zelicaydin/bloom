// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation: 8+ chars, first letter uppercase, contains punctuation
export const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }

  if (password[0] !== password[0].toUpperCase()) {
    return { valid: false, error: "Password must start with an uppercase letter" };
  }

  // Check for at least one punctuation symbol
  const punctuationRegex = /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/;
  if (!punctuationRegex.test(password)) {
    return { valid: false, error: "Password must contain at least one punctuation symbol" };
  }

  return { valid: true };
};

// Card number validation (16 digits, can have spaces)
export const validateCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, "");
  const cardRegex = /^\d{16}$/;
  return cardRegex.test(cleaned);
};

// Expiry date validation (MM/YY format)
export const validateExpiry = (expiry) => {
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!expiryRegex.test(expiry)) {
    return { valid: false, error: "Invalid format. Use MM/YY" };
  }

  const [month, year] = expiry.split("/");
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  const expYear = parseInt(year);
  const expMonth = parseInt(month);

  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return { valid: false, error: "Card has expired" };
  }

  return { valid: true };
};

// CVV validation (3 digits)
export const validateCVV = (cvv) => {
  const cvvRegex = /^\d{3}$/;
  return cvvRegex.test(cvv);
};

// Format card number with spaces (XXXX XXXX XXXX XXXX)
export const formatCardNumber = (value) => {
  const cleaned = value.replace(/\s/g, "");
  const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
  return formatted.slice(0, 19); // Max 16 digits + 3 spaces
};

// Format expiry date (MM/YY)
export const formatExpiry = (value) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
  }
  return cleaned;
};
