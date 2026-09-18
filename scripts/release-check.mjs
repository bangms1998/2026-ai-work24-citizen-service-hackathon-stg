import { access, readFile } from 'node:fs/promises';

const mode = process.argv[2] || 'staging';
const root = new URL('../', import.meta.url);
const source = (name) => new URL(`../src/${name}`, import.meta.url);
const built = (name) => new URL(`../docs/${name}`, import.meta.url);
const read = (url) => readFile(url, 'utf8');
const exists = async (url) => { try { await access(url); return true; } catch { return false; } };
const publicPages = ['index.html', 'guide.html', 'notice.html', 'faq.html', 'inquiry.html', 'apply.html'];

const config = await read(source('site-config.js'));
const app = await read(source('app.js'));
const pages = await Promise.all(publicPages.map((name) => read(source(name))));
const allPublic = `${config}\n${pages.join('\n')}`;
const state = config.match(/state:\s*['"]([^'"]*)/)?.[1] || '';
const formUrl = config.match(/formUrl:\s*['"]([^'"]*)/)?.[1] || '';

if (mode === 'staging') {
  const failures = [];
  if (!['AUTO', 'OPEN'].includes(state) || !/^https:\/\//.test(formUrl)) failures.push('staging intake must use the approved HTTPS Form URL with scheduled or open lifecycle state');
  const apply = await read(source('apply.html'));
  const inquiry = await read(source('inquiry.html'));
  const inquiryHasForm = /<form\b/i.test(inquiry);
  const relayPath = new URL('../functions/api/inquiry.js', import.meta.url);
  const relay = await read(relayPath);
  const inquiryIsApprovedServerRelay = inquiryHasForm
    && /id="inquiryForm"/.test(inquiry)
    && /id="inquiryConsent"/.test(inquiry)
    && /6개월/.test(inquiry)
    && /inquiryForm/.test(app)
    && /fetch\(['"]\/api\/inquiry['"]/.test(app)
    && /INQUIRY_RELAY_URL/.test(relay)
    && /INQUIRY_RELAY_TOKEN/.test(relay)
    && /allowedOrigin/.test(relay)
    && !/localStorage|XMLHttpRequest|navigator\.sendBeacon/.test(app);
  if (/<form\b/i.test(apply) || (inquiryHasForm && !inquiryIsApprovedServerRelay)) failures.push('public pre-open routes must keep application closed and use the approved inquiry relay');
  if (!(await exists(source('_headers')))) failures.push('security headers are missing');
  if (await exists(built('admin.html')) || await exists(built('admin.js'))) failures.push('browser-only admin leaked into the public build');
  if (/stunning-work24-stg\.pages\.dev/.test(allPublic)) failures.push('public source hardcodes the staging hostname');
  if (failures.length) {
    console.log('STAGING_READY=FAIL');
    failures.forEach((item) => console.log(`- ${item}`));
    process.exit(1);
  }
  console.log('STAGING_READY=PASS');
  console.log('- approved application intake follows the configured lifecycle');
  console.log('- approved inquiry mail relay contract');
  console.log('- public admin excluded');
  console.log('- hostname-independent routes');
  console.log('- security headers present');
  process.exit(0);
}

if (mode !== 'production') {
  console.error('usage: node scripts/release-check.mjs staging|production');
  process.exit(2);
}

const blockers = [];
if (!['AUTO', 'OPEN'].includes(state) || !/^https:\/\//.test(formUrl)) blockers.push('approved Form URL and scheduled/open state');
if (/\[미정\]|\[확인 필요\]|샘플/.test(allPublic)) blockers.push('placeholder content');
if (!(await exists(source('privacy.html')))) blockers.push('approved privacy notice');
if (/운영기관\s*\[확인 필요\]/.test(allPublic)) blockers.push('approved operator identity and contact');
if (/서버로 전송하거나 저장하지|접수 준비 중/.test(allPublic)) blockers.push('production intake journey');

if (blockers.length) {
  console.log('PRODUCTION_READY=BLOCKED');
  blockers.forEach((item) => console.log(`- ${item}`));
  process.exit(1);
}
console.log('PRODUCTION_READY=PASS');
