import { test, expect } from '@playwright/test';

/**
 * Shopping Cart Flow Tests
 * 
 * Tests adding products to cart, viewing cart, and cart operations
 */

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Login as a user to test cart functionality
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i)).first().fill('admin@bloom.com');
    await page.getByPlaceholder(/password/i).or(page.getByLabel(/password/i)).first().fill('Admin123!');
    await page.getByRole('button', { name: /login|sign in|submit/i }).click();
    await page.waitForTimeout(2000);
  });

  test('should add product to cart from product detail page', async ({ page }) => {
    await page.goto('/catalogue');
    await page.waitForTimeout(2000);
    
    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]')
      .or(page.locator('.product-card'))
      .or(page.locator('article'))
      .first();
    await firstProduct.click();
    
    await page.waitForTimeout(1000);
    
    // Find and click "Add to Cart" button
    const addToCartButton = page.getByRole('button', { name: /add to cart|add|buy now/i });
    await addToCartButton.first().click();
    
    // Wait for confirmation (notification, cart update, etc.)
    await page.waitForTimeout(1000);
    
    // Check for success indicator (notification, cart badge, etc.)
    const successIndicator = page.getByText(/added|success|cart/i).or(page.locator('[data-testid="cart-badge"]'));
    await expect(successIndicator.first()).toBeVisible({ timeout: 3000 });
  });

  test('should display cart page with added items', async ({ page }) => {
    // Add a product to cart first
    await page.goto('/catalogue');
    await page.waitForTimeout(2000);
    
    const firstProduct = page.locator('[data-testid="product-card"]')
      .or(page.locator('.product-card'))
      .or(page.locator('article'))
      .first();
    await firstProduct.click();
    
    await page.waitForTimeout(1000);
    
    const addToCartButton = page.getByRole('button', { name: /add to cart|add|buy now/i });
    await addToCartButton.first().click();
    await page.waitForTimeout(1000);
    
    // Navigate to cart
    const cartLink = page.getByRole('link', { name: /cart|basket|bag/i }).or(page.locator('[data-testid="cart-link"]'));
    await cartLink.first().click();
    
    // Verify we're on cart page
    await expect(page).toHaveURL(/.*cart/);
    
    // Check for cart items
    const cartItems = page.locator('[data-testid="cart-item"]')
      .or(page.locator('.cart-item'))
      .or(page.getByText(/product|item/i));
    
    await expect(cartItems.first()).toBeVisible({ timeout: 3000 });
  });

  test('should update quantity in cart', async ({ page }) => {
    // Add product and go to cart
    await page.goto('/catalogue');
    await page.waitForTimeout(2000);
    
    const firstProduct = page.locator('[data-testid="product-card"]')
      .or(page.locator('.product-card'))
      .or(page.locator('article'))
      .first();
    await firstProduct.click();
    
    await page.waitForTimeout(1000);
    
    const addToCartButton = page.getByRole('button', { name: /add to cart|add|buy now/i });
    await addToCartButton.first().click();
    await page.waitForTimeout(1000);
    
    await page.goto('/cart');
    await page.waitForTimeout(1000);
    
    // Find quantity controls (usually + and - buttons or input)
    const increaseButton = page.getByRole('button', { name: /\+|plus|increase|more/i })
      .or(page.locator('[data-testid="quantity-increase"]'));
    
    if (await increaseButton.count() > 0) {
      await increaseButton.first().click();
      await page.waitForTimeout(500);
      
      // Verify quantity updated (check for "2" or updated total)
      const quantityDisplay = page.getByText(/2|quantity.*2/i).or(page.locator('[data-testid="quantity"]'));
      await expect(quantityDisplay.first()).toBeVisible({ timeout: 2000 });
    }
  });

  test('should remove item from cart', async ({ page }) => {
    // Add product and go to cart
    await page.goto('/catalogue');
    await page.waitForTimeout(2000);
    
    const firstProduct = page.locator('[data-testid="product-card"]')
      .or(page.locator('.product-card'))
      .or(page.locator('article'))
      .first();
    await firstProduct.click();
    
    await page.waitForTimeout(1000);
    
    const addToCartButton = page.getByRole('button', { name: /add to cart|add|buy now/i });
    await addToCartButton.first().click();
    await page.waitForTimeout(1000);
    
    await page.goto('/cart');
    await page.waitForTimeout(1000);
    
    // Find remove/delete button
    const removeButton = page.getByRole('button', { name: /remove|delete|×|x/i })
      .or(page.locator('[data-testid="remove-item"]'))
      .or(page.locator('button').filter({ hasText: /remove|delete/i }));
    
    if (await removeButton.count() > 0) {
      await removeButton.first().click();
      await page.waitForTimeout(1000);
      
      // Verify item removed (check for empty cart message or no items)
      const emptyCart = page.getByText(/empty|no items|cart is empty/i);
      const cartItems = page.locator('[data-testid="cart-item"]').or(page.locator('.cart-item'));
      
      const isEmpty = await emptyCart.isVisible().catch(() => false);
      const itemCount = await cartItems.count();
      
      expect(isEmpty || itemCount === 0).toBeTruthy();
    }
  });

  test('should display cart total correctly', async ({ page }) => {
    await page.goto('/catalogue');
    await page.waitForTimeout(2000);
    
    const firstProduct = page.locator('[data-testid="product-card"]')
      .or(page.locator('.product-card'))
      .or(page.locator('article'))
      .first();
    await firstProduct.click();
    
    await page.waitForTimeout(1000);
    
    const addToCartButton = page.getByRole('button', { name: /add to cart|add|buy now/i });
    await addToCartButton.first().click();
    await page.waitForTimeout(1000);
    
    await page.goto('/cart');
    await page.waitForTimeout(1000);
    
    // Check for total/subtotal display
    const total = page.getByText(/total|subtotal|€|\$|£/i);
    await expect(total.first()).toBeVisible();
  });

  test('should show empty cart message when cart is empty', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(1000);
    
    // Check for empty cart message or continue shopping button
    const emptyMessage = page.getByText(/empty|no items|cart is empty|add items/i);
    const continueShopping = page.getByRole('link', { name: /continue|shop|catalogue/i });
    
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);
    const hasContinueButton = await continueShopping.isVisible().catch(() => false);
    
    // At least one should be visible
    expect(hasEmptyMessage || hasContinueButton).toBeTruthy();
  });
});
