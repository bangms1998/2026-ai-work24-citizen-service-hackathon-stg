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

test('Wanted Sans is self-hosted with its OFL license and Work24 logo provenance', async () => {
  const css = await read('styles.css');
  const html = await read('index.html');
  const license = await read('assets/fonts/OFL.txt');
  assert.match(css, /Wanted Sans Variable/);
  assert.match(css, /assets\/fonts\/WantedSansVariable\.woff2/);
  assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.match(html, /assets\/work24-logo\.svg/);
  assert.match(html, /www\.work24\.go\.kr/);
});

test('admin prototype exposes honest draft preview publish and rollback controls', async () => {
  const html = await read('admin.html');
  const app = await read('admin.js');
  for (const label of ['임시저장', '미리보기', '변경사항 적용', '변경 취소', '롤백']) {
    assert.match(html, new RegExp(label));
  }
  assert.match(html, /인증 없는 TEST 프로토타입/);
  assert.match(app, /localStorage/);
  assert.match(app, /dirty/);
  assert.match(app, /version/);
});
