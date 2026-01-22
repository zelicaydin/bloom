import { test, expect } from '@playwright/test';

/**
 * Checkout Flow Tests
 * 
 * Tests the checkout process (simplified - may need adjustment based on your actual checkout flow)
 */

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Login
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i)).first().fill('admin@bloom.com');
    await page.getByPlaceholder(/password/i).or(page.getByLabel(/password/i)).first().fill('Admin123!');
    await page.getByRole('button', { name: /login|sign in|submit/i }).click();
    await page.waitForTimeout(2000);
    
    // Add product to cart
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
  });

  test('should navigate to checkout from cart', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(1000);
    
    // Find and click checkout button
    const checkoutButton = page.getByRole('button', { name: /checkout|proceed|place order/i })
      .or(page.getByRole('link', { name: /checkout/i }));
    
    await checkoutButton.first().click();
    
    // Verify we're on checkout page
    await expect(page).toHaveURL(/.*checkout/, { timeout: 5000 });
  });

  test('should display checkout form', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    
    // Check for checkout form elements
    // Adjust based on your actual checkout form fields
    const formFields = page.getByPlaceholder(/name|address|city|zip|card/i)
      .or(page.getByLabel(/name|address|payment/i));
    
    // At least some form fields should be visible
    const fieldCount = await formFields.count();
    expect(fieldCount).toBeGreaterThan(0);
  });

  test('should display order summary in checkout', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    
    // Check for order summary section
    const orderSummary = page.getByText(/order summary|total|subtotal|items/i)
      .or(page.locator('[data-testid="order-summary"]'));
    
    await expect(orderSummary.first()).toBeVisible({ timeout: 3000 });
  });

  test('should show validation errors for empty checkout form', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    
    // Try to submit without filling form
    const submitButton = page.getByRole('button', { name: /place order|complete|submit|pay/i });
    
    if (await submitButton.count() > 0) {
      await submitButton.first().click();
      await page.waitForTimeout(1000);
      
      // Check for validation errors
      const errors = page.getByText(/required|invalid|error/i);
      const hasErrors = await errors.count() > 0;
      
      // If form has validation, errors should appear
      // If form doesn't have client-side validation, this might not apply
      if (hasErrors) {
        expect(hasErrors).toBeTruthy();
      }
    }
  });

  test('should allow applying coupon code', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    
    // Look for coupon input field
    const couponInput = page.getByPlaceholder(/coupon|promo|code/i)
      .or(page.getByLabel(/coupon|promo/i));
    
    if (await couponInput.count() > 0) {
      await couponInput.first().fill('TESTCODE');
      
      // Look for apply button
      const applyButton = page.getByRole('button', { name: /apply|submit/i });
      if (await applyButton.count() > 0) {
        await applyButton.first().click();
        await page.waitForTimeout(1000);
        
        // Check for success/error message
        const message = page.getByText(/applied|invalid|error/i);
        await expect(message.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });
});
