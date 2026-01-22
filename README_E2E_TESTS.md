# E2E Tests with Playwright

This project uses [Playwright](https://playwright.dev) for end-to-end testing.

## 📁 Test Location

All e2e tests are located in the `e2e/` directory:
- `e2e/auth.spec.ts` - Authentication flows (login, signup, logout)
- `e2e/product-browsing.spec.ts` - Product browsing and search
- `e2e/shopping-cart.spec.ts` - Shopping cart operations
- `e2e/checkout.spec.ts` - Checkout process
- `e2e/admin.spec.ts` - Admin panel functionality

## 🚀 Getting Started

### 1. Install VS Code Extension (Optional)

**Extension Name:** "Playwright Test for VSCode" by Microsoft  
**Extension ID:** `ms-playwright.playwright`

**Installation Methods:**
1. **Via VS Code:**
   - Open Extensions (Cmd+Shift+X / Ctrl+Shift+X)
   - Search for "Playwright Test for VSCode"
   - Install the extension by Microsoft

2. **Via Command Palette:**
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type: `Extensions: Install Extensions`
   - Paste: `ms-playwright.playwright`
   - Press Enter

3. **Via Web:**
   - Visit: https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright
   - Click "Install" (opens VS Code)

**Note:** The extension is optional! You can run all tests via CLI commands (see below).

### 2. Run Tests

```bash
# Run all tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug
```

### 3. Run Specific Test File

```bash
# Run only auth tests
npx playwright test e2e/auth.spec.ts

# Run only cart tests
npx playwright test e2e/shopping-cart.spec.ts
```

### 4. View Test Results

After running tests, open the HTML report:
```bash
npx playwright show-report
```

## 📝 Test Structure

Each test file follows Playwright best practices:
- Uses `test.describe()` to group related tests
- Uses `test.beforeEach()` for setup
- Uses descriptive test names
- Includes proper waits and assertions

## 🔧 Configuration

The Playwright configuration is in `playwright.config.ts`:
- Tests run against `http://localhost:5173` (Vite dev server)
- Automatically starts dev server before tests
- Runs on Chromium, Firefox, and WebKit
- Generates HTML reports on failure

## 🎯 Test Coverage

### Authentication (`auth.spec.ts`)
- ✅ Login page navigation
- ✅ Signup page navigation
- ✅ Form validation
- ✅ Successful login
- ✅ Invalid credentials handling
- ✅ Logout functionality

### Product Browsing (`product-browsing.spec.ts`)
- ✅ Homepage display
- ✅ Catalogue navigation
- ✅ Product listing
- ✅ Product detail view
- ✅ Product search
- ✅ Category filtering

### Shopping Cart (`shopping-cart.spec.ts`)
- ✅ Add to cart
- ✅ View cart
- ✅ Update quantity
- ✅ Remove items
- ✅ Cart total calculation
- ✅ Empty cart state

### Checkout (`checkout.spec.ts`)
- ✅ Navigate to checkout
- ✅ Checkout form display
- ✅ Order summary
- ✅ Form validation
- ✅ Coupon code application

### Admin Panel (`admin.spec.ts`)
- ✅ Admin panel access
- ✅ Dashboard tabs
- ✅ Users list
- ✅ Products list
- ✅ Add new product

## 🐛 Debugging Tests

### Using VS Code Extension

1. Open the test file in VS Code
2. Click the "Run Test" button above the test
3. Use breakpoints to debug
4. Step through test execution

### Using Playwright Inspector

```bash
# Run with inspector
npx playwright test --debug

# Run specific test with inspector
npx playwright test e2e/auth.spec.ts --debug
```

### Viewing Traces

When a test fails, Playwright generates a trace:
```bash
npx playwright show-trace trace.zip
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [VS Code Extension](https://playwright.dev/docs/getting-started-vscode)

## ⚠️ Notes

- Tests require the dev server to be running (automatically started)
- Some tests use admin credentials (`admin@bloom.com` / `Admin123!`)
- Tests include timeouts and waits to handle async operations
- Selectors are flexible to handle different UI implementations
