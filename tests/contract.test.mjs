import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (name) => readFile(new URL(`../src/${name}`, import.meta.url), 'utf8');

test('public landing exposes every required contest route and honest placeholders', async () => {
  const html = await read('index.html');
  for (const route of ['guide.html', 'notice.html', 'faq.html', 'inquiry.html', 'winners.html']) {
    assert.match(html, new RegExp(`href=["']${route}`));
  }
  assert.match(html, /\[미정\]|\[확인 필요\]|샘플/);
  assert.doesNotMatch(html, /정부24|태극|대한민국정부/);
});

test('submission destination is a replaceable staging adapter and never a production Form hardcode', async () => {
  const config = await read('site-config.js');
  const app = await read('app.js');
  assert.match(config, /formUrl:\s*['"]apply\.html['"]/);
  assert.match(config, /state:\s*['"]OPEN['"]/);
  assert.match(app, /siteConfig\.formUrl/);
  assert.doesNotMatch(config, /docs\.google\.com\/forms\/d\/e\/[A-Za-z0-9_-]{20,}/);
});

test('public staging copy is operation-like, with an active application and attachment download', async () => {
  const pages = ['index.html', 'guide.html', 'notice.html', 'faq.html', 'inquiry.html', 'winners.html'];
  for (const page of pages) {
    const html = await read(page);
    assert.doesNotMatch(html, /TEST|테스트/i, `${page} still exposes test copy`);
  }
  const html = await read('index.html');
  const config = await read('site-config.js');
  assert.match(html, /id="resourcesDownload"[^>]*>첨부파일 다운로드/);
  assert.match(config, /resourcesUrl:\s*['"]assets\/downloads\/고용24_AI_공모전_참고자료\.txt['"]/);
});

test('the page includes accessibility and reduced-motion contracts', async () => {
  const html = await read('index.html');
  const css = await read('styles.css');
  assert.match(html, /<main/);
  assert.match(html, /aria-live=/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
});

test('Wanted Sans is self-hosted and dark/white Work24 logos switch without a backing box', async () => {
  const css = await read('styles.css');
  const html = await read('index.html');
  const license = await read('assets/fonts/OFL.txt');
  assert.match(css, /Wanted Sans Variable/);
  assert.match(css, /assets\/fonts\/WantedSansVariable\.woff2/);
  assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.match(html, /assets\/work24-logo-transparent\.png/);
  assert.match(html, /assets\/work24-logo-white\.png/);
  assert.match(html, /class="brand-logo logo-light"/);
  assert.match(html, /class="brand-logo logo-dark"/);
  assert.match(html, /www\.work24\.go\.kr/);
});

test('reference-led editorial system uses a photo hero and restrained glass surfaces', async () => {
  const html = await read('index.html');
  const css = await read('styles.css');
  assert.match(html, /class="hero hero-editorial"/);
  assert.match(html, /assets\/work24-ai-hero\.webp/);
  assert.match(html, /class="glass-action/);
  assert.match(html, /class="overview-brief overview-poster-brief"/);
  assert.match(html, /class="overview-poster"/);
  assert.doesNotMatch(html, /class="recommend-card/);
  assert.match(html, /class="feature-grid/);
  assert.doesNotMatch(html, /ai-core|ai-orbit|signal-node/);
  assert.doesNotMatch(css, /--cyan|#41e6ff/i);
  assert.match(css, /backdrop-filter:blur/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(html, /wantedAX|원티드긱스|dev_01_hero/);
});

test('admin prototype preserves operations while sharing the landing editorial design system', async () => {
  const html = await read('admin.html');
  const js = await read('admin.js');
  const css = await read('styles.css');
  assert.match(html, /class="admin-body admin-editorial"/);
  assert.match(html, /assets\/work24-logo-white\.png/);
  assert.match(html, /인증 없는 TEST 프로토타입/);
  for (const label of ['관리자 홈', '공지사항', 'FAQ', '팝업', '사이트 콘텐츠', '문의 관리']) assert.match(html, new RegExp(label));
  for (const action of ['임시저장', '전체 사이트 미리보기', '변경사항 적용', '변경 취소']) assert.match(html, new RegExp(action));
  assert.match(css, /admin editorial refinement/);
  assert.match(html, /class="admin-content-tabs"/);
  for (const label of ['메인 페이지', '공모요강', '일정·시상', '문의 페이지', '수상작']) assert.match(html, new RegExp(label));
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
  const pages = ['index.html', 'guide.html', 'notice.html', 'faq.html', 'inquiry.html', 'winners.html'];
  for (const page of pages) {
    const html = await read(page);
    assert.match(html, /href="index\.html">홈<\/a>/);
    assert.match(html, /class="to-top"/);
  }
  const notice = await read('notice.html');
  const css = await read('styles.css');
  assert.match(notice, /class="notice-board"/);
  for (const heading of ['번호', '구분', '제목', '작성일']) assert.match(notice, new RegExp(heading));
  assert.match(css, /\.notice-board thead\{background:#f3f3f1;color:#1/);
  assert.doesNotMatch(css, /\.notice-board thead\{background:#13296c/);
});

test('landing exposes guidelines, an attachment download and a four-month calendar', async () => {
  const html = await read('index.html');
  const guide = await read('guide.html');
  const inquiry = await read('inquiry.html');
  const config = await read('site-config.js');
  const css = await read('styles.css');
  assert.match(html, /id="scheduleCalendar"/);
  assert.match(html, /id="scheduleData"/);
  for (const label of ['운영 점검 기간', '공모전 접수', '1차 심사', '결과 발표 및 영상가이드 공개', '서비스 개발', '기능 심사 및 공개 검증', '시상식']) assert.match(html, new RegExp(label));
  assert.match(html, /data-start="2026-08-28"/);
  assert.match(html, /data-end="2026-09-01"/);
  assert.match(html, /data-start="2026-09-09"/);
  assert.match(html, /data-end="2026-11-20"/);
  assert.doesNotMatch(html, /class="contest-schedule"/);
  assert.match(html, />공모요강<\/a>/);
  assert.match(guide, /<title>공모요강 \|/);
  assert.match(html, /id="resourcesDownload"[^>]*>첨부파일 다운로드/);
  assert.match(config, /resourcesUrl:\s*['"]assets\/downloads\/고용24_AI_공모전_참고자료\.txt['"]/);
  assert.match(html, /class="overview-poster"/);
  assert.match(html, /공모전명/);
  assert.match(html, /공모주제/);
  assert.match(inquiry, /bangms1998@stunning\.kr/);
  assert.match(css, /\.calendar-day\.is-today/);
  assert.match(css, /\.calendar-day\.is-current-event/);
});
