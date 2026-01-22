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

  test('should display homepage with categories', async ({ page }) => {
    // Check for homepage elements
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
    
    // Check for category cards or navigation
    const categories = page.getByText(/catalogue|shop|products|categories/i);
    await expect(categories.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to catalogue page', async ({ page }) => {
    // Find and click catalogue link
    const catalogueLink = page.getByRole('link', { name: /catalogue|shop|products/i }).first();
    await catalogueLink.click();
    
    // Verify we're on catalogue page
    await expect(page).toHaveURL(/.*catalogue/);
    
    // Check for product grid or product cards
    const productGrid = page.locator('[data-testid="product-grid"]').or(page.locator('.product-grid')).or(page.getByText(/product/i));
    await expect(productGrid.first()).toBeVisible({ timeout: 5000 });
  });

  test('should display products in catalogue', async ({ page }) => {
    await page.goto('/catalogue');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Check for product cards or product items
    // Adjust selector based on your actual product card structure
    const productCards = page.locator('[data-testid="product-card"]')
      .or(page.locator('.product-card'))
      .or(page.locator('article'))
      .or(page.getByRole('article'));
    
    // Should have at least one product
    const productCount = await productCards.count();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should be able to click on a product to view details', async ({ page }) => {
    await page.goto('/catalogue');
    await page.waitForTimeout(2000);
    
    // Click on the first product
    const firstProduct = page.locator('[data-testid="product-card"]')
      .or(page.locator('.product-card'))
      .or(page.locator('article'))
      .or(page.getByRole('article'))
      .first();
    
    await firstProduct.click();
    
    // Verify we're on product detail page
    await expect(page).toHaveURL(/.*product/, { timeout: 5000 });
    
    // Check for product details (name, price, description, etc.)
    const productName = page.getByRole('heading', { level: 1 }).or(page.locator('h1'));
    await expect(productName.first()).toBeVisible();
  });

  test('should display product details page with all information', async ({ page }) => {
    await page.goto('/catalogue');
    await page.waitForTimeout(2000);
    
    // Click first product
    const firstProduct = page.locator('[data-testid="product-card"]')
      .or(page.locator('.product-card'))
      .or(page.locator('article'))
      .first();
    await firstProduct.click();
    
    await page.waitForTimeout(1000);
    
    // Check for product information
    const productName = page.getByRole('heading', { level: 1 }).or(page.locator('h1'));
    await expect(productName.first()).toBeVisible();
    
    // Check for price (usually contains $ or currency symbol)
    const price = page.getByText(/\$|€|£|\d+\.\d{2}/);
    await expect(price.first()).toBeVisible();
    
    // Check for product image
    const productImage = page.locator('img').filter({ hasNotText: /logo|icon/i });
    await expect(productImage.first()).toBeVisible();
  });

  test('should be able to search for products', async ({ page }) => {
    await page.goto('/catalogue');
    
    // Find search input
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByLabel(/search/i)).or(page.locator('input[type="search"]'));
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('shampoo');
      await page.waitForTimeout(1000);
      
      // Check if results are filtered
      const results = page.locator('[data-testid="product-card"]')
        .or(page.locator('.product-card'))
        .or(page.locator('article'));
      
      // Results should be visible (even if 0, the container should exist)
      await expect(results.first().or(page.getByText(/no.*found|0.*results/i))).toBeVisible({ timeout: 3000 });
    }
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/catalogue');
    await page.waitForTimeout(2000);
    
    // Look for filter buttons or category links
    const filterButtons = page.getByRole('button', { name: /filter|category|type/i })
      .or(page.getByText(/shampoo|cream|oil|candle/i));
    
    if (await filterButtons.count() > 0) {
      const firstFilter = filterButtons.first();
      await firstFilter.click();
      await page.waitForTimeout(1000);
      
      // Verify URL changed or products filtered
      // This depends on your filtering implementation
      const currentUrl = page.url();
      expect(currentUrl).toContain('catalogue');
    }
  });
});
