import { test, expect } from '@playwright/test';

for (const width of [390, 768, 1440]) {
  test(`review stage has approved October 22 copy at ${width}`, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-14T10:00:00+09:00') });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const review = page.locator('[data-event="review"]');
    await expect(review.locator('time')).toHaveText('10.22');
    await expect(review.locator('.schedule-state')).toHaveText('심사 진행');
    await expect(review.locator('h3')).toHaveText('1차 심사·20팀 발표');
    await expect(review.locator('p')).toHaveText('아이디어 기획안 심사 및 선정팀 안내');
    await expect(review).toHaveClass(/is-next/);
    await expect(page.locator('#applyButton')).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });
}
