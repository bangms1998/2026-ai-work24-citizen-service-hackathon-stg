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
  await expect(page.getByRole('heading', { level: 1 })).toContainText('관리자 홈');
  await page.getByRole('navigation', { name: '관리자 메뉴' }).getByRole('button', { name: '사이트 콘텐츠' }).click();
  const apply = page.getByRole('button', { name: '변경사항 적용' });
  await expect(apply).toBeDisabled();
  await page.getByLabel('공모전 제목').fill('2026 AI 고용24 국민참여 서비스 발굴 온라인 해커톤 수정안');
  await expect(apply).toBeEnabled();
  await page.getByRole('button', { name: '전체 사이트 미리보기' }).click();
  await expect(page.getByRole('dialog')).toContainText('2026 AI 고용24');
  await page.getByRole('button', { name: '미리보기 닫기' }).click();
  await apply.click();
  await expect(page.getByText(/v1을 TEST 브라우저에 적용/)).toBeVisible();
  await expect(apply).toBeDisabled();
});

test('white hero logo switches to the dark logo when the header becomes solid', async ({ page }) => {
  await page.goto('/');
  const light = page.locator('.logo-light');
  const dark = page.locator('.logo-dark');
  await expect(light).toBeVisible();
  await expect(dark).toBeHidden();
  expect(await light.evaluate((image) => image.naturalWidth)).toBe(106);
  expect(await light.evaluate((image) => image.naturalHeight)).toBe(36);
  expect(await page.locator('.brand').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  await page.evaluate(() => scrollTo(0, 900));
  await expect(light).toBeHidden();
  await expect(dark).toBeVisible();
  await page.waitForFunction(() => document.fonts.check('16px "Wanted Sans Variable"'));
});

test('overview uses one visual and four calm fact rows', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.overview-brief > .overview-visual')).toHaveCount(1);
  await expect(page.locator('.overview-facts > li')).toHaveCount(4);
  await expect(page.locator('.overview-section .recommend-card')).toHaveCount(0);
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
  await page.getByRole('navigation', { name: '관리자 메뉴' }).getByRole('button', { name: '사이트 콘텐츠' }).click();
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

test('notice rows and FAQ cards preserve readable vertical rhythm', async ({ page }) => {
  await page.goto('/notice.html');
  const rows = page.locator('.notice-board tbody tr');
  expect((await rows.nth(1).boundingBox()).y - (await rows.nth(0).boundingBox()).y).toBeGreaterThanOrEqual(70);
  await page.goto('/faq.html');
  const cards = page.locator('.content > .content-card');
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(second.y - (first.y + first.height)).toBeGreaterThanOrEqual(20);
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

test('transparent hero header becomes readable on scroll and top control returns home viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const header = page.locator('.site-header');
  await expect(header).not.toHaveClass(/is-scrolled/);
  await page.evaluate(() => scrollTo(0, 900));
  await expect(header).toHaveClass(/is-scrolled/);
  const top = page.locator('.to-top');
  await expect(top).toHaveClass(/is-visible/);
  await top.click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(10);
});

test('notice page uses the accessible four-column board and mobile card labels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/notice.html');
  await expect(page.getByRole('table', { name: '공지사항 목록' })).toBeVisible();
  await expect(page.locator('.notice-board tbody tr')).toHaveCount(2);
  await expect(page.locator('.notice-board td[data-label="작성일"]').first()).toBeVisible();
});

test('notice board follows the monochrome editorial palette rather than the reference navy', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/notice.html');
  const head = page.locator('.notice-board thead');
  expect(await head.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(243, 243, 241)');
  expect(await page.locator('.notice-board').evaluate((el) => getComputedStyle(el).borderTopColor)).toBe('rgb(17, 17, 18)');
});

test('admin workspace exposes every operations area, preserves dirty-state safety, and matches the editorial palette', async ({ page }) => {
  await page.goto('/admin.html');
  const nav = page.getByRole('navigation', { name: '관리자 메뉴' });
  for (const label of ['관리자 홈', '공지사항', 'FAQ', '팝업', '사이트 콘텐츠', '문의 관리']) await expect(nav.getByRole('button', { name: label })).toBeVisible();
  const logo = page.locator('.admin-brand img');
  await expect(logo).toHaveAttribute('src', /work24-logo-white\.png/);
  await expect(logo).toBeVisible();
  expect(await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(245, 245, 242)');
  expect(await page.locator('.admin-header').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(17, 17, 18)');
  expect(await page.locator('.admin-kpis article').first().evaluate((el) => getComputedStyle(el).borderTopColor)).toBe('rgb(17, 17, 18)');
  await nav.getByRole('button', { name: '사이트 콘텐츠' }).click();
  const apply = page.getByRole('button', { name: '변경사항 적용' });
  await expect(apply).toBeDisabled();
  await page.getByLabel('Hero 제목').fill('고용24 AI 서비스 아이디어 수정안');
  await expect(apply).toBeEnabled();
  await nav.getByRole('button', { name: '문의 관리' }).click();
  await expect(page.getByRole('button', { name: 'CSV 내려받기' })).toBeVisible();
});

for (const width of [390, 768, 1440]) test(`editorial admin has no horizontal overflow at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/admin.html');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
