import { test, expect } from '@playwright/test';

test('application and attachment controls are active on staging', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('고용24');
  await expect(page.getByRole('button', { name: /접수/ })).toBeEnabled();
  await expect(page.getByRole('link', { name: '첨부파일 다운로드' })).toHaveAttribute('href', /고용24_AI_공모전_참고자료\.txt/);
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

test('overview uses one poster and only the contest name and subject', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.overview-brief > .overview-poster')).toHaveCount(1);
  await expect(page.locator('.overview-summary .overview-fact')).toHaveCount(2);
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
  for (const route of ['/', '/notice.html']) {
    await page.goto(route);
    await expect(page.locator('.eyebrow, .section-kicker')).toHaveCount(0);
  }
  await page.goto('/');
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

test('inquiry page has a dedicated preview-safe form journey', async ({ page }) => {
  await page.goto('/inquiry.html');
  await page.getByLabel('문의 유형').selectOption('general');
  await page.getByLabel('이름').fill('검수 사용자');
  await page.getByLabel('이메일').fill('test@example.com');
  await page.getByLabel('문의 제목').fill('검수 문의');
  await page.getByLabel('문의 내용').fill('실제 개인정보가 아닌 검수용 문의 내용입니다.');
  await page.getByLabel(/개인정보 수집·이용 안내에 동의/).check();
  await page.getByRole('button', { name: '문의 내용 확인' }).click();
  await expect(page.getByRole('status')).toContainText('문의 내용이 확인되었습니다');
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
  await expect(page.locator('#inquiryList')).toContainText('문의 내용');
});

for (const width of [390, 768, 1440]) test(`editorial admin has no horizontal overflow at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/admin.html');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('notice manager uploads a fitted image and edits image-top and image-bottom copy', async ({ page }) => {
  await page.goto('/admin.html');
  await page.getByRole('navigation', { name: '관리자 메뉴' }).getByRole('button', { name: '공지사항' }).click();
  await page.locator('#noticeTitle').fill('이미지 공지 테스트');
  await page.getByLabel('이미지 위 내용').fill('상단 내용');
  await page.getByLabel('이미지 아래 내용').fill('하단 내용');
  await page.locator('#noticeImageFile').setInputFiles('src/assets/work24-logo-transparent.png');
  await expect(page.locator('#noticeImagePreview')).toBeVisible();
  expect(await page.locator('#noticeImagePreview').evaluate((el) => getComputedStyle(el).objectFit)).toBe('cover');
  await page.getByRole('button', { name: '공지 추가' }).click();
  const row = page.locator('#noticeAdminList li').filter({ hasText: '이미지 공지 테스트' });
  await row.getByRole('button', { name: '수정' }).click();
  await expect(page.getByLabel('이미지 위 내용')).toHaveValue('상단 내용');
  await page.locator('#noticeTitle').fill('이미지 공지 수정됨');
  await page.getByRole('button', { name: '공지 수정' }).click();
  await expect(page.locator('#noticeAdminList')).toContainText('이미지 공지 수정됨');
});

test('FAQ manager supports editing an existing record', async ({ page }) => {
  await page.goto('/admin.html');
  await page.getByRole('navigation', { name: '관리자 메뉴' }).getByRole('button', { name: 'FAQ' }).click();
  await page.locator('#faqAdminList li').first().getByRole('button', { name: '수정' }).click();
  await page.getByLabel('질문').fill('수정된 FAQ 질문');
  await page.getByRole('button', { name: 'FAQ 수정' }).click();
  await expect(page.locator('#faqAdminList')).toContainText('수정된 FAQ 질문');
});

test('popup manager accepts drop image in a fitted 3 by 4 frame and removes it', async ({ page }) => {
  await page.goto('/admin.html');
  await page.getByRole('navigation', { name: '관리자 메뉴' }).getByRole('button', { name: '팝업' }).click();
  await page.locator('#popupDropzone').evaluate(async (el) => {
    const blob = await fetch('assets/work24-logo-transparent.png').then((response) => response.blob());
    const transfer = new DataTransfer();
    transfer.items.add(new File([blob], 'popup.png', { type: 'image/png' }));
    el.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: transfer }));
  });
  await expect(page.locator('#popupImagePreview')).toBeVisible();
  await expect(page.locator('#popupMediaStatus')).toContainText('업로드 완료');
  expect(await page.locator('.popup-preview-frame').evaluate((el) => getComputedStyle(el).aspectRatio)).toBe('3 / 4');
  await page.getByRole('button', { name: '팝업 이미지 삭제' }).click();
  await expect(page.locator('#popupImagePreview')).toBeHidden();
});

test('site content is separated by five page tabs', async ({ page }) => {
  await page.goto('/admin.html');
  await page.getByRole('navigation', { name: '관리자 메뉴' }).getByRole('button', { name: '사이트 콘텐츠' }).click();
  const tabs = page.getByRole('tablist', { name: '페이지별 콘텐츠' });
  await expect(tabs.getByRole('tab')).toHaveCount(5);
  await tabs.getByRole('tab', { name: '공모요강' }).click();
  await expect(page.getByLabel('공모요강 제목')).toBeVisible();
  await tabs.getByRole('tab', { name: '문의 페이지' }).click();
  await expect(page.getByLabel('문의 안내문')).toBeVisible();
});

test('inquiry manager shows content without reply state or reply controls', async ({ page }) => {
  await page.goto('/admin.html');
  await page.getByRole('navigation', { name: '관리자 메뉴' }).getByRole('button', { name: '문의 관리' }).click();
  await expect(page.locator('#inquiryList')).toContainText('문의 내용');
  await expect(page.locator('#inquiryList')).not.toContainText('미답변');
  await expect(page.getByRole('button', { name: /답변/ })).toHaveCount(0);
});

test('mobile menu is a compact accessible drawer and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('.menu');
  await expect(toggle).toHaveAttribute('aria-label', '주요 메뉴 열기');
  await toggle.click();
  const nav = page.locator('#nav');
  await expect(nav).toHaveAttribute('aria-label', '주요 메뉴');
  await expect(nav).toHaveClass(/open/);
  await expect(toggle).toHaveAttribute('aria-label', '주요 메뉴 닫기');
  const box = await nav.boundingBox();
  expect(box.height).toBeLessThan(420);
  expect(box.width).toBeLessThanOrEqual(370);
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden');
  await page.keyboard.press('Escape');
  await expect(nav).not.toHaveClass(/open/);
  await expect(toggle).toBeFocused();
});

test('mobile admin records and readiness cards keep deliberate internal spacing', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['notices', 'faq']) {
    await page.goto(`/admin.html#${route}`);
    const id = route === 'notices' ? '#noticeAdminList' : '#faqAdminList';
    const row = page.locator(`${id} li`).first();
    const metrics = await row.evaluate((el) => {
      const style = getComputedStyle(el);
      const action = el.querySelector('.admin-record-actions').getBoundingClientRect();
      const badge = el.querySelector('span')?.getBoundingClientRect();
      return { paddingLeft: parseFloat(style.paddingLeft), actionWidth: action.width, badgeWidth: badge?.width ?? 0 };
    });
    expect(metrics.paddingLeft).toBeGreaterThanOrEqual(16);
    expect(metrics.actionWidth).toBeLessThanOrEqual(72);
    if (route === 'notices') expect(metrics.badgeWidth).toBeLessThan(60);
  }
  await page.goto('/admin.html');
  const readinessGap = await page.locator('.admin-readiness').evaluate((el) => parseFloat(getComputedStyle(el).gap));
  expect(readinessGap).toBeGreaterThanOrEqual(10);
});

test('hamburger lines are geometrically centered in the circular control', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const metric = await page.locator('.menu').evaluate((button) => {
    const b = button.getBoundingClientRect();
    const lines = [...button.querySelectorAll('span')].map((el) => el.getBoundingClientRect());
    return { buttonCenter: b.top + b.height / 2, lineGroupCenter: (lines[0].top + lines[0].height / 2 + lines[2].top + lines[2].height / 2) / 2 };
  });
  expect(Math.abs(metric.buttonCenter - metric.lineGroupCenter)).toBeLessThanOrEqual(1);
});

test('focused month calendar uses tabs, range bars and separates the next section', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeDate = Date;
    class MockDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : ['2026-09-10T12:00:00+09:00'])); }
      static now() { return new NativeDate('2026-09-10T12:00:00+09:00').getTime(); }
    }
    window.Date = MockDate;
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const tabs = page.getByRole('tablist', { name: '공모일정 월 선택' });
  await expect(tabs.getByRole('tab')).toHaveCount(4);
  await expect(tabs.getByRole('tab', { name: '9월' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: '9월' })).toBeVisible();
  await expect(page.locator('.calendar-month:visible')).toHaveCount(1);
  await expect(page.getByRole('tabpanel', { name: '9월' }).locator('.calendar-event-range')).not.toHaveCount(0);
  await tabs.getByRole('tab', { name: '10월' }).click();
  await expect(tabs.getByRole('tab', { name: '10월' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: '10월' })).toBeVisible();
  const gap = await page.locator('.schedule-section').evaluate((section) => {
    const next = document.querySelector('.info-duo');
    return Math.round(next.getBoundingClientRect().top - section.getBoundingClientRect().bottom);
  });
  expect(gap).toBeGreaterThanOrEqual(80);
  const surfaces = await page.locator('.schedule-section').evaluate((section) => {
    const previous = document.querySelector('.value-section');
    const heading = section.querySelector('.schedule-heading');
    const tabs = section.querySelector('.calendar-tabs');
    const month = section.querySelector('.calendar-month:not([hidden])');
    const sectionStyle = getComputedStyle(section);
    return {
      background: sectionStyle.backgroundColor,
      radius: sectionStyle.borderRadius,
      shadow: sectionStyle.boxShadow,
      tabsBackground: getComputedStyle(tabs).backgroundColor,
      tabsRadius: getComputedStyle(tabs).borderRadius,
      calendarShadow: getComputedStyle(month).boxShadow,
      calendarRadius: getComputedStyle(month).borderRadius,
      currentBackground: getComputedStyle(section.querySelector('.schedule-event.is-current')).backgroundColor,
      currentRadius: getComputedStyle(section.querySelector('.schedule-event.is-current')).borderRadius,
      currentShadow: getComputedStyle(section.querySelector('.schedule-event.is-current')).boxShadow,
      headingGap: Math.round(heading.getBoundingClientRect().top - previous.getBoundingClientRect().bottom),
    };
  });
  expect(surfaces.background).toBe('rgba(0, 0, 0, 0)');
  expect(surfaces.radius).toBe('0px');
  expect(surfaces.shadow).toBe('none');
  expect(surfaces.tabsBackground).toBe('rgba(0, 0, 0, 0)');
  expect(surfaces.tabsRadius).toBe('0px');
  expect(surfaces.calendarShadow).toBe('none');
  expect(surfaces.calendarRadius).toBe('0px');
  expect(surfaces.currentBackground).toBe('rgba(0, 0, 0, 0)');
  expect(surfaces.currentRadius).toBe('0px');
  expect(surfaces.currentShadow).toBe('none');
  expect(surfaces.headingGap).toBeGreaterThanOrEqual(150);
});

test('monthly calendar highlights the real KST day and its active schedule on mobile', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeDate = Date;
    class MockDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : ['2026-09-10T12:00:00+09:00'])); }
      static now() { return new NativeDate('2026-09-10T12:00:00+09:00').getTime(); }
    }
    window.Date = MockDate;
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.calendar-month')).toHaveCount(4);
  await expect(page.locator('.calendar-month').first().locator('.calendar-day')).toHaveCount(42);
  const today = page.locator('.calendar-day[data-date="2026-09-10"]');
  await expect(today).toHaveClass(/is-today/);
  await expect(today).toHaveClass(/is-current-event/);
  await expect(today).toHaveAttribute('aria-current', 'date');
  await expect(page.locator('.schedule-event[data-event="apply"]')).toHaveClass(/is-current/);
  await expect(page.locator('.schedule-event[data-event="apply"] .schedule-state')).toHaveText('진행 중');
  await page.locator('.schedule-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  await expect(page.locator('.to-top')).toBeHidden();
  await expect(page.getByRole('link', { name: '공모요강' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: '첨부파일 다운로드' })).toHaveAttribute('href', /고용24_AI_공모전_참고자료\.txt/);
  await expect(page.locator('.overview-poster')).toBeVisible();
  const overview = await page.locator('.overview-summary').evaluate((el) => {
    const rows = [...el.querySelectorAll('.overview-fact')].map((row) => row.getBoundingClientRect());
    const button = el.querySelector('.overview-guide-button').getBoundingClientRect();
    return { rowLefts: rows.map((r) => r.left), buttonLeft: button.left, overflow: document.documentElement.scrollWidth - innerWidth };
  });
  expect(new Set(overview.rowLefts.map(Math.round)).size).toBe(1);
  expect(Math.abs(overview.buttonLeft - overview.rowLefts[0])).toBeLessThanOrEqual(1);
  expect(overview.overflow).toBeLessThanOrEqual(1);
  const sectionGap = await page.locator('.schedule-section').evaluate((section) => Math.round(document.querySelector('.info-duo').getBoundingClientRect().top - section.getBoundingClientRect().bottom));
  expect(sectionGap).toBeGreaterThanOrEqual(48);
});

test('the five-day operations check is active from August 31 through September 4', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeDate = Date;
    class MockDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : ['2026-08-31T12:00:00+09:00'])); }
      static now() { return new NativeDate('2026-08-31T12:00:00+09:00').getTime(); }
    }
    window.Date = MockDate;
  });
  await page.goto('/');
  await page.getByRole('tab', { name: '8월' }).click();
  await expect(page.getByRole('tab', { name: '8월' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.schedule-event[data-event="operations-check"]')).toHaveClass(/is-current/);
  await expect(page.locator('.schedule-event[data-event="operations-check"] .schedule-state')).toHaveText('진행 중');
  await expect(page.locator('.calendar-day[data-date="2026-08-31"]')).toHaveClass(/is-today/);
  await expect(page.locator('.calendar-day[data-date="2026-09-04"]')).toHaveClass(/event-operations-check/);
});

test('winner examples present two responsive service previews and safe outbound links', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/winners.html');
  await expect(page.getByRole('heading', { name: '예시 수상작' })).toBeVisible();
  await expect(page.locator('.winner-card')).toHaveCount(2);
  await expect(page.getByRole('link', { name: /고용24 서비스 보기/ })).toHaveAttribute('href', 'https://www.work24.go.kr/cm/main.do');
  await expect(page.getByRole('link', { name: /원티드 서비스 보기/ })).toHaveAttribute('href', 'https://www.wanted.co.kr/');
  await page.setViewportSize({ width: 390, height: 844 });
  const geometry = await page.locator('.winner-gallery').evaluate((gallery) => ({
    columns: getComputedStyle(gallery).gridTemplateColumns,
    overflow: document.documentElement.scrollWidth - innerWidth,
  }));
  expect(geometry.columns.split(' ').length).toBe(1);
  expect(geometry.overflow).toBeLessThanOrEqual(1);
});
