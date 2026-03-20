import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Echo|Blog|Feed/i);
    // Page content should be visible (feed, empty state, or loading)
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have navigation', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible({ timeout: 5000 });
  });
});
