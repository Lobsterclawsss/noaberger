/**
 * CF Pages Function: POST /api/notion/update
 *
 * Generic Notion page property updater. Used by the dashboard to sync
 * project, chapter, and task changes back to Notion.
 *
 * Required env var (set in CF Pages dashboard → Settings → Environment Variables):
 *   NOTION_API_KEY  — your Notion integration token (starts with "secret_")
 *
 * Request body:
 *   { pageId: string, properties: NotionProperties }
 *
 * Auth:
 *   Header: X-Auth-Hash: <SHA-256 of dashboard password>
 *
 * Notion property formats:
 *   select:  { "Status": { "select": { "name": "In Progress" } } }
 *   number:  { "Status %": { "number": 0.75 } }
 *   date:    { "Due Date": { "date": { "start": "2026-02-23" } } }
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

  // Env check
  if (!env.NOTION_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'NOTION_API_KEY not set — add it in CF Pages dashboard → Settings → Environment Variables' }),
      { status: 503, headers: json }
    );
  }

  // Parse body
  let body;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: json }); }

  const { pageId, properties } = body ?? {};
  if (!pageId || !properties || typeof properties !== 'object') {
    return new Response(
      JSON.stringify({ error: 'Required: { pageId: string, properties: object }' }),
      { status: 400, headers: json }
    );
  }

  // PATCH Notion page
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
