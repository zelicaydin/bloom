# Backend Migration Guide

## ✅ What Was Done

Your Bloom application now has a **full-stack architecture** with automatic data migration!

### 1. **Backend Server Created** (`server/server.js`)
   - Express.js server with RESTful API
   - Stores data in JSON files (persistent across sessions)
   - Mock email service (logs to console)
   - All CRUD operations for users, products, purchases, coupons, reviews

### 2. **Frontend Updated**
   - `database.js` now uses backend API when available
   - Automatically falls back to localStorage if backend is unavailable
   - **No breaking changes** - everything still works!

### 3. **Automatic Migration**
   - On app startup, automatically:
     - Checks if backend is available
     - Migrates all localStorage data to backend
     - Imports default products if backend is empty
   - Migration only runs once (tracked in localStorage)

## 🚀 How to Use

### Step 1: Start the Backend Server

```bash
cd server
npm install
npm start
```

You should see:
```
🚀 Bloom Backend Server Running!
📍 Server: http://localhost:3001
```

### Step 2: Start the Frontend

```bash
# In the root directory
npm run dev
```

### Step 3: Watch the Magic! ✨

When you open the app:
1. It automatically checks if backend is available
2. If yes, it migrates all your localStorage data to backend
3. You'll see console messages:
   - `✅ Backend server connected`
   - `🔄 Migrating data from localStorage to backend...`
   - `✅ Migration completed`
   - `📦 Importing default products to backend...`

## 📊 What Gets Migrated

- ✅ **Users** - All user accounts, passwords (hashed), verification codes
- ✅ **Products** - Product catalog
- ✅ **Coupons** - All coupon codes
- ✅ **Purchase History** - All orders from all users
- ✅ **Reviews** - Product reviews (if stored in localStorage)

## 🔄 How It Works

### Backend Available
- All data operations go through backend API
- Data persists in `server/data/` folder
- Survives browser refreshes, different devices, etc.

### Backend Unavailable
- Automatically falls back to localStorage
- No errors, app continues working
- When backend comes back online, migration runs again

## 📁 Data Storage

Backend stores data in JSON files:
```
server/data/
├── users.json
├── products.json
├── purchases.json
├── coupons.json
└── reviews.json
```

You can view/edit these files directly if needed!

## 🎯 For Your Presentation

### What to Say:

1. **"I built a full-stack application"**
   - Frontend: React for user interface
   - Backend: Node.js/Express for server logic and data persistence

2. **"I implemented automatic data migration"**
   - Existing localStorage data automatically moves to backend
   - No data loss, seamless transition
   - Backward compatible (works with or without backend)

3. **"I designed a RESTful API"**
   - Standard HTTP methods (GET, POST, PUT, DELETE)
   - Clear endpoint structure
   - Proper error handling

4. **"I ensured data persistence"**
   - Data survives browser refreshes
   - Works across different sessions
   - Can be easily upgraded to a real database

### Demo Flow:

1. **Show backend running**
   ```bash
   cd server && npm start
   ```

2. **Show data files**
   - Open `server/data/users.json`
   - Show your migrated data

3. **Show API working**
   - Visit `http://localhost:3001/api/products`
   - Show JSON response

4. **Show frontend using backend**
   - Open browser console
   - See migration messages
   - Create a new user/product
   - Show it appears in backend data files

## 🔧 Troubleshooting

### Backend Not Starting
- Make sure Node.js is installed: `node --version`
- Install dependencies: `cd server && npm install`
- Check if port 3001 is available

### Migration Not Running
- Check browser console for errors
- Make sure backend is running before opening frontend
- Clear `bloom_migration_complete` from localStorage to force re-migration

### Data Not Appearing
- Check `server/data/` folder exists
- Check file permissions
- Look at backend console for errors

## 🎓 Next Steps (Optional)

1. **Add Real Email Service**
   - Get Resend API key
   - Update `EmailService` class in `server.js`
   - Add API key to `.env` file

2. **Upgrade to Real Database**
   - Replace JSON files with PostgreSQL/MongoDB
   - Update `readDataFile`/`writeDataFile` functions
   - All API endpoints stay the same!

3. **Add Authentication Middleware**
   - JWT tokens for secure API access
   - Rate limiting
   - Input validation

---

**Everything is ready!** Just start the backend and frontend, and your data will automatically migrate. 🚀
