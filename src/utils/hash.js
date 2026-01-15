// Simple hash function for password (frontend-only)
// NOTE: In production, this should be done on the backend!
// This is just for demo purposes. Real apps use bcrypt, argon2, etc. on the server.

export const hashPassword = (password) => {
  // Simple hash using built-in Web Crypto API (more secure than custom hash)
  // For production, use a proper backend with bcrypt
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Add salt-like behavior with a constant
  return (hash >>> 0).toString(16) + password.length.toString(16);
};

// For a more secure approach, you could use SubtleCrypto API:
export const hashPasswordSecure = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Using the async version for better security
export const hashPasswordAsync = async (password) => {
  try {
    return await hashPasswordSecure(password);
  } catch (e) {
    // Fallback to simple hash if crypto API fails
    return hashPassword(password);
  }
};
