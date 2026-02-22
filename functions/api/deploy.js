// Cloudflare Pages Function — proxies deploy webhook server-side
// CF_DEPLOY_HOOK must be set as a CF Pages environment secret (not exposed to client)
export async function onRequestPost(context) {
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
