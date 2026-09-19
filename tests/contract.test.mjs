import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const read = (name) => readFile(new URL(`../src/${name}`, import.meta.url), 'utf8');

test('public landing exposes every required contest route without draft placeholders', async () => {
  const html = await read('index.html');
  for (const route of ['guide.html', 'notice.html', 'faq.html', 'inquiry.html']) {
    assert.match(html, new RegExp(`href=["']${route}`));
  }
  assert.doesNotMatch(html, /\[미정\]|\[확인 필요\]|샘플|승인 후 공개|접수 준비 중/);
  assert.doesNotMatch(html, /정부24|태극|대한민국정부/);
});

test('approved Google Form stays open by owner-approved override', async () => {
  const config = await read('site-config.js');
  const app = await read('app.js');
  assert.match(config, /formUrl:\s*['"]https:\/\/forms\.gle\/feWrX6udYCHKX8ry8['"]/);
  assert.match(config, /state:\s*['"]OPEN['"]/);
  assert.match(config, /opensAt:\s*['"]2026-09-21T00:00:00\+09:00['"]/);
  assert.match(config, /closesAt:\s*['"]2026-10-13T18:00:00\+09:00['"]/);
  assert.match(app, /siteConfig\.formUrl/);
  assert.match(app, /resolvedContestState/);
});

test('hero follows the approved copy, line break, status cleanup and visual adjustment contract', async () => {
  const html = await read('index.html');
  const css = await read('kv-theme.css');
  const app = await read('app.js');
  assert.match(html, /class="hero-label">2026 고용24<\/p>/);
  assert.match(html, /class="hero-lead">AI와 함께하는 국민 체감 고용서비스 발굴<br>\s*기획안으로 접수하고, 선정팀은 2주간 온라인에서 직접 MVP를 개발합니다\.<\/p>/);
  assert.doesNotMatch(html, /class="hero-lead">고용데이터 기반 AI 기술을 활용하여 국민이 체감할 수 있는 고용서비스를 발굴합니다/);
  assert.doesNotMatch(html, /id="applyStatus"|접수 중 · 2026\.09\.21/);
  assert.doesNotMatch(app, /applyStatus|접수 중 · 2026\.09\.21/);
  assert.match(css, /\.hero-kv \.hero-label\{[^}]*font-size:clamp\(30px,3\.6vw,52px\)[^}]*color:#fff/);
  assert.match(css, /@media\(max-width:560px\)[^{]*\{[\s\S]*?\.hero-kv \.hero-label\{font-size:24px/);
});

test('public operational copy exposes the approved guideline download', async () => {
  const pages = ['index.html', 'guide.html', 'notice.html', 'faq.html', 'inquiry.html', 'apply.html'];
  for (const page of pages) {
    const html = await read(page);
    assert.doesNotMatch(html, /TEST|테스트|\[확인 필요\]|샘플|승인 후 공개|접수 준비 중/i, `${page} still exposes draft copy`);
  }
  const html = await read('index.html');
  const config = await read('site-config.js');
  assert.match(html, /id="resourcesDownload"[^>]*>요강 다운로드/);
  assert.match(config, /state:\s*['"]OPEN['"]/);
  assert.match(config, /resourcesUrl:\s*['"]assets\/downloads\/2026_고용24_국민참여_AI_고용서비스_발굴_온라인_해커톤_요강\.pdf['"]/);
});

test('guideline download is the owner-supplied latest seven-page PDF', async () => {
  const pdf = await readFile(new URL('../src/assets/downloads/2026_고용24_국민참여_AI_고용서비스_발굴_온라인_해커톤_요강.pdf', import.meta.url));
  assert.equal(createHash('sha256').update(pdf).digest('hex'), '50fd483e484d7f9965417d832c0934c4243b019a947fcc6d33c344e58fea95b3');
});

test('every public page declares the approved favicon and social sharing image', async () => {
  const pages = new Map([
    ['index.html', '/'],
    ['guide.html', '/guide.html'],
    ['notice.html', '/notice.html'],
    ['faq.html', '/faq.html'],
    ['inquiry.html', '/inquiry.html'],
    ['apply.html', '/apply.html'],
  ]);
  const socialHost = 'https://www.xn--299alkwa683hrtfsfp2mn8g3zd53kbtag2cdzeds0aqoj3nl9jq.com';
  for (const [page, path] of pages) {
    const html = await read(page);
    assert.match(html, /rel="icon"[^>]*assets\/meta\/favicon-32x32\.png/);
    assert.match(html, /rel="apple-touch-icon"[^>]*assets\/meta\/apple-touch-icon\.png/);
    assert.ok(html.includes(`<meta property="og:url" content="${socialHost}${path}">`));
    const kakaoImage = `${socialHost}/assets/meta/og-kakao-1200x630-20260919.jpg`;
    assert.ok(html.includes(`<meta property="og:image" content="${kakaoImage}">`));
    assert.ok(html.includes(`<meta property="og:image:secure_url" content="${kakaoImage}">`));
    assert.match(html, /property="og:image:type" content="image\/jpeg"/);
    assert.match(html, /property="og:image:width" content="1200"/);
    assert.match(html, /property="og:image:height" content="630"/);
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
    assert.ok(html.includes(`<meta name="twitter:image" content="${kakaoImage}">`));
  }
  assert.match(await read('404.html'), /rel="icon"[^>]*assets\/meta\/favicon-32x32\.png/);
  for (const asset of ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'favicon-512x512.png', 'og-image-1200x630.png']) {
    await access(new URL(`../src/assets/meta/${asset}`, import.meta.url));
  }
});

test('public inquiry posts to a same-origin server relay with six-month retention consent', async () => {
  const inquiry = await read('inquiry.html');
  const apply = await read('apply.html');
  const app = await read('app.js');
  assert.match(inquiry, /<form\b[^>]*id="inquiryForm"/i);
  for (const field of ['inquiryType', 'inquiryName', 'inquiryEmail', 'inquiryTitle', 'inquiryMessage']) {
    assert.match(inquiry, new RegExp(`id=["']${field}["']`));
  }
  assert.match(inquiry, /6개월/);
  assert.match(inquiry, /id="inquiryConsent"/);
  assert.match(inquiry, /id="inquiryResult"/);
  assert.doesNotMatch(apply, /<form\b/i);
  assert.match(apply, /id="applyFormLink"/);
  assert.match(apply, /2026년 9월 21일/);
  assert.match(app, /inquiryForm/);
  assert.match(app, /fetch\(['"]\/api\/inquiry['"]/);
  assert.doesNotMatch(app, /mailto:gongmo@stunning\.kr\?subject=/);
  const relay = await readFile(new URL('../functions/api/inquiry.js', import.meta.url), 'utf8');
  assert.match(relay, /INQUIRY_RELAY_URL/);
  assert.match(relay, /content-type/i);
  assert.match(relay, /429|rate/i);
  assert.doesNotMatch(app, /PREVIEW-|TEST-|localStorage/);
});

test('public artifact declares security headers and remains hostname independent', async () => {
  const headers = await read('_headers');
  assert.match(headers, /Content-Security-Policy:/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /Permissions-Policy:/);
  for (const page of ['index.html', 'guide.html', 'notice.html', 'faq.html', 'inquiry.html', 'apply.html', 'app.js', 'site-config.js']) {
    assert.doesNotMatch(await read(page), /stunning-work24-stg\.pages\.dev/);
  }
});

test('local QA uses a contest-specific port instead of the shared 4173 default', async () => {
  const server = await readFile(new URL('../scripts/server.mjs', import.meta.url), 'utf8');
  const playwright = await readFile(new URL('../playwright.config.mjs', import.meta.url), 'utf8');
  assert.match(server, /4184/);
  assert.match(playwright, /4184/);
  assert.doesNotMatch(server, /4173/);
  assert.doesNotMatch(playwright, /4173/);
});

test('the page includes accessibility and reduced-motion contracts', async () => {
  const html = await read('index.html');
  const css = await read('styles.css');
  assert.match(html, /<main/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
});

test('Pretendard is self-hosted below the hero and organizer logos replace the Work24 logo', async () => {
  const css = await read('styles.css');
  const html = await read('index.html');
  const license = await read('assets/fonts/OFL.txt');
  assert.match(css, /Pretendard Variable/);
  assert.match(css, /assets\/fonts\/PretendardVariable\.woff2/);
  assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.match(html, /assets\/kv\/ministry-light\.png/);
  assert.match(html, /assets\/kv\/keis-light\.png/);
  assert.match(html, /assets\/kv\/ministry-dark\.png/);
  assert.match(html, /assets\/kv\/keis-dark\.png/);
  assert.match(html, /class="organizer-logo-set logo-light"/);
  assert.match(html, /class="organizer-logo-set logo-dark"/);
  assert.doesNotMatch(html, /work24-logo|www\.work24\.go\.kr/);
});

test('approved KV system uses separated background and character assets with semantic copy', async () => {
  const html = await read('index.html');
  const css = `${await read('styles.css')}\n${await read('kv-theme.css')}`;
  assert.match(html, /class="hero hero-editorial hero-kv"/);
  assert.match(html, /assets\/kv\/background-main\.webp/);
  for (const asset of ['hero-character-laptop.webp', 'hero-character-bag.webp', 'hero-character-yellow.webp']) {
    assert.match(html, new RegExp(`assets/kv/${asset.replace('.', '\\.')}`));
  }
  assert.match(html, /2026 고용24 국민참여 AI 고용서비스/);
  assert.match(html, /class="glass-action/);
  assert.match(html, /class="overview-brief overview-poster-brief"/);
  assert.match(html, /class="overview-poster"/);
  assert.doesNotMatch(html, /class="recommend-card/);
  assert.doesNotMatch(html, /class="feature-grid|class="section value-section/);
  assert.doesNotMatch(html, /ai-core|ai-orbit|signal-node/);
  assert.match(css, /SBAggroB/);
  assert.match(css, /assets\/fonts\/SBAggroB\.woff/);
  assert.match(css, /\.hero-kv h1/);
  assert.match(css, /backdrop-filter:blur/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(html, /wantedAX|원티드긱스|dev_01_hero/);
  assert.doesNotMatch(html, /poster-outlined\.webp[^>]*class="hero/);
});

test('admin prototype preserves operations while sharing the landing editorial design system', async () => {
  const html = await read('admin.html');
  const js = await read('admin.js');
  const css = await read('styles.css');
  assert.match(html, /class="admin-body admin-editorial"/);
  assert.match(html, /class="admin-organizer-logos"/);
  assert.match(html, /assets\/kv\/ministry-light\.png/);
  assert.match(html, /assets\/kv\/keis-light\.png/);
  assert.match(html, /인증 없는 TEST 프로토타입/);
  for (const label of ['관리자 홈', '공지사항', 'FAQ', '팝업', '사이트 콘텐츠', '문의 관리']) assert.match(html, new RegExp(label));
  for (const action of ['임시저장', '전체 사이트 미리보기', '변경사항 적용', '변경 취소']) assert.match(html, new RegExp(action));
  assert.match(css, /admin editorial refinement/);
  assert.match(html, /class="admin-content-tabs"/);
  for (const label of ['메인 페이지', '공모요강', '일정·시상', '문의 페이지']) assert.match(html, new RegExp(label));
  assert.doesNotMatch(html, /data-content-tab="winners"|data-content-panel="winners"|수상작 공개 ON\/OFF/);
  assert.doesNotMatch(html, /<i>0[1-9]<\/i>/);
  assert.match(html, /id="noticeBodyBefore"/);
  assert.match(html, /id="noticeBodyAfter"/);
  assert.match(html, /id="noticeDropzone"/);
  assert.match(html, /id="popupDropzone"/);
  assert.match(html, /id="popupImagePreview"/);
  assert.match(js, /문의 내용/);
  assert.doesNotMatch(js, /미답변|이메일 답변/);
  assert.match(css, /\.admin-media-dropzone\{/);
  assert.match(css, /object-fit:cover/);
  assert.match(css, /\.admin-destinations button\{grid-template-columns:1fr auto/);
  assert.match(css, /\.admin-editorial\{background:#f5f5f2;color:#171719/);
  assert.match(css, /\.admin-editorial \.admin-header\{[^}]*background:#111112/);
  assert.match(js, /localStorage/);
  assert.match(js, /rollback/);
  assert.match(js, /function renderInquiries/);
  assert.doesNotMatch(html, /CSV 내려받기|답변 상태/);
});

test('public navigation, top control and notice table follow the revised information architecture', async () => {
  const pages = ['index.html', 'guide.html', 'notice.html', 'faq.html', 'inquiry.html'];
  for (const page of pages) {
    const html = await read(page);
    assert.match(html, /href="index\.html">홈<\/a>/);
    assert.match(html, /class="to-top"/);
    assert.doesNotMatch(html, /href="winners\.html"/);
  }
  const notice = await read('notice.html');
  const css = await read('styles.css');
  assert.match(notice, /class="notice-board"/);
  for (const heading of ['번호', '구분', '제목', '작성일']) assert.match(notice, new RegExp(heading));
  assert.match(css, /\.notice-board thead\{background:#f3f3f1;color:#1/);
  assert.doesNotMatch(css, /\.notice-board thead\{background:#13296c/);
});

test('landing exposes the approved guidelines, attachment and poster-led five-stage schedule', async () => {
  const html = await read('index.html');
  const guide = await read('guide.html');
  const inquiry = await read('inquiry.html');
  const config = await read('site-config.js');
  const css = await read('kv-theme.css');
  assert.doesNotMatch(html, /id="scheduleCalendar"|id="scheduleData"|calendar-month|calendar-day/);
  assert.match(html, /class="schedule-events schedule-roadmap"/);
  for (const label of ['접수', '1차 심사·20팀 발표', '온라인 MVP 개발', '2차 기능심사', '본선 발표·시상']) assert.match(html, new RegExp(label));
  for (const dateLabel of ['9.21 — 10.13', '10월 중', '10월 ~ 11월 중', '11월 중', '11월 ~ 12월 중']) assert.ok(html.includes(dateLabel));
  assert.equal((html.match(/class="schedule-event"/g) || []).length, 5);
  assert.match(html, /data-start="2026-09-21"/);
  assert.match(html, /data-end="2026-10-13"/);
  assert.match(html, /data-start="2026-11-27"/);
  assert.match(html, /data-end="2026-11-27"/);
  assert.doesNotMatch(html, /class="contest-schedule"/);
  assert.match(html, />공모요강<\/a>/);
  assert.match(guide, /<title>공모요강 \|/);
  assert.match(html, /id="resourcesDownload"[^>]*>요강 다운로드/);
  assert.match(config, /resourcesUrl:\s*['"]assets\/downloads\/2026_고용24_국민참여_AI_고용서비스_발굴_온라인_해커톤_요강\.pdf['"]/);
  assert.match(html, /class="overview-poster"/);
  assert.doesNotMatch(html, /class="overview-kicker">해커톤|class="schedule-note"/);
  assert.match(html, /id="overview-title">2026 고용24/);
  assert.match(html, /AI 기술을 접목한 고용24 서비스 MVP/);
  assert.doesNotMatch(html, /<figcaption>|class="overview-fact"/);
  assert.match(inquiry, /gongmo@stunning\.kr/);
  assert.match(css, /\.schedule-roadmap/);
  assert.match(css, /\.schedule-meta time/);
  assert.match(guide, /전문가로 구성된 심사위원단/);
  assert.match(guide, /동점자의 경우 배점 기준 우선순위로 결정/);
});

test('latest 1440 review applies the requested hero, poster and schedule treatment', async () => {
  const html = await read('index.html');
  const css = await read('kv-theme.css');
  assert.doesNotMatch(html, /아이디어에서|실제로 작동하는 MVP까지|class="section value-section/);
  assert.doesNotMatch(html, /행사가 있는 날짜와 실제 오늘 날짜가 자동으로 표시됩니다/);
  assert.match(html, /id="resourcesDownload"[^>]*>요강 다운로드/);
  assert.match(css, /\.hero-date\{[^}]*padding:17px 27px/);
  assert.match(css, /\.overview-poster\{[^}]*border-radius:28px/);
  assert.match(css, /\.overview-poster:after\{[^}]*display:none/);
  assert.match(css, /\.schedule-heading h2\{[^}]*line-height:1\.16/);
});

test('public copy matches the latest official HWPX and clears prior notice and FAQ entries', async () => {
  const [home, guide, notice, faq] = await Promise.all(['index.html', 'guide.html', 'notice.html', 'faq.html'].map(read));
  assert.match(home, /AI와 함께하는 국민 체감 고용서비스 발굴/);
  assert.match(home, /기획안으로 접수하고, 선정팀은 2주간 온라인에서 직접 MVP를 개발합니다/);
  assert.match(home, /장소·시간 추후 공개\(서울\)/);
  assert.doesNotMatch(home, /09시 예정|Google Form 접수 링크는 승인 후 공개|해커톤 공모요강을 확인해 주세요/);
  for (const phrase of ['PDF 형식, 약 10페이지 이내', '개인정보수집·이용동의서', '저작재산권 이용허락 동의서', '청렴서약서', '데이터 활용 명세']) {
    assert.match(guide, new RegExp(phrase));
  }
  assert.match(notice, /총 <strong>0건<\/strong>/);
  assert.match(notice, /등록된 공지사항이 없습니다/);
  assert.doesNotMatch(notice, /<tbody>\s*<tr>/);
  assert.match(faq, /등록된 자주 묻는 질문이 없습니다/);
  assert.doesNotMatch(faq, /<details/);
});

test('winners stay outside the public artifact until an approved release', async () => {
  await assert.rejects(access(new URL('../src/winners.html', import.meta.url)));
  const [draft, notFound] = await Promise.all([
    readFile(new URL('../unpublished/winners.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/404.html', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(notFound, /수상작 갤러리|winner-card/);
  assert.match(notFound, /요청하신 페이지를 찾을 수 없습니다/);
  assert.match(draft, /class="winner-gallery"/);
  assert.match(draft, /data-delivery-type="link"/);
  assert.match(draft, /data-delivery-type="apk"/);
  assert.match(draft, /class="[^"]*winner-card-link[^"]*"/);
  assert.match(draft, /target="_blank" rel="noopener noreferrer"/);
});
