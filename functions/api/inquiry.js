const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

const limits = { type: 30, name: 30, email: 100, title: 80, message: 2000 };
const allowedTypes = new Set(['공모전 일반', '참가 자격', '접수·제출', '사이트 이용']);
const clean = (value, max) => String(value ?? '').trim().slice(0, max);
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('origin') || '';
  let originHost = '';
  try { originHost = new URL(origin).hostname; } catch {}
  const allowedOrigin = originHost === 'www.국민참여고용서비스발굴온라인해커톤.com'
    || originHost.endsWith('.stunning-work24-stg.pages.dev')
    || originHost === 'stunning-work24-stg.pages.dev';
  if (!allowedOrigin) return json({ ok: false, error: '허용되지 않은 요청입니다.' }, 403);
  if (!String(request.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
    return json({ ok: false, error: '지원하지 않는 요청 형식입니다.' }, 415);
  }

  let input;
  try { input = await request.json(); } catch { return json({ ok: false, error: '요청 내용을 확인해 주세요.' }, 400); }
  if (input.website) return json({ ok: false, error: '잠시 후 다시 시도해 주세요.' }, 429);
  const startedAt = Number(input.startedAt);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 2000 || Date.now() - startedAt > 86400000) {
    return json({ ok: false, error: '페이지를 새로고침한 뒤 다시 작성해 주세요.' }, 429);
  }

  const data = Object.fromEntries(Object.entries(limits).map(([key, max]) => [key, clean(input[key], max)]));
  if (!allowedTypes.has(data.type) || data.name.length < 1 || !validEmail(data.email)
    || data.title.length < 2 || data.message.length < 10 || input.consent !== true) {
    return json({ ok: false, error: '필수 입력값과 개인정보 동의를 확인해 주세요.' }, 400);
  }
  if (!env.INQUIRY_RELAY_URL || !env.INQUIRY_RELAY_TOKEN) {
    return json({ ok: false, error: '문의 접수가 준비 중입니다. 운영사무국 이메일을 이용해 주세요.' }, 503);
  }

  const receipt = `Q-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const upstream = await fetch(env.INQUIRY_RELAY_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...data, receipt, relayToken: env.INQUIRY_RELAY_TOKEN, retention: '6개월' }),
  }).catch(() => null);
  if (!upstream?.ok) return json({ ok: false, error: '전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }, 502);
  const result = await upstream.json().catch(() => ({}));
  if (result.ok !== true) return json({ ok: false, error: '전송을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.' }, 502);
  return json({ ok: true, receipt }, 201);
}

export function onRequest() {
  return json({ ok: false, error: '허용되지 않은 요청입니다.' }, 405);
}
