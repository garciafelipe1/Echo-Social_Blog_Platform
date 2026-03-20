import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/login/);
    // Login form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  });

  test('should show validation on empty submit', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Should stay on login (validation prevents submit)
      await expect(page).toHaveURL(/login/);
    }
  });

  test('login flow: email -> OTP -> redirect to home (mocked API)', async ({ page }) => {
    // Mock API responses for full login flow
    await page.route('**/api/auth/send_otp_login/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 200 }) })
    );
    await page.route('**/api/auth/verify_otp_login/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    );
    await page.route('**/api/auth/user**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
        }),
      })
    );
    await page.route('**/api/auth/profile/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: {} }),
      })
    );

    await page.goto('/login');
    await expect(page).toHaveURL(/login/);

    // Step 1: enter email and submit
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill('test@example.com');
    await page.locator('button[type="submit"]').first().click();

    // Step 2: OTP form should appear
    const otpInput = page.locator('input[placeholder*="OTP"], input[placeholder*="código"], input[type="text"]').first();
    await expect(otpInput).toBeVisible({ timeout: 5000 });

    // Enter OTP and submit
    await otpInput.fill('123456');
    await page.locator('button[type="submit"]').first().click();

    // Should redirect to home
    await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 10000 });
  });
});
