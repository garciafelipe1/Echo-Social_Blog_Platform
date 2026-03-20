import { test, expect } from '@playwright/test';

test.describe('Blog page', () => {
  test('should load blog page', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveURL(/blog/);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should show blog content area', async ({ page }) => {
    await page.goto('/blog');
    const main = page.locator('main, [role="main"], .blog, article').first();
    await expect(main).toBeVisible({ timeout: 5000 });
  });
});
