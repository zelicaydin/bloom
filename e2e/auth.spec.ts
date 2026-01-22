import { test, expect } from '@playwright/test';

/**
 * Authentication Flow Tests
 * 
 * Tests user registration, login, and logout functionality
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
  });

  test('should display login page when clicking login', async ({ page }) => {
    // Find and click the login link/button
    const loginLink = page.getByRole('link', { name: /login/i }).or(page.getByText(/login/i)).first();
    await loginLink.click();

    // Verify we're on the login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i))).toBeVisible();
    await expect(page.getByPlaceholder(/password/i).or(page.getByLabel(/password/i))).toBeVisible();
  });

  test('should display signup page when clicking sign up', async ({ page }) => {
    // Find and click the signup link/button
    const signupLink = page.getByRole('link', { name: /sign up/i }).or(page.getByText(/sign up/i)).first();
    await signupLink.click();

    // Verify we're on the signup page
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i))).toBeVisible();
    await expect(page.getByPlaceholder(/password/i).or(page.getByLabel(/password/i))).toBeVisible();
  });

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /login|sign in|submit/i });
    await submitButton.click();

    // Check for validation errors (adjust selectors based on your actual error messages)
    const emailInput = page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i)).first();
    const passwordInput = page.getByPlaceholder(/password/i).or(page.getByLabel(/password/i)).first();
    
    // Wait a bit for validation to appear
    await page.waitForTimeout(500);
    
    // Check if inputs are marked as invalid or error messages appear
    const emailError = page.getByText(/email.*required|required.*email/i);
    const passwordError = page.getByText(/password.*required|required.*password/i);
    
    // At least one validation should appear
    const hasEmailError = await emailError.isVisible().catch(() => false);
    const hasPasswordError = await passwordError.isVisible().catch(() => false);
    
    expect(hasEmailError || hasPasswordError).toBeTruthy();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in login form (using admin credentials as they should always exist)
    await page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i)).first().fill('admin@bloom.com');
    await page.getByPlaceholder(/password/i).or(page.getByLabel(/password/i)).first().fill('Admin123!');
    
    // Submit form
    await page.getByRole('button', { name: /login|sign in|submit/i }).click();
    
    // Wait for navigation or success indicator
    // Adjust based on your app's behavior (might show a modal, redirect, etc.)
    await page.waitForTimeout(2000);
    
    // Verify user is logged in - check for user profile indicator or logout button
    const profileIndicator = page.getByText(/admin|profile|logout/i).or(page.locator('[data-testid="user-menu"]'));
    await expect(profileIndicator.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in with invalid credentials
    await page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i)).first().fill('invalid@example.com');
    await page.getByPlaceholder(/password/i).or(page.getByLabel(/password/i)).first().fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: /login|sign in|submit/i }).click();
    
    // Wait for error message
    await page.waitForTimeout(1000);
    
    // Check for error message
    const errorMessage = page.getByText(/incorrect|invalid|error|wrong/i);
    await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
  });

  test('should allow user to logout', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i)).first().fill('admin@bloom.com');
    await page.getByPlaceholder(/password/i).or(page.getByLabel(/password/i)).first().fill('Admin123!');
    await page.getByRole('button', { name: /login|sign in|submit/i }).click();
    await page.waitForTimeout(2000);
    
    // Find and click logout (usually in profile dropdown)
    const profileButton = page.getByRole('button', { name: /profile|account|user/i }).or(page.locator('[data-testid="profile-button"]'));
    await profileButton.first().click({ timeout: 5000 }).catch(async () => {
      // If no profile button, try clicking on user name/avatar
      await page.getByText(/admin|profile/i).first().click();
    });
    
    // Wait for dropdown/menu to appear
    await page.waitForTimeout(500);
    
    // Click logout
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i }).or(page.getByText(/logout|sign out/i));
    await logoutButton.first().click();
    
    // Verify user is logged out - should redirect to home or show login
    await page.waitForTimeout(1000);
    const loginLink = page.getByRole('link', { name: /login/i }).or(page.getByText(/login/i));
    await expect(loginLink.first()).toBeVisible({ timeout: 3000 });
  });
});
