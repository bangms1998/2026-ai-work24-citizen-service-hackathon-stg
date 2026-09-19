import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/inquiry.js';

const request = (body, origin='https://final-guideline-20260918.stunning-work24-stg.pages.dev') => new Request(`${origin}/api/inquiry`, {
  method: 'POST',
  headers: { origin, 'content-type': 'application/json' },
  body: JSON.stringify({
    type: '접수·제출', name: '김고용', email: 'person@example.test',
    title: '접수 문의', message: '제출 파일 규격을 자세히 확인하고 싶습니다.',
    consent: true, startedAt: Date.now() - 3000, website: '', ...body,
  }),
});

const body = async (response) => ({ status: response.status, json: await response.json() });

test('inquiry endpoint rejects an unapproved origin', async () => {
  const result = await body(await onRequestPost({ request: request({}, 'https://evil.example'), env: {} }));
  assert.equal(result.status, 403);
});

test('inquiry endpoint rate-limits bots that submit too quickly', async () => {
  const result = await body(await onRequestPost({ request: request({ startedAt: Date.now() }), env: {} }));
  assert.equal(result.status, 429);
});

test('inquiry endpoint fails closed until the mail relay secrets exist', async () => {
  const result = await body(await onRequestPost({ request: request({}), env: {} }));
  assert.equal(result.status, 503);
});

test('inquiry endpoint relays validated data and returns a receipt', async () => {
  const originalFetch = globalThis.fetch;
  let relayed;
  globalThis.fetch = async (_url, options) => {
    relayed = JSON.parse(options.body);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  try {
    const result = await body(await onRequestPost({
      request: request({}),
      env: { INQUIRY_RELAY_URL: 'https://script.google.com/macros/s/test/exec', INQUIRY_RELAY_TOKEN: 'test-token' },
    }));
    assert.equal(result.status, 201);
    assert.match(result.json.receipt, /^Q-\d{8}-[A-Z0-9]{6}$/);
    assert.equal(relayed.relayToken, 'test-token');
    assert.equal(relayed.retention, '6개월');
    assert.equal(relayed.email, 'person@example.test');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('inquiry endpoint accepts the production custom-domain punycode origin', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
  try {
    const origin = 'https://www.xn--299alkwa683hrtfsfp2mn8g3zd53kbtag2cdzeds0aqoj3nl9jq.com';
    const result = await body(await onRequestPost({
      request: request({}, origin),
      env: { INQUIRY_RELAY_URL: 'https://script.google.com/macros/s/test/exec', INQUIRY_RELAY_TOKEN: 'test-token' },
    }));
    assert.equal(result.status, 201);
    assert.equal(result.json.ok, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
