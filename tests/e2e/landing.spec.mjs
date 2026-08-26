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

test('admin prototype requires a valid dirty draft before applying a version', async ({ page }) => {
  await page.goto('/admin.html');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('콘텐츠 관리자');
  const apply = page.getByRole('button', { name: '변경사항 적용' });
  await expect(apply).toBeDisabled();
  await page.getByLabel('공모전 제목').fill('2026 AI 고용24 국민참여 서비스 발굴 온라인 해커톤 수정안');
  await expect(apply).toBeEnabled();
  await page.getByRole('button', { name: '미리보기' }).click();
  await expect(page.getByRole('dialog')).toContainText('2026 AI 고용24');
  await page.getByRole('button', { name: '미리보기 닫기' }).click();
  await apply.click();
  await expect(page.getByText(/버전 v1 적용 완료/)).toBeVisible();
  await expect(apply).toBeDisabled();
});

test('official logo and self-hosted font render as real assets', async ({ page }) => {
  await page.goto('/');
  const logo = page.locator('.brand img');
  await expect(logo).toBeVisible();
  expect(await logo.evaluate((image) => image.naturalWidth)).toBe(108);
  await page.waitForFunction(() => document.fonts.check('16px "Wanted Sans Variable"'));
});

test('admin action bar never covers the Google Form field', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin.html');
  const inputBox = await page.getByLabel('Google Form URL').boundingBox();
  const actionsBox = await page.locator('.admin-actions').boundingBox();
  expect(inputBox.y + inputBox.height).toBeLessThanOrEqual(actionsBox.y);
});
