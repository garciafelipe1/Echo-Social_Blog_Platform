import { test, expect } from '@playwright/test';

test.describe('Register page', () => {
  test('should load register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/register/);
    const form = page.locator('form').first();
    await expect(form).toBeVisible({ timeout: 5000 });
  });

  test('should have email and password fields', async ({ page }) => {
    await page.goto('/register');
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
  });
});
