export async function onRequest({ request, next }) {
  const response = await next();
  const headers = new Headers(response.headers);
  if (new URL(request.url).hostname.endsWith('.pages.dev')) {
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
