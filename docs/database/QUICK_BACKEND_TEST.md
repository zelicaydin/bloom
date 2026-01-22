# Quick Backend Test Guide

## Issue 1: "Cannot GET /api/status"

**Solution:** Make sure the backend server is running:

```bash
# Navigate to server directory
cd server

# Start the backend
npm start
```

You should see:
```
🚀 Bloom Backend Server Running!
📍 Server: http://localhost:3001
```

Then test in browser: `http://localhost:3001/api/status`

---

## Issue 2: File Path Errors

**Problem:** You're in the `server/` directory and trying to access `server/data/users.json`

**Solution:** When you're already in the `server/` directory, use relative paths:

```bash
# If you're in /Users/ajdin/Codebase/Bloom/server/
cat data/users.json | python3 -m json.tool

# OR use absolute path from anywhere:
cat /Users/ajdin/Codebase/Bloom/server/data/users.json | python3 -m json.tool
```

---

## Quick Verification Steps

### 1. Check if backend is running:
```bash
# Check if port 3001 is in use
lsof -ti:3001

# OR test the endpoint
curl http://localhost:3001/api/status
```

### 2. Check data files (from project root):
```bash
# From /Users/ajdin/Codebase/Bloom/
ls -la server/data/

# View users
cat server/data/users.json | python3 -m json.tool | head -30

# View products
cat server/data/products.json | python3 -m json.tool | head -30
```

### 3. Check data files (from server directory):
```bash
# From /Users/ajdin/Codebase/Bloom/server/
ls -la data/

# View users
cat data/users.json | python3 -m json.tool | head -30

# View products  
cat data/products.json | python3 -m json.tool | head -30
```

---

## Common Issues & Fixes

### Backend not starting?
```bash
cd server
npm install  # Make sure dependencies are installed
npm start
```

### Port 3001 already in use?
```bash
# Find what's using port 3001
lsof -ti:3001

# Kill it (replace PID with actual process ID)
kill -9 <PID>

# Then restart backend
cd server
npm start
```

### Data files not updating?
- Make sure backend is running
- Check file permissions: `ls -la server/data/`
- Check backend terminal for errors

### CORS errors?
- Backend has CORS enabled, should work automatically
- Make sure frontend is calling `http://localhost:3001/api/...`

---

## Test All Endpoints

```bash
# Status
curl http://localhost:3001/api/status

# Users (should return array)
curl http://localhost:3001/api/users

# Products (should return array)
curl http://localhost:3001/api/products

# Test login (POST request)
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bloom.com","password":"YOUR_HASHED_PASSWORD"}'
```

---

## Expected Behavior

✅ Backend terminal shows logs for every request  
✅ Data files update when you create/edit/delete  
✅ Browser can access `http://localhost:3001/api/status`  
✅ Frontend can communicate with backend  
✅ Data persists after server restart  
