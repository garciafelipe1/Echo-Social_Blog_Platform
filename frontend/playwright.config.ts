import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PLAYWRIGHT_PORT || 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: process.env.CI
      ? `npm run build && npx next start -p ${PORT}`
      : `npx next dev --turbopack -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: process.env.CI ? 120_000 : 60_000,
  },
});
