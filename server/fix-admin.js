/**
 * Quick script to fix admin user in backend
 * Run: node fix-admin.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, 'data');
const USERS_FILE = join(DATA_DIR, 'users.json');

try {
  const users = JSON.parse(readFileSync(USERS_FILE, 'utf8'));
  
  // Find and fix admin user
  const adminIndex = users.findIndex(u => u.email === 'admin@bloom.com');
  
  if (adminIndex !== -1) {
    users[adminIndex] = {
      ...users[adminIndex],
      emailVerified: true,
      isAdmin: true,
      verificationCode: null,
      verificationCodeExpiry: null,
    };
    
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log('✅ Admin user fixed!');
    console.log('Admin now has emailVerified: true');
  } else {
    console.log('⚠️ Admin user not found in backend');
  }
} catch (error) {
  console.error('Error fixing admin:', error);
}
