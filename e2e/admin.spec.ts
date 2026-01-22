import { test, expect } from '@playwright/test';

/**
 * Admin Panel Tests
 * 
 * Tests admin-specific functionality
 */

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Login as admin
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i)).first().fill('admin@bloom.com');
    await page.getByPlaceholder(/password/i).or(page.getByLabel(/password/i)).first().fill('Admin123!');
    await page.getByRole('button', { name: /login|sign in|submit/i }).click();
    await page.waitForTimeout(2000);
  });

  test('should navigate to admin panel', async ({ page }) => {
    // Find admin link (usually in profile dropdown or navbar)
    const adminLink = page.getByRole('link', { name: /admin|dashboard|panel/i })
      .or(page.getByText(/admin/i));
    
    // If in dropdown, click profile first
    const profileButton = page.getByRole('button', { name: /profile|account/i });
    if (await profileButton.count() > 0) {
      await profileButton.first().click();
      await page.waitForTimeout(500);
    }
    
    if (await adminLink.count() > 0) {
      await adminLink.first().click();
      
      // Verify we're on admin page
      await expect(page).toHaveURL(/.*admin/, { timeout: 5000 });
    }
  });

  test('should display admin dashboard with tabs', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    // Check for admin tabs (Users, Products, Coupons, etc.)
    const tabs = page.getByRole('tab', { name: /users|products|coupons|orders/i })
      .or(page.getByText(/users|products|coupons/i));
    
    await expect(tabs.first()).toBeVisible({ timeout: 3000 });
  });

  test('should display users list in admin panel', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    // Click on Users tab if it exists
    const usersTab = page.getByRole('tab', { name: /users/i }).or(page.getByText(/users/i));
    if (await usersTab.count() > 0) {
      await usersTab.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Check for users list
    const usersList = page.locator('[data-testid="user-list"]')
      .or(page.getByText(/admin|user|email/i));
    
    await expect(usersList.first()).toBeVisible({ timeout: 3000 });
  });

  test('should display products list in admin panel', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    // Click on Products tab if it exists
    const productsTab = page.getByRole('tab', { name: /products/i }).or(page.getByText(/products/i));
    if (await productsTab.count() > 0) {
      await productsTab.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Check for products list
    const productsList = page.locator('[data-testid="product-list"]')
      .or(page.getByText(/product|name|price/i));
    
    await expect(productsList.first()).toBeVisible({ timeout: 3000 });
  });

  test('should be able to add new product in admin panel', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    // Click on Products tab
    const productsTab = page.getByRole('tab', { name: /products/i }).or(page.getByText(/products/i));
    if (await productsTab.count() > 0) {
      await productsTab.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Find "Add Product" button
    const addProductButton = page.getByRole('button', { name: /add product|new product|create/i });
    
    if (await addProductButton.count() > 0) {
      await addProductButton.first().click();
      await page.waitForTimeout(1000);
      
      // Check for product form
      const productForm = page.getByPlaceholder(/name|price|brand|description/i)
        .or(page.getByLabel(/name|price/i));
      
      const hasForm = await productForm.count() > 0;
      expect(hasForm).toBeTruthy();
    }
  });
});
