import { rm, mkdir, cp, readdir } from 'node:fs/promises';

const src = new URL('../src/', import.meta.url);
const out = new URL('../docs/', import.meta.url);
const internalOnly = new Set(['admin.html', 'admin.js', 'apply.js']);

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of await readdir(src)) {
  if (internalOnly.has(file)) continue;
  await cp(new URL(file, src), new URL(file, out), { recursive: true });
}

console.log('build=PASS output=docs admin_public=false');
