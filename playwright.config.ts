import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PW_PORT || 5173);
const baseURL = process.env.PW_BASE_URL || `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list'], ['html']],
  timeout: process.env.CI ? 90_000 : 45_000,
  expect: {
    timeout: process.env.CI ? 15_000 : 8_000,
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    // Use full dev stack (API proxy expects dev-api-server on :3001)
    command: `npm run dev:e2e`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 180_000 : 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

