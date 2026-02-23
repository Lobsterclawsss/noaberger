/**
 * CF Pages Function: POST /api/notion/complete
 *
 * Marks a task as Done in Notion and records actual hours.
 * Wraps /api/notion/update with a task-completion-specific payload.
 *
 * Required env var: NOTION_API_KEY (Notion integration token)
 *
 * Request body:
 *   { pageId: string, actualHours: number, cost?: number }
 *
 * Sets in Notion:
 *   Status             → "Done"
 *   Actual Time (hrs)  → actualHours
 *   Cost               → cost (optional)
 *
 * Auth: X-Auth-Hash header (SHA-256 of dashboard password)
 */

const ADMIN_HASH = '401b4d6c69937db32ae45f66b66af19ffc54e07146549bec2ea564b190352156';
const NOTION_VERSION = '2022-06-28';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Hash',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const json = { 'Content-Type': 'application/json', ...CORS };

  // Auth
  const authHash = request.headers.get('X-Auth-Hash') ?? '';
  if (authHash !== ADMIN_HASH) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: json });
  }

  if (!env.NOTION_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'NOTION_API_KEY not set in CF Pages environment' }),
      { status: 503, headers: json }
    );
  }

  let body;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: json }); }

  const { pageId, actualHours, cost } = body ?? {};
  if (!pageId || typeof actualHours !== 'number' || actualHours < 0) {
    return new Response(
      JSON.stringify({ error: 'Required: { pageId: string, actualHours: number }' }),
      { status: 400, headers: json }
    );
  }

  // Build Notion properties payload
  const properties = {
    'Status': { select: { name: 'Done' } },
    'Actual Time (hrs)': { number: actualHours },
  };
  if (typeof cost === 'number') {
    properties['Cost'] = { number: cost };
  }

  const notionRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${env.NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ properties }),
  });

  if (!notionRes.ok) {
    const detail = await notionRes.text().catch(() => '');
    return new Response(
      JSON.stringify({ error: `Notion API returned ${notionRes.status}`, detail }),
      { status: notionRes.status, headers: json }
    );
  }

  const updated = await notionRes.json();
  return new Response(
    JSON.stringify({ ok: true, notionId: updated.id, lastEdited: updated.last_edited_time }),
    { headers: json }
  );
}
