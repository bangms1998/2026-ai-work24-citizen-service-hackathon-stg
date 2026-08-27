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

test('supplied transparent logo and self-hosted font render as real assets', async ({ page }) => {
  await page.goto('/');
  const logo = page.locator('.brand img');
  await expect(logo).toBeVisible();
  expect(await logo.evaluate((image) => image.naturalWidth)).toBe(106);
  expect(await logo.evaluate((image) => image.naturalHeight)).toBe(36);
  await page.waitForFunction(() => document.fonts.check('16px "Wanted Sans Variable"'));
});

test('editorial hero image remains decorative, responsive and reduced-motion safe', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const image = page.locator('.hero-media img');
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('alt', '');
  expect(await image.evaluate((el) => el.complete && el.naturalWidth > 0)).toBeTruthy();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const transition = await page.locator('.glass-action').first().evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(transition).toBe('0s');
});

test('admin action bar never covers the Google Form field', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin.html');
  const inputBox = await page.getByLabel('Google Form URL').boundingBox();
  const actionsBox = await page.locator('.admin-actions').boundingBox();
  expect(inputBox.y + inputBox.height).toBeLessThanOrEqual(actionsBox.y);
});

test('header is logo-only and mobile control is a real hamburger icon', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.brand')).toHaveText('');
  await expect(page.locator('.brand-divider, .brand-title')).toHaveCount(0);
  const menu = page.getByRole('button', { name: '주요 메뉴 열기' });
  await expect(menu).toHaveText('');
  await expect(menu.locator('span')).toHaveCount(3);
});

test('decorative English labels are removed and title leading is relaxed', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.eyebrow, .section-kicker')).toHaveCount(0);
  const lineHeight = await page.locator('.hero h1').evaluate((el) => parseFloat(getComputedStyle(el).lineHeight) / parseFloat(getComputedStyle(el).fontSize));
  expect(lineHeight).toBeGreaterThanOrEqual(1.18);
});

test('notice and FAQ cards have measured vertical spacing', async ({ page }) => {
  for (const path of ['/notice.html', '/faq.html']) {
    await page.goto(path);
    const cards = page.locator('.content > .content-card');
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    expect(second.y - (first.y + first.height)).toBeGreaterThanOrEqual(20);
  }
});

test('inquiry page has a dedicated synthetic-safe form journey', async ({ page }) => {
  await page.goto('/inquiry.html');
  await page.getByLabel('문의 유형').selectOption('general');
  await page.getByLabel('이름').fill('테스트 사용자');
  await page.getByLabel('이메일').fill('test@example.com');
  await page.getByLabel('문의 제목').fill('테스트 문의');
  await page.getByLabel('문의 내용').fill('실제 개인정보가 아닌 테스트 문의 내용입니다.');
  await page.getByLabel(/개인정보 수집·이용 안내에 동의/).check();
  await page.getByRole('button', { name: '테스트 문의 제출' }).click();
  await expect(page.getByRole('status')).toContainText('TEST 문의가 확인되었습니다');
});

test('footer uses the original logo without a white logo patch', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('.site-footer');
  expect(await footer.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)');
  expect(await footer.locator('img').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
});

test('public pages never expose file line-number artifacts', async ({ page }) => {
  for (const route of ['/guide.html', '/notice.html', '/faq.html', '/winners.html']) {
    await page.goto(route);
    expect((await page.locator('body').innerText()).startsWith('1|')).toBeFalsy();
  }
});
