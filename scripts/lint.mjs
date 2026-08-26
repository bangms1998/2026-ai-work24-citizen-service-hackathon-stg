import { readdir, readFile } from 'node:fs/promises';
import { extname } from 'node:path';

const root = new URL('../src/', import.meta.url);
const textExtensions = new Set(['.html', '.css', '.js', '.json', '.txt', '.svg']);
let bad = 0;

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) {
      await walk(url);
      continue;
    }
    if (!textExtensions.has(extname(entry.name))) continue;
    const source = await readFile(url, 'utf8');
    if (/TODO|FIXME|<script(?! type="module")/.test(source)) {
      console.error('lint issue', url.pathname);
      bad += 1;
    }
  }
}

await walk(root);
if (bad) process.exit(1);
console.log('lint=PASS');
