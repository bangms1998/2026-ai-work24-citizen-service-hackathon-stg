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
