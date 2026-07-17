import { test, expect } from '@playwright/test';

// Marketing-home smoke test: proves the Playwright runner + dev webServer wiring
// works end to end (doc 42 §9). Visits the public marketing surface and asserts
// the hero heading renders without runtime errors.
test('marketing home page loads', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: /Trade shows that/i })).toBeVisible();
});
