import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const root = new URL('../', import.meta.url);
const docs = (name) => new URL(`../docs/${name}`, import.meta.url);

test('public build excludes the browser-only admin and includes edge headers', async () => {
  await exec(process.execPath, ['scripts/build.mjs'], { cwd: root });
  await assert.rejects(access(docs('admin.html')));
  await assert.rejects(access(docs('admin.js')));
  await assert.rejects(access(docs('apply.js')));
  const headers = await readFile(docs('_headers'), 'utf8');
  assert.match(headers, /Content-Security-Policy:/);
  assert.match(await readFile(docs('404.html'), 'utf8'), /요청하신 페이지를 찾을 수 없습니다/);
});

test('staging readiness passes while production launch remains blocked by missing approvals', async () => {
  const staging = await exec(process.execPath, ['scripts/release-check.mjs', 'staging'], { cwd: root });
  assert.match(staging.stdout, /STAGING_READY=PASS/);
  await assert.rejects(
    exec(process.execPath, ['scripts/release-check.mjs', 'production'], { cwd: root }),
    (error) => /PRODUCTION_READY=BLOCKED/.test(error.stdout) && /approved Form URL|placeholder content|privacy notice/.test(error.stdout),
  );
});
