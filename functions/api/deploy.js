// Cloudflare Pages Function — proxies deploy webhook server-side
// CF_DEPLOY_HOOK must be set as a CF Pages environment secret (not exposed to client)
// Only accepts requests originating from the site itself (CSRF protection via Origin check)
export async function onRequestPost(context) {
  const origin = context.request.headers.get('origin') ?? '';
  const allowed = ['https://noaberger.com', 'https://noaberger.pages.dev'];
  if (!allowed.includes(origin)) {
    return new Response('Forbidden', { status: 403 });
  }
  const hook = context.env.CF_DEPLOY_HOOK;
  if (!hook) {
    return new Response('Deploy hook not configured', { status: 500 });
  }
  try {
    const res = await fetch(hook, { method: 'POST' });
    return new Response(null, { status: res.ok ? 200 : 502 });
  } catch {
    return new Response('Deploy request failed', { status: 502 });
  }
}
