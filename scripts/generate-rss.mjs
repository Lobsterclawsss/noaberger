/**
 * generate-rss.mjs
 * Generates public/feed.xml from the posts array below.
 * Add entries here as you publish writing.
 *
 * Post format:
 *   { title: string, slug: string, date: string (ISO), excerpt: string }
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SITE_URL = 'https://noaberger.com';
const AUTHOR = 'Noa Berger';
const DESCRIPTION = 'Thoughts on AI, operations, and building businesses.';

// Add posts here as you publish writing
const posts = [
  // Example:
  // {
  //   title: 'How I Built an 8-Agent AI System',
  //   slug: 'how-i-built-8-agent-ai-system',
  //   date: '2026-03-01',
  //   excerpt: 'The story behind OpenClaw and what I learned running AI agents 24/7.',
  // },
];

const items = posts
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .map(
    (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/writing/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/writing/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
    </item>`
  )
  .join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${AUTHOR}</title>
    <link>${SITE_URL}</link>
    <description>${DESCRIPTION}</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

writeFileSync(join(ROOT, 'public', 'feed.xml'), rss.trim() + '\n');
console.log(`generate-rss: ${posts.length} post(s) → public/feed.xml`);
