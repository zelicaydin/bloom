/**
 * Email verification utilities
 */

/**
 * Generate a 6-digit verification code
 * @returns {string} 6-digit code
 */
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Check if verification code is expired
 * @param {string} expiryDate - ISO string of expiry date
 * @returns {boolean} true if expired
 */
export const isVerificationCodeExpired = (expiryDate) => {
  if (!expiryDate) return true;
  return new Date() > new Date(expiryDate);
};

/**
 * Create expiry date (10 minutes from now)
 * @returns {string} ISO string of expiry date
 */
export const createVerificationCodeExpiry = () => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10);
  return expiry.toISOString();
};
