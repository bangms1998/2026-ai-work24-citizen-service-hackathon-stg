const headers = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'public, max-age=300',
};

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const staging = url.hostname.endsWith('.pages.dev');
  const body = staging
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\nSitemap: ${url.origin}/sitemap.xml\n`;
  return new Response(body, { status: 200, headers });
}
