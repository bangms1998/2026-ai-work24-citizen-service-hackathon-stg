import { test, expect } from '@playwright/test';

test('application remains open before the official opening by owner-approved override', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeDate = Date;
    class MockDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : ['2026-09-18T12:00:00+09:00'])); }
      static now() { return new NativeDate('2026-09-18T12:00:00+09:00').getTime(); }
    }
    window.Date = MockDate;
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('고용24');
  await expect(page.getByRole('button', { name: '접수하기' })).toBeEnabled();
  await expect(page.locator('#applyStatus')).toContainText('접수 중');
  await expect(page.locator('.hero-date span')).toHaveText('접수기간');
  await expect(page.getByRole('link', { name: '요강 다운로드' })).toHaveAttribute('href', /2026_고용24_국민참여_AI_고용서비스_발굴_온라인_해커톤_요강\.pdf/);
});

test('application guide remains operational without collecting data on the site', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeDate = Date;
    class MockDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : ['2026-09-18T12:00:00+09:00'])); }
      static now() { return new NativeDate('2026-09-18T12:00:00+09:00').getTime(); }
    }
    window.Date = MockDate;
  });
  await page.goto('/apply.html');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('공모전 접수');
  await expect(page.locator('#applyFormLink')).toContainText('접수하기');
  await expect(page.locator('#applyFormLink')).toHaveAttribute('href', 'https://forms.gle/feWrX6udYCHKX8ry8');
  await expect(page.locator('#applyFormLink')).not.toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('form')).toHaveCount(0);
  await page.goto('/inquiry.html');
  await expect(page.locator('#inquiryForm')).toBeVisible();
  await expect(page.getByRole('link', { name: /메일 앱에서 보내기/ })).toBeHidden();
});

test('owner-approved open override keeps the Google Form available across schedule boundaries', async ({ page }) => {
  for (const sample of [
    { now: '2026-09-18T09:00:00+09:00', label: '접수하기', enabled: true },
    { now: '2026-09-21T09:00:00+09:00', label: '접수하기', enabled: true },
    { now: '2026-10-13T18:01:00+09:00', label: '접수하기', enabled: true },
  ]) {
    await page.addInitScript((now) => {
      const NativeDate = Date;
      class MockDate extends NativeDate {
        constructor(...args) { super(...(args.length ? args : [now])); }
        static now() { return new NativeDate(now).getTime(); }
      }
      window.Date = MockDate;
    }, sample.now);
    await page.goto('/');
    const button = page.getByRole('button', { name: sample.label });
    if (sample.enabled) await expect(button).toBeEnabled();
    else await expect(button).toBeDisabled();
  }
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

test('white organizer logos switch to their dark variants when the header becomes solid', async ({ page }) => {
  await page.goto('/');
  const light = page.locator('.logo-light');
  const dark = page.locator('.logo-dark');
  await expect(light).toBeVisible();
  await expect(dark).toBeHidden();
  expect(await light.locator('img').count()).toBe(2);
  for (const image of await light.locator('img').all()) {
    expect(await image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBeTruthy();
  }
  expect(await page.locator('.brand').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  await page.evaluate(() => scrollTo(0, 900));
  await expect(light).toBeHidden();
  await expect(dark).toBeVisible();
  await page.waitForFunction(() => document.fonts.check('16px "Wanted Sans Variable"'));
});

test('overview follows the annotated poster-left and editorial-copy-right composition', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.overview-brief > .overview-poster')).toHaveCount(1);
  await expect(page.locator('.overview-section > .section-heading')).toHaveCount(0);
  await expect(page.locator('.overview-poster figcaption')).toHaveCount(0);
  await expect(page.locator('.overview-kicker')).toHaveCount(0);
  await expect(page.locator('.overview-summary h2')).toContainText(/2026 고용24\s*국민참여/);
  await expect(page.locator('.overview-summary .overview-fact')).toHaveCount(0);
});

test('editorial hero image remains decorative, responsive and reduced-motion safe', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const image = page.locator('.hero-media .hero-character-laptop');
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

test('notice and FAQ pages preserve their routes with empty operational states', async ({ page }) => {
  await page.goto('/notice.html');
  await expect(page.locator('.notice-board tbody tr')).toHaveCount(0);
  await expect(page.getByText('등록된 공지사항이 없습니다.')).toBeVisible();
  await page.goto('/faq.html');
  await expect(page.locator('.content > .content-card details')).toHaveCount(0);
  await expect(page.getByText('등록된 자주 묻는 질문이 없습니다.')).toBeVisible();
});

test('inquiry form submits inside the site and shows the server receipt', async ({ page }) => {
  await page.route('**/api/inquiry', async (route) => route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, receipt: 'Q-20260918-ABC123' }),
  }));
  await page.goto('/inquiry.html');
  await page.getByLabel('문의 유형').selectOption({ label: '접수·제출' });
  await page.locator('#inquiryName').fill('김고용');
  await page.getByLabel('회신 이메일').fill('person@example.test');
  await page.getByLabel('문의 제목').fill('접수 파일 규격 문의');
  await page.getByLabel('문의 내용').fill('제출할 수 있는 파일 형식과 최대 용량을 확인하고 싶습니다.');
  await page.getByLabel(/개인정보 수집·이용에 동의/).check();
  await page.getByRole('button', { name: '문의 전송' }).click();
  await expect(page.locator('#inquiryResult')).toContainText('문의가 전송되었습니다');
  await expect(page.locator('#inquiryResult')).toContainText('Q-20260918-ABC123');
  await expect(page.getByText(/6개월 보관 후 삭제/)).toBeVisible();
});

for (const width of [390, 1440]) test(`inquiry form remains readable without horizontal overflow at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/inquiry.html');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  const form = await page.locator('#inquiryForm').boundingBox();
  expect(form.x).toBeGreaterThanOrEqual(0);
  expect(form.x + form.width).toBeLessThanOrEqual(width);
});

test('footer uses enlarged organizer logos without a white logo patch', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('.site-footer');
  expect(await footer.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)');
  await expect(footer.locator('.organizer-logos img')).toHaveCount(2);
  expect(await footer.locator('.organizer-logos img').first().evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
});

test('public pages never expose file line-number artifacts', async ({ page }) => {
  for (const route of ['/guide.html', '/notice.html', '/faq.html']) {
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

test('notice page keeps the accessible four-column board with an empty operational state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/notice.html');
  await expect(page.getByRole('table', { name: '공지사항 목록' })).toBeVisible();
  await expect(page.locator('.notice-board tbody tr')).toHaveCount(0);
  await expect(page.getByText('등록된 공지사항이 없습니다.')).toBeVisible();
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
  const logos = page.locator('.admin-organizer-logos img');
  await expect(logos).toHaveCount(2);
  await expect(logos.first()).toHaveAttribute('src', /ministry-light\.png/);
  await expect(logos.last()).toHaveAttribute('src', /keis-light\.png/);
  await expect(logos.first()).toBeVisible();
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
  await page.getByLabel('질문').fill('새 FAQ 질문');
  await page.getByLabel('답변').fill('새 FAQ 답변');
  await page.getByRole('button', { name: 'FAQ 추가' }).click();
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

test('site content excludes winner publishing controls while winners are held back', async ({ page }) => {
  await page.goto('/admin.html');
  await page.getByRole('navigation', { name: '관리자 메뉴' }).getByRole('button', { name: '사이트 콘텐츠' }).click();
  const tabs = page.getByRole('tablist', { name: '페이지별 콘텐츠' });
  await expect(tabs.getByRole('tab')).toHaveCount(4);
  await expect(tabs.getByRole('tab', { name: '수상작' })).toHaveCount(0);
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
  for (const route of ['공지사항', 'FAQ']) {
    await page.goto('/admin.html');
    await page.getByRole('navigation', { name: '관리자 메뉴' }).getByRole('button', { name: route }).click();
    if (route === '공지사항') {
      await page.locator('#noticeTitle').fill('간격 검수 공지');
      await page.getByRole('button', { name: '공지 추가' }).click();
    } else {
      await page.getByLabel('질문').fill('간격 검수 FAQ');
      await page.getByLabel('답변').fill('간격 검수 답변');
      await page.getByRole('button', { name: 'FAQ 추가' }).click();
    }
    const id = route === '공지사항' ? '#noticeAdminList' : '#faqAdminList';
    const row = page.locator(`${id} li`).first();
    const metrics = await row.evaluate((el) => {
      const style = getComputedStyle(el);
      const action = el.querySelector('.admin-record-actions').getBoundingClientRect();
      const badge = el.querySelector('span')?.getBoundingClientRect();
      return { paddingLeft: parseFloat(style.paddingLeft), actionWidth: action.width, badgeWidth: badge?.width ?? 0 };
    });
    expect(metrics.paddingLeft).toBeGreaterThanOrEqual(16);
    expect(metrics.actionWidth).toBeLessThanOrEqual(72);
    if (route === '공지사항') expect(metrics.badgeWidth).toBeLessThan(60);
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

test('poster-led schedule removes the month calendar and preserves all five poster stages', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeDate = Date;
    class MockDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : ['2026-09-24T12:00:00+09:00'])); }
      static now() { return new NativeDate('2026-09-24T12:00:00+09:00').getTime(); }
    }
    window.Date = MockDate;
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('.schedule-calendar, .calendar-tabs, .calendar-month, .calendar-day')).toHaveCount(0);
  await expect(page.locator('.schedule-roadmap .schedule-event')).toHaveCount(5);
  await expect(page.locator('#schedule-title')).toHaveText('해커톤 일정');
  await expect(page.locator('.schedule-period')).toContainText('9. 21.');
  await expect(page.locator('.schedule-period')).toContainText('10. 13.');
  await expect(page.locator('.schedule-event[data-event="apply"]')).toHaveClass(/is-current/);
  await expect(page.locator('.schedule-event[data-event="apply"] .schedule-state')).toHaveText('진행 중');
  await expect(page.locator('.schedule-event[data-event="ceremony"]')).toContainText('11월 ~ 12월 중');
  const stages = await page.locator('.schedule-roadmap .schedule-event').allTextContents();
  for (const label of ['접수', '1차 심사·20팀 발표', '온라인 MVP 개발', '2차 기능심사', '본선 발표·시상']) {
    expect(stages.join(' ')).toContain(label);
  }
  await expect(page.locator('.schedule-note')).toHaveCount(0);
  const roadmap = page.locator('.schedule-roadmap');
  const layout = await roadmap.evaluate((el) => {
    const events = [...el.querySelectorAll('.schedule-event')];
    const rows = new Set(events.map((item) => Math.round(item.getBoundingClientRect().top)));
    return {
      rowCount: rows.size,
      borderBottom: getComputedStyle(el).borderBottomWidth,
      titleSize: Number.parseFloat(getComputedStyle(events[0].querySelector('h3')).fontSize),
      dateSize: Number.parseFloat(getComputedStyle(events[0].querySelector('time')).fontSize),
      connectorDisplay: getComputedStyle(events[0], '::after').display,
      connectorWidth: Number.parseFloat(getComputedStyle(events[0], '::after').width),
    };
  });
  expect(layout.rowCount).toBe(1);
  expect(layout.borderBottom).toBe('0px');
  expect(layout.titleSize).toBeGreaterThanOrEqual(20);
  expect(layout.dateSize).toBeGreaterThanOrEqual(16);
  expect(layout.connectorDisplay).not.toBe('none');
  expect(layout.connectorWidth).toBeGreaterThan(100);
});

test('schedule becomes a complete vertical roadmap on mobile without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const stages = page.locator('.schedule-roadmap .schedule-event');
  await expect(stages).toHaveCount(5);
  const first = await stages.first().boundingBox();
  const second = await stages.nth(1).boundingBox();
  expect(second.y).toBeGreaterThan(first.y + first.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  for (const stage of await stages.all()) {
    const box = await stage.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
  }
  const connector = await stages.first().evaluate((event) => ({
    top: Number.parseFloat(getComputedStyle(event, '::before').top),
    markerHeight: event.querySelector('.event-index').getBoundingClientRect().height,
    markerZ: getComputedStyle(event.querySelector('.event-index')).zIndex,
  }));
  expect(connector.top).toBeGreaterThanOrEqual(connector.markerHeight + 4);
  expect(Number(connector.markerZ)).toBeGreaterThan(0);
});

test('tablet schedule uses one continuous ruled timeline instead of a broken two-column board', async ({ page }) => {
  for (const width of [768, 1024]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const events = page.locator('.schedule-roadmap .schedule-event');
    await expect(events).toHaveCount(5);
    const rows = await events.evaluateAll((items) => new Set(items.map((item) => Math.round(item.getBoundingClientRect().top))).size);
    expect(rows).toBe(5);
    for (const event of await events.all()) {
      const box = await event.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    const grid = await events.first().evaluate((event) => getComputedStyle(event).gridTemplateColumns);
    expect(grid.split(' ').length).toBeGreaterThanOrEqual(2);
  }
});

test('the approved application window remains active through October 13 without calendar UI', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeDate = Date;
    class MockDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : ['2026-10-13T12:00:00+09:00'])); }
      static now() { return new NativeDate('2026-10-13T12:00:00+09:00').getTime(); }
    }
    window.Date = MockDate;
  });
  await page.goto('/');
  await expect(page.locator('.schedule-calendar, [role="tablist"]')).toHaveCount(0);
  await expect(page.locator('.schedule-event[data-event="apply"]')).toHaveClass(/is-current/);
  await expect(page.locator('.schedule-event[data-event="apply"] .schedule-state')).toHaveText('진행 중');
});

test('the revised main visual uses three distinct characters and limits the color fade to the first two sections', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const flow = page.locator('.kv-flow');
  await expect(flow.locator(':scope > section')).toHaveCount(2);
  await expect(flow.locator(':scope > section').nth(0)).toHaveClass(/hero-kv/);
  await expect(flow.locator(':scope > section').nth(1)).toHaveClass(/overview-section/);
  await expect(flow.locator('+ .schedule-section')).toBeVisible();
  expect(await flow.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(37, 52, 144)');
  expect(await page.locator('.overview-section').evaluate((el) => getComputedStyle(el).backgroundImage)).toContain('linear-gradient');

  const hero = page.locator('.hero-kv');
  const characters = hero.locator('.hero-character');
  await expect(characters).toHaveCount(3);
  for (const character of await characters.all()) {
    expect(await character.evaluate((el) => el.complete && el.naturalWidth > 0)).toBeTruthy();
    expect(await character.evaluate((el) => getComputedStyle(el).filter)).toBe('none');
  }

  const layout = await hero.evaluate((section) => {
    const box = (selector) => section.querySelector(selector).getBoundingClientRect();
    const center = (rect) => rect.left + rect.width / 2;
    const copy = box('.hero-copy');
    const laptop = box('.hero-character-laptop');
    const bag = box('.hero-character-bag');
    const yellow = box('.hero-character-yellow');
    return { copyCenter: center(copy), laptopCenter: center(laptop), bagCenter: center(bag), yellowCenter: center(yellow), width: innerWidth };
  });
  expect(Math.abs(layout.copyCenter - layout.width / 2)).toBeLessThanOrEqual(24);
  expect(layout.laptopCenter).toBeGreaterThan(layout.copyCenter + 300);
  expect(layout.bagCenter).toBeLessThan(layout.copyCenter - 300);
  expect(layout.yellowCenter).toBeLessThan(layout.copyCenter - 220);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const character of await characters.all()) {
    expect(await character.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  }
});

test('tablet hero lifts subdued characters behind the copy and the second section starts with the hero edge color', async ({ page }) => {
  for (const width of [768]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const geometry = await page.locator('.hero-kv').evaluate((hero) => {
      const copy = hero.querySelector('.hero-copy').getBoundingClientRect();
      const characters = [...hero.querySelectorAll('.hero-character')].map((item) => item.getBoundingClientRect());
      const overlap = characters.some((box) => !(box.bottom <= copy.top || box.top >= copy.bottom || box.right <= copy.left || box.left >= copy.right));
      return { overlap, copyBottom: copy.bottom, firstCharacterTop: Math.min(...characters.map((box) => box.top)), heroBottom: hero.getBoundingClientRect().bottom };
    });
    expect(geometry.overlap).toBeTruthy();
    expect(geometry.firstCharacterTop).toBeLessThan(geometry.copyBottom);
    expect(geometry.heroBottom).toBeGreaterThan(geometry.firstCharacterTop);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const seam = await page.evaluate(() => {
    const hero = document.querySelector('.hero-kv');
    const overview = document.querySelector('.overview-section');
    const heroShade = getComputedStyle(document.querySelector('.hero-shade')).backgroundImage;
    const heroEdge = getComputedStyle(hero, '::after');
    const overviewBox = overview.getBoundingClientRect();
    return {
      flow: getComputedStyle(document.querySelector('.kv-flow')).backgroundColor,
      overviewImage: getComputedStyle(overview).backgroundImage,
      heroShade,
      heroEdgeColor: heroEdge.backgroundColor,
      heroEdgeHeight: Number.parseFloat(heroEdge.height),
      overviewLeft: Math.round(overviewBox.left),
      overviewWidth: Math.round(overviewBox.width),
      seamDelta: Math.round(overviewBox.top - hero.getBoundingClientRect().bottom),
    };
  });
  expect(seam.flow).toBe('rgb(37, 52, 144)');
  expect(seam.overviewImage).toContain('rgb(37, 52, 144)');
  expect(seam.overviewLeft).toBe(0);
  expect(seam.overviewWidth).toBe(1440);
  expect(seam.seamDelta).toBeLessThanOrEqual(0);
  expect(seam.heroShade).toContain('92%');
  expect(seam.heroEdgeColor).toBe('rgb(37, 52, 144)');
  expect(seam.heroEdgeHeight).toBeGreaterThanOrEqual(12);
});

test('mobile overview keeps a clear gap between the poster and the copy', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const spacing = await page.locator('.overview-poster-brief').evaluate((section) => {
    const poster = section.querySelector('.overview-poster').getBoundingClientRect();
    const title = section.querySelector('.overview-summary h2').getBoundingClientRect();
    return Math.round(title.top - poster.bottom);
  });
  expect(spacing).toBeGreaterThanOrEqual(56);
});

test('tablet overview stacks the poster above copy without overlap', async ({ page }) => {
  for (const width of [768, 1024]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const geometry = await page.locator('.overview-poster-brief').evaluate((section) => {
      const poster = section.querySelector('.overview-poster').getBoundingClientRect();
      const summary = section.querySelector('.overview-summary').getBoundingClientRect();
      return {
        columns: getComputedStyle(section).gridTemplateColumns.split(' ').length,
        gap: Math.round(summary.top - poster.bottom),
        overlap: !(poster.bottom <= summary.top || summary.bottom <= poster.top || poster.right <= summary.left || summary.right <= poster.left),
      };
    });
    expect(geometry.columns).toBe(1);
    expect(geometry.overlap).toBeFalsy();
    expect(geometry.gap).toBeGreaterThanOrEqual(48);
  }
});

test('mobile hero characters become a subdued background layer while tablet keeps a separate zone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const mobile = await page.locator('.hero-kv').evaluate((hero) => {
    const copy = hero.querySelector('.hero-copy');
    const copyBox = copy.getBoundingClientRect();
    const characters = [...hero.querySelectorAll('.hero-character')];
    const boxes = characters.map((item) => item.getBoundingClientRect());
    return {
      overlap: boxes.some((box) => !(box.bottom <= copyBox.top || box.top >= copyBox.bottom || box.right <= copyBox.left || box.left >= copyBox.right)),
      opacities: characters.map((item) => Number.parseFloat(getComputedStyle(item).opacity)),
      characterZ: Number(getComputedStyle(characters[0]).zIndex),
      copyZ: Number(getComputedStyle(copy).zIndex),
      heroHeight: Math.round(hero.getBoundingClientRect().height),
      widthRatios: boxes.map((box) => box.width / innerWidth),
    };
  });
  expect(mobile.overlap).toBeTruthy();
  expect(Math.max(...mobile.opacities)).toBeLessThanOrEqual(.4);
  expect(mobile.characterZ).toBeLessThan(mobile.copyZ);
  expect(mobile.heroHeight).toBeLessThanOrEqual(940);
  expect(mobile.widthRatios[0]).toBeLessThanOrEqual(.57);
  expect(mobile.widthRatios[1]).toBeLessThanOrEqual(.48);
  expect(mobile.widthRatios[2]).toBeLessThanOrEqual(.26);

  await page.setViewportSize({ width: 768, height: 1000 });
  await page.goto('/');
  const tablet = await page.locator('.hero-kv').evaluate((hero) => {
    const copy = hero.querySelector('.hero-copy');
    const copyBox = copy.getBoundingClientRect();
    const characters = [...hero.querySelectorAll('.hero-character')];
    const boxes = characters.map((item) => item.getBoundingClientRect());
    return {
      overlap: boxes.some((box) => !(box.bottom <= copyBox.top || box.top >= copyBox.bottom || box.right <= copyBox.left || box.left >= copyBox.right)),
      maxOpacity: Math.max(...characters.map((item) => Number.parseFloat(getComputedStyle(item).opacity))),
      characterZ: Number(getComputedStyle(characters[0]).zIndex),
      copyZ: Number(getComputedStyle(copy).zIndex),
    };
  });
  expect(tablet.overlap).toBeTruthy();
  expect(tablet.maxOpacity).toBeLessThanOrEqual(.22);
  expect(tablet.characterZ).toBeLessThan(tablet.copyZ);
});

test('mobile yellow character is on the left and the latest guideline copy is complete', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const placement = await page.locator('.hero-kv').evaluate((hero) => {
    const yellow = hero.querySelector('.hero-character-yellow').getBoundingClientRect();
    return { center: yellow.left + yellow.width / 2, viewportCenter: innerWidth / 2 };
  });
  expect(placement.center).toBeLessThan(placement.viewportCenter);
  await page.goto('/guide.html');
  await expect(page.getByText('고용24 내부 데이터 등 비공개 정보는 실제 데이터와 유사한 형태의 합성데이터로 구현 가능')).toBeVisible();
  await expect(page.locator('.guide-notes > li')).toHaveCount(10);
});

test('1024 tablet also lifts subdued characters behind the copy', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 1000 });
  await page.goto('/');
  const tablet = await page.locator('.hero-kv').evaluate((hero) => {
    const copy = hero.querySelector('.hero-copy');
    const copyBox = copy.getBoundingClientRect();
    const characters = [...hero.querySelectorAll('.hero-character')];
    const boxes = characters.map((item) => item.getBoundingClientRect());
    return {
      overlap: boxes.some((box) => !(box.bottom <= copyBox.top || box.top >= copyBox.bottom || box.right <= copyBox.left || box.left >= copyBox.right)),
      maxOpacity: Math.max(...characters.map((item) => Number.parseFloat(getComputedStyle(item).opacity))),
    };
  });
  expect(tablet.overlap).toBeTruthy();
  expect(tablet.maxOpacity).toBeLessThanOrEqual(.22);
});

test('the second-section fade resolves to a low-saturation blue rather than violet', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const gradient = await page.locator('.overview-section').evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(gradient).toContain('rgb(64, 86, 145)');
  expect(gradient).not.toContain('rgb(90, 85, 210)');
});

test('mobile guidelines keep every card and text block inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/guide.html');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  const cards = page.locator('.guide-content .content-card');
  await expect(cards).toHaveCount(9);
  for (const card of await cards.all()) {
    const bounds = await card.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
    const overflow = await card.evaluate((el) => [...el.querySelectorAll('h2,p,li,dd,a')]
      .filter((node) => !node.closest('.guide-table-wrap'))
      .some((node) => node.scrollWidth > node.clientWidth + 1));
    expect(overflow).toBeFalsy();
  }
  for (const wrap of await page.locator('.guide-table-wrap').all()) {
    const bounds = await wrap.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
    expect(await wrap.evaluate((el) => getComputedStyle(el).overflowX)).toBe('auto');
  }
});

test('winner navigation and direct route stay hidden before release', async ({ page }) => {
  for (const route of ['/', '/guide.html', '/notice.html', '/faq.html', '/inquiry.html']) {
    await page.goto(route);
    await expect(page.getByRole('navigation', { name: '주요 메뉴' }).getByRole('link', { name: '수상작' })).toHaveCount(0);
  }
  const response = await page.goto('/winners.html');
  expect(response.status()).toBe(404);
  await expect(page.locator('body')).not.toContainText('수상작 갤러리');
});
