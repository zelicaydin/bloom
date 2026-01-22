import { test, expect } from '@playwright/test';

/**
 * Product Browsing Flow Tests
 * 
 * Tests browsing products, viewing product details, and searching
 */

test.describe('Product Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display products in catalogue', async ({ page }) => {
    await page.goto('/catalogue');
    
    // Wait for products to load
    await page.waitForTimeout(3000);
    
    // Check for product names - they're h3 elements
    const productNames = page.locator('h3');
    const productCount = await productNames.count();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should be able to click on a product to view details', async ({ page }) => {
    await page.goto('/catalogue');
    await page.waitForTimeout(3000);
    
    // Click on the first product name (h3)
    const firstProductName = page.locator('h3').first();
    await firstProductName.click();
    
    // Verify we're on product detail page
    await expect(page).toHaveURL(/.*product/, { timeout: 5000 });
    
    // Check for product details - h1 heading
    const productName = page.getByRole('heading', { level: 1 });
    await expect(productName.first()).toBeVisible({ timeout: 3000 });
  });

  test('should display product details page with all information', async ({ page }) => {
    await page.goto('/catalogue');
    await page.waitForTimeout(3000);
    
    // Click first product name
    const firstProductName = page.locator('h3').first();
    await firstProductName.click();
    
    await page.waitForTimeout(2000);
    
    // Check for product information
    const productName = page.getByRole('heading', { level: 1 });
    await expect(productName.first()).toBeVisible({ timeout: 3000 });
    
    // Check for price (contains $)
    const price = page.getByText(/\$/);
    await expect(price.first()).toBeVisible();
    
    // Check for product image
    const productImage = page.locator('img').first();
    await expect(productImage).toBeVisible();
  });
});
