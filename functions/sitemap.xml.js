const publicRoutes = ['/', '/guide.html', '/notice.html', '/faq.html', '/inquiry.html', '/apply.html'];

export async function onRequestGet({ request }) {
  const origin = new URL(request.url).origin;
  const urls = publicRoutes.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
