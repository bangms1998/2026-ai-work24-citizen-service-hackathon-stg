import { test, expect } from '@playwright/test';

test('Google Form pre-open journey is explicit and safe', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('고용24');
  await expect(page.getByRole('button', { name: /접수/ })).toBeDisabled();
  await expect(page.getByText(/Google Form/).first()).toBeVisible();
});

for (const width of [390, 768, 1440]) {
  test(`responsive home has no horizontal overflow at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}
