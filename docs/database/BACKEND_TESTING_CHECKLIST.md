# Backend Testing Checklist

Use this checklist to manually verify that all backend functionality is working correctly.

## Prerequisites

1. **Start the backend server:**
   ```bash
   cd server
   npm start
   ```
   You should see: `🚀 Bloom Backend Server Running! 📍 Server: http://localhost:3001`

2. **Start the frontend:**
   ```bash
   npm run dev
   ```

3. **Check backend status:**
   - Open browser: `http://localhost:3001/api/status`
   - Should return: `{"status":"ok","message":"Bloom Backend is running!"}`

---

## 1. User Authentication & Registration

### ✅ Sign Up
- [ ] Create a new account with email/password
- [ ] Check backend terminal - should see "📝 Signup request received"
- [ ] Check `server/data/users.json` - new user should appear
- [ ] Verify user has `emailVerified: false` initially
- [ ] Verify verification code is generated and shown in modal
- [ ] Verify code is logged in backend terminal

### ✅ Email Verification
- [ ] Enter verification code from modal
- [ ] Check `server/data/users.json` - user should have `emailVerified: true`
- [ ] Verify code and expiry are cleared after verification
- [ ] Try resending code - should get new code with 60s cooldown

### ✅ Login
- [ ] Try logging in with unverified email - should show verification modal
- [ ] Verify email, then login should succeed
- [ ] Check backend terminal - should see "🔐 Login attempt for: [email]"
- [ ] Check `server/data/users.json` - login should not modify user data
- [ ] Try wrong password - should get "Incorrect password" error
- [ ] Try non-existent email - should get "No account found" error

### ✅ Password Reset
- [ ] Click "Forgot Password?" on login page
- [ ] Enter email address
- [ ] Check backend terminal - should see "✅ Password reset code sent to: [email]"
- [ ] Check `server/data/users.json` - user should have `passwordResetCode` and `passwordResetCodeExpiry`
- [ ] Enter reset code and new password
- [ ] Check `server/data/users.json` - password should be updated, reset code cleared
- [ ] Try logging in with new password - should succeed

---

## 2. User Management

### ✅ View Users (Admin)
- [ ] Log in as admin (`admin@bloom.com` / `Admin123!`)
- [ ] Go to Admin panel
- [ ] Check that all users are listed
- [ ] Verify user list auto-refreshes every 2 seconds
- [ ] Click "Refresh" button - should manually reload users

### ✅ Edit User (Admin)
- [ ] Select a user in Admin panel
- [ ] Edit user details (name, email, etc.)
- [ ] Check `server/data/users.json` - changes should be saved
- [ ] Refresh page - changes should persist

### ✅ Delete User (Admin)
- [ ] Delete a user from Admin panel
- [ ] Check backend terminal - should see "🗑️ User deleted: [email]"
- [ ] Check `server/data/users.json` - user should be removed
- [ ] Try to sign up with deleted user's email - should work (email available again)

---

## 3. Product Management

### ✅ View Products
- [ ] Go to Catalogue page
- [ ] Products should load from backend
- [ ] Check backend terminal - should see GET request logs
- [ ] Check `server/data/products.json` - products should be there

### ✅ Create Product (Admin)
- [ ] Go to Admin panel → Products tab
- [ ] Create a new product
- [ ] Check `server/data/products.json` - new product should appear
- [ ] Verify product appears in Catalogue

### ✅ Edit Product (Admin)
- [ ] Edit a product in Admin panel
- [ ] Check `server/data/products.json` - changes should be saved
- [ ] Verify changes appear in Catalogue

### ✅ Delete Product (Admin)
- [ ] Delete a product from Admin panel
- [ ] Check `server/data/products.json` - product should be removed
- [ ] Verify product no longer appears in Catalogue

---

## 4. Purchase History

### ✅ Make a Purchase
- [ ] Add items to cart
- [ ] Go to checkout
- [ ] Complete purchase
- [ ] Check backend terminal - should see purchase creation
- [ ] Check `server/data/purchases.json` - purchase should be saved with `userId`
- [ ] Go to Purchase History - should see the purchase

### ✅ View Purchase History
- [ ] Go to Purchase History page
- [ ] Verify all past purchases are displayed
- [ ] Check `server/data/purchases.json` - purchases should be filtered by `userId`

---

## 5. Coupon System

### ✅ Create Coupon (Admin)
- [ ] Go to Admin panel → User details → Coupons tab
- [ ] Create a new coupon for a user
- [ ] Check `server/data/coupons.json` - coupon should appear
- [ ] Verify coupon has `userId`, `code`, `discountType`, `amount`, `expiresAt`

### ✅ Apply Coupon (User)
- [ ] Go to checkout
- [ ] Enter coupon code
- [ ] Check backend terminal - should see coupon validation
- [ ] Verify discount is applied correctly
- [ ] Complete purchase
- [ ] Check `server/data/coupons.json` - coupon should have `used: true` and `usedAt`

### ✅ View Coupons (User)
- [ ] Go to Profile dropdown → Coupons
- [ ] Verify user's coupons are displayed
- [ ] Check used/unused status is correct
- [ ] Check expiry dates are displayed

### ✅ Single-Use Coupon
- [ ] Try to use the same coupon code twice
- [ ] Second attempt should fail with "Invalid or already used coupon code"
- [ ] Check `server/data/coupons.json` - coupon should still show `used: true`

---

## 6. Reviews

### ✅ Add Review
- [ ] Go to a product page
- [ ] Add a review
- [ ] Check backend terminal - should see review creation
- [ ] Check `server/data/reviews.json` - review should be saved
- [ ] Verify review appears on product page

### ✅ View Reviews
- [ ] Go to product page
- [ ] Verify all reviews for that product are displayed
- [ ] Check `server/data/reviews.json` - reviews should be filtered by `productId`

---

## 7. Data Persistence

### ✅ Persistence Test
- [ ] Create a new user account
- [ ] Log out
- [ ] Close browser completely
- [ ] Restart backend server
- [ ] Restart frontend
- [ ] Try to log in with the same credentials
- [ ] Should succeed - data persisted in `server/data/users.json`

### ✅ Data Files Check
- [ ] Check `server/data/` directory:
  - [ ] `users.json` - should contain all users
  - [ ] `products.json` - should contain all products
  - [ ] `purchases.json` - should contain all purchases
  - [ ] `coupons.json` - should contain all coupons
  - [ ] `reviews.json` - should contain all reviews

---

## 8. Error Handling

### ✅ Network Errors
- [ ] Stop backend server
- [ ] Try to sign up - should fall back to localStorage
- [ ] Try to log in - should fall back to localStorage
- [ ] Check browser console - should see fallback messages

### ✅ Invalid Data
- [ ] Try to sign up with empty fields - should get validation error
- [ ] Try to use expired coupon - should get "Coupon has expired" error
- [ ] Try to use invalid verification code - should get "Invalid verification code" error

### ✅ Duplicate Data
- [ ] Try to sign up with existing email - should get "Email already registered"
- [ ] Try to create duplicate product ID - should handle gracefully

---

## 9. Backend Terminal Logging

### ✅ Check Logs
Monitor the backend terminal for these log messages:

- **Signup:** `📝 Signup request received`, `✅ Email available for signup`
- **Login:** `🔐 Login attempt for:`, `✅ Login successful for:`
- **Email Verification:** `📧 ===== EMAIL SENT (MOCK) =====`
- **Password Reset:** `✅ Password reset code sent to:`
- **User Deletion:** `🗑️ User deleted:`, `📊 Remaining users:`
- **Purchase:** Purchase creation logs
- **Coupon:** Coupon validation and usage logs

---

## 10. Data Migration

### ✅ Migration Test (if applicable)
- [ ] Clear `server/data/` directory (backup first!)
- [ ] Start backend
- [ ] Start frontend
- [ ] Check backend terminal - should see migration messages
- [ ] Check `server/data/` - files should be created with migrated data
- [ ] Verify `localStorage` data was migrated correctly

---

## Quick Verification Commands

### Check Backend Status
```bash
curl http://localhost:3001/api/status
```

### View Users (requires backend running)
```bash
cat server/data/users.json | python3 -m json.tool | grep -i email
```

### View Products
```bash
cat server/data/products.json | python3 -m json.tool | head -50
```

### Count Items
```bash
# Count users
cat server/data/users.json | python3 -c "import sys, json; print(len(json.load(sys.stdin)))"

# Count products
cat server/data/products.json | python3 -c "import sys, json; print(len(json.load(sys.stdin)))"

# Count purchases
cat server/data/purchases.json | python3 -c "import sys, json; print(len(json.load(sys.stdin)))"
```

---

## Common Issues to Watch For

1. **Backend not running:** Frontend should fall back to localStorage
2. **Port conflicts:** Ensure port 3001 is available
3. **CORS errors:** Should not occur (CORS is enabled in backend)
4. **Data not persisting:** Check file permissions in `server/data/`
5. **Email verification not working:** Check verification code expiry (10 minutes)
6. **Password reset not working:** Check reset code expiry (10 minutes)

---

## Success Criteria

✅ All user operations (signup, login, verification, password reset) work  
✅ All admin operations (CRUD for users/products) work  
✅ All data persists after server restart  
✅ Coupons work correctly (single-use, expiry, validation)  
✅ Purchase history is saved and retrievable  
✅ Reviews are saved and displayed  
✅ Error handling works (network errors, invalid data, duplicates)  
✅ Backend terminal shows appropriate logs for all operations  

---

**Note:** Since emails are mocked, all verification/reset codes are displayed on screen and logged to the backend terminal console.
