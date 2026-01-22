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
    await page.getByPlaceholder(/your\.email@example\.com/i).fill('admin@bloom.com');
    await page.getByPlaceholder(/enter your password/i).fill('Admin123!');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForTimeout(3000);
    
    // Handle remember me modal if it appears
    const dontRememberButton = page.getByRole('button', { name: /don't remember/i });
    if (await dontRememberButton.isVisible().catch(() => false)) {
      await dontRememberButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test('should add product to cart from product detail page', async ({ page }) => {
    await page.goto('/catalogue');
    await page.waitForTimeout(3000);
    
    // Click on first product name
    const firstProductName = page.locator('h3').first();
    await firstProductName.click();
    
    await page.waitForTimeout(2000);
    
    // Find and click "Add to Cart" button
    const addToCartButton = page.getByRole('button', { name: /add to cart/i });
    await addToCartButton.click();
    
    // Wait for confirmation
    await page.waitForTimeout(2000);
    
    // Check for cart badge or notification
    const cartBadge = page.locator('span').filter({ hasText: /^\d+$/ });
    const notification = page.getByText(/added|success/i);
    const hasBadge = await cartBadge.isVisible().catch(() => false);
    const hasNotification = await notification.isVisible().catch(() => false);
    
    expect(hasBadge || hasNotification).toBeTruthy();
  });

  test('should display cart page with added items', async ({ page }) => {
    // Add a product to cart first
    await page.goto('/catalogue');
    await page.waitForTimeout(3000);
    
    const firstProductName = page.locator('h3').first();
    await firstProductName.click();
    
    await page.waitForTimeout(2000);
    
    const addToCartButton = page.getByRole('button', { name: /add to cart/i });
    await addToCartButton.click();
    await page.waitForTimeout(2000);
    
    // Navigate to cart page directly
    await page.goto('/cart');
    await page.waitForTimeout(2000);
    
    // Verify we're on cart page
    await expect(page).toHaveURL(/.*cart/);
    
    // Check for cart items - they have product names as h3
    const cartItems = page.locator('h3');
    const itemCount = await cartItems.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('should show empty cart message when cart is empty', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(1000);
    
    // Check for empty cart message or continue shopping button
    const emptyMessage = page.getByText(/your cart is empty/i);
    const continueShopping = page.getByRole('button', { name: /continue shopping/i });
    
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);
    const hasContinueButton = await continueShopping.isVisible().catch(() => false);
    
    // At least one should be visible
    expect(hasEmptyMessage || hasContinueButton).toBeTruthy();
  });
});
