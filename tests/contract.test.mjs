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

test('Google Form is a replaceable adapter and never a production hardcode', async () => {
  const config = await read('site-config.js');
  const app = await read('app.js');
  assert.match(config, /formUrl:\s*['"]['"]/);
  assert.match(config, /state:\s*['"]PREOPEN['"]/);
  assert.match(app, /Google Form/);
  assert.doesNotMatch(config, /docs\.google\.com\/forms\/d\/e\/[A-Za-z0-9_-]{20,}/);
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
  assert.match(html, /class="overview-brief"/);
  assert.match(html, /class="overview-facts"/);
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
  for (const action of ['임시저장', '전체 사이트 미리보기', '변경사항 적용', '변경 취소', 'CSV 내려받기']) assert.match(html, new RegExp(action));
  assert.match(css, /admin editorial refinement/);
  assert.match(css, /\.admin-editorial\{background:#f5f5f2;color:#171719/);
  assert.match(css, /\.admin-editorial \.admin-header\{[^}]*background:#111112/);
  assert.match(js, /localStorage/);
  assert.match(js, /rollback/);
  assert.match(js, /downloadInquiryCsv/);
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
