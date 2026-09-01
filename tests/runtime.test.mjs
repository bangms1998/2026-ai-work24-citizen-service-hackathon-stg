import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet as robots } from '../functions/robots.txt.js';
import { onRequestGet as sitemap } from '../functions/sitemap.xml.js';
import { onRequest as middleware } from '../functions/_middleware.js';

const call = (handler, url) => handler({ request: new Request(url) });

test('pages.dev remains noindex while a later custom domain becomes indexable automatically', async () => {
  const staging = await call(robots, 'https://stunning-work24-stg.pages.dev/robots.txt');
  assert.equal(staging.status, 200);
  assert.match(await staging.text(), /Disallow: \/$/m);

  const production = await call(robots, 'https://contest.example.kr/robots.txt');
  const body = await production.text();
  assert.match(body, /Allow: \/$/m);
  assert.match(body, /Sitemap: https:\/\/contest\.example\.kr\/sitemap\.xml/);
});

test('sitemap derives every canonical URL from the request host', async () => {
  const response = await call(sitemap, 'https://contest.example.kr/sitemap.xml');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/xml/);
  const body = await response.text();
  assert.match(body, /https:\/\/contest\.example\.kr\/guide\.html/);
  assert.doesNotMatch(body, /pages\.dev|admin\.html|winners\.html/);
});

test('pages.dev responses are noindex while a custom domain is not forced noindex', async () => {
  const next = async () => new Response('ok');
  const staging = await middleware({ request: new Request('https://stunning-work24-stg.pages.dev/'), next });
  assert.equal(staging.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive');
  const production = await middleware({ request: new Request('https://contest.example.kr/'), next });
  assert.equal(production.headers.get('x-robots-tag'), null);
});
