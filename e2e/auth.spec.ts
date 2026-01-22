import { test, expect } from '@playwright/test';

/**
 * Authentication Flow Tests
 * 
 * Tests user registration, login, and logout functionality
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page when clicking login', async ({ page }) => {
    // Find and click the "Sign In" button in navbar
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();

    // Verify we're on the login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByPlaceholder(/your\.email@example\.com/i)).toBeVisible();
    await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
  });

  test('should display signup page when clicking sign up', async ({ page }) => {
    // First go to login page, then click sign up link
    await page.goto('/login');
    await page.waitForTimeout(1000);
    
    // Find and click the signup link at bottom of login form
    const signupLink = page.getByText(/sign up/i).filter({ hasText: /sign up/i });
    await signupLink.first().click();

    // Verify we're on the signup page
    await expect(page).toHaveURL(/.*signup/, { timeout: 5000 });
    await expect(page.getByPlaceholder(/your\.email@example\.com/i)).toBeVisible({ timeout: 3000 });
  });
});
