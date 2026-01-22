# Bloom Backend Server - Presentation Guide

## 📋 Overview

This is a **Node.js/Express backend server** for the Bloom e-commerce application. It demonstrates full-stack development by handling server-side operations that cannot be done securely in the frontend.

## 🎯 What This Backend Does

### 1. **User Management**
- User registration and authentication
- Email verification
- User profile management
- Secure password handling

### 2. **Product Catalog**
- Product CRUD operations (Create, Read, Update, Delete)
- Persistent product storage

### 3. **Email Service**
- Sends verification emails
- Sends password reset emails
- Currently uses **mock email service** (logs to console)
- Can be easily upgraded to real email service (Resend, SendGrid, etc.)

### 4. **Purchase History**
- Stores order history
- Links purchases to users

### 5. **Coupon Management**
- Creates and validates coupons
- Tracks coupon usage

### 6. **Reviews**
- Stores product reviews
- Links reviews to products and users

## 🏗️ Architecture

```
Frontend (React)  →  Backend (Express)  →  JSON Files (Data Storage)
     ↓                      ↓                      ↓
  User Interface    API Endpoints          Persistent Data
```

### Why This Architecture?

1. **Separation of Concerns**: Frontend handles UI, backend handles business logic
2. **Security**: Sensitive operations (email sending, API keys) stay on server
3. **Persistence**: Data survives browser refreshes and sessions
4. **Scalability**: Easy to replace JSON files with a real database later

## 📁 File Structure

```
server/
├── server.js          ← Main backend file (all logic here!)
├── package.json       ← Dependencies
├── data/              ← JSON files (created automatically)
│   ├── users.json
│   ├── products.json
│   ├── purchases.json
│   ├── coupons.json
│   └── reviews.json
└── BACKEND_README.md  ← This file
```

## 🚀 How to Run

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start the Server
```bash
npm start
```

The server will run on `http://localhost:3001`

### 3. Check It's Working
Visit `http://localhost:3001/api/products` - you should see an empty array `[]` (or products if initialized)

## 🔌 API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user
- `POST /api/users` - Create new user (signup)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/login` - Authenticate user
- `POST /api/users/verify-email` - Verify email with code
- `POST /api/users/resend-verification` - Resend verification code

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get specific product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Purchases
- `GET /api/purchases/:userId` - Get user's purchase history
- `POST /api/purchases` - Create new purchase

### Coupons
- `GET /api/coupons/user/:userId` - Get user's coupons
- `POST /api/coupons` - Create coupon
- `POST /api/coupons/validate` - Validate coupon code
- `PUT /api/coupons/:id/use` - Mark coupon as used

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review

## 📧 Email Service

### Current Implementation: Mock Email
- Logs emails to console (for demo purposes)
- No API keys needed
- Works immediately

### How to Upgrade to Real Email

1. **Get API Key** from Resend (free tier: 100 emails/day)
   - Sign up at https://resend.com
   - Get your API key

2. **Install Resend**
   ```bash
   npm install resend
   ```

3. **Update server.js**
   - Replace `EmailService` class with Resend API calls
   - Add API key to `.env` file

4. **Example Code**:
   ```javascript
   import { Resend } from 'resend';
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   await resend.emails.send({
     from: 'noreply@bloom.com',
     to: email,
     subject: 'Verify your account',
     html: `<p>Your code is: ${code}</p>`
   });
   ```

## 💾 Data Storage

### Current: JSON Files
- Simple and works for demo
- Data stored in `server/data/` directory
- Files created automatically on first use

### Why JSON Files?
- **No setup required** - works immediately
- **Easy to understand** - you can see the data
- **Perfect for demo** - shows data persistence
- **Easy to migrate** - can switch to database later

### Production Upgrade
Replace JSON file operations with:
- **PostgreSQL** (relational database)
- **MongoDB** (NoSQL database)
- **Supabase** (backend-as-a-service)

## 🔒 Security Features

1. **Password Hashing**: Passwords are hashed on frontend before sending
2. **Email Verification**: Users must verify email before login
3. **CORS Protection**: Only allows requests from frontend
4. **Input Validation**: Validates all incoming data
5. **Secure Storage**: API keys stored in environment variables (when using real email)

## 📝 For Your Presentation

### Key Points to Mention:

1. **"I built a full-stack application"**
   - Frontend: React for user interface
   - Backend: Node.js/Express for server logic
   - Demonstrates understanding of both sides

2. **"I implemented proper security practices"**
   - Email verification
   - Password hashing
   - Secure API design

3. **"I designed a RESTful API"**
   - Standard HTTP methods (GET, POST, PUT, DELETE)
   - Clear endpoint structure
   - Proper status codes

4. **"I separated concerns properly"**
   - Frontend handles UI/UX
   - Backend handles business logic and security
   - Data persistence separate from both

5. **"The architecture is scalable"**
   - Easy to replace JSON files with database
   - Easy to add real email service
   - Modular code structure

### Demo Flow:

1. **Show the backend running**
   ```bash
   cd server
   npm start
   ```

2. **Show API endpoints working**
   - Visit `http://localhost:3001/api/products`
   - Show JSON response

3. **Show email service**
   - Trigger signup
   - Show email logged to console

4. **Show data persistence**
   - Create a user
   - Show `data/users.json` file
   - Restart server
   - Show data still exists

## 🛠️ Troubleshooting

### Port Already in Use
Change port in `server.js`:
```javascript
const PORT = process.env.PORT || 3002; // Use different port
```

### CORS Errors
Already configured, but if issues:
```javascript
app.use(cors({
  origin: 'http://localhost:5173' // Your frontend URL
}));
```

### Data Not Persisting
Check that `server/data/` directory exists and is writable.

## 📚 Learning Resources

- **Express.js**: https://expressjs.com
- **RESTful API Design**: https://restfulapi.net
- **Node.js**: https://nodejs.org

## 🎓 What This Demonstrates

✅ Full-stack development skills  
✅ API design and RESTful principles  
✅ Security best practices  
✅ Data persistence  
✅ Email service integration  
✅ Separation of concerns  
✅ Scalable architecture  

---

**Note**: This is a demo/portfolio project. In production, you would:
- Use a real database (PostgreSQL, MongoDB)
- Use a real email service (Resend, SendGrid)
- Add authentication middleware (JWT tokens)
- Add rate limiting
- Add input sanitization
- Add logging and monitoring
