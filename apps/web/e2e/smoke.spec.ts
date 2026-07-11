import { test, expect } from '@playwright/test';

// Milestone 0 scaffolding smoke test: proves the Playwright runner + dev webServer wiring works
// end to end (doc 42 §9), not a business-feature test. Visits the marketing home page
// (apps/web/src/app/(marketing)/page.tsx) and asserts it loads successfully.
test('marketing home page loads', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Concourse — Milestone 0 shell' })).toBeVisible();
});
