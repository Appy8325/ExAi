import { defineConfig, devices } from '@playwright/test';

// E2E tier (doc 42 §9): cross-surface persona flows against a real running Next.js app.
// Milestone 0 only wires the runner + one smoke spec (see e2e/smoke.spec.ts); the full
// @smoke/@offline/@a11y tagging strategy from doc 42 §9-§11 lands with the features it covers.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
