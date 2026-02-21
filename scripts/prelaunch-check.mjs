// Pre-launch link checker for noaberger.com
// Run: node scripts/prelaunch-check.mjs [base-url]
// Example: node scripts/prelaunch-check.mjs http://localhost:3001
//          node scripts/prelaunch-check.mjs https://noaberger.com

import https from 'https';
import http from 'http';

const BASE = process.argv[2] || 'http://localhost:3001';

const ROUTES = [
  '/',
  '/about',
  '/work',
  '/contact',
  '/sitemap.xml',
  '/robots.txt',
  '/favicon.svg',
  '/og-image.svg',
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: 8000 }, (res) => {
      resolve({ url, status: res.statusCode, ok: res.statusCode < 400 });
    });
    req.on('error', (e) => resolve({ url, status: 0, ok: false, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 0, ok: false, error: 'timeout' }); });
  });
}

console.log(`
Pre-launch check: ${BASE}
${'─'.repeat(50)}`);

const results = await Promise.all(ROUTES.map(r => checkUrl(`${BASE}${r}`)));
let pass = 0, fail = 0;

for (const r of results) {
  const icon = r.ok ? '✓' : '✗';
  const note = r.error ? ` (${r.error})` : '';
  console.log(`${icon} [${r.status || '---'}] ${r.url}${note}`);
  r.ok ? pass++ : fail++;
}

console.log(`
${'─'.repeat(50)}`);
console.log(`${pass} passed, ${fail} failed
`);
if (fail > 0) process.exit(1);