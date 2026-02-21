/**
 * sync-now.mjs
 * Reads Now.md from your Obsidian vault and updates data/now.json
 *
 * Obsidian Now.md format:
 *   <!-- Updated: Mar 2026 -->
 *   - Scaling BLEUKEI to 100+ local business clients | Feb 2026
 *   - Building OpenClaw v2 | Ongoing
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const VAULT_PATH = 'C:\\Users\\noabl\\Documents\\Obsidian Vault';
const NOW_NOTE = join(VAULT_PATH, 'Now.md');
const OUTPUT = join(ROOT, 'data', 'now.json');

if (!existsSync(NOW_NOTE)) {
  console.log('sync-now: No Now.md found in Obsidian vault — skipping sync');
  process.exit(0);
}

const content = readFileSync(NOW_NOTE, 'utf-8');
const lines = content.split('\n');

const items = [];
let updatedAt = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

for (const line of lines) {
  // Parse: - Item text | Date label
  const itemMatch = line.match(/^-\s+(.+?)\s*\|\s*(.+)$/);
  if (itemMatch) {
    items.push({ text: itemMatch[1].trim(), date: itemMatch[2].trim() });
    continue;
  }
  // Parse: <!-- Updated: Month Year -->
  const updatedMatch = line.match(/Updated:\s*(.+?)(?:-->|$)/i);
  if (updatedMatch) {
    updatedAt = updatedMatch[1].trim();
  }
}

if (items.length === 0) {
  console.log('sync-now: No items found in Now.md — skipping sync');
  process.exit(0);
}

const existing = existsSync(OUTPUT) ? JSON.parse(readFileSync(OUTPUT, 'utf-8')) : {};
writeFileSync(OUTPUT, JSON.stringify({ updatedAt, items }, null, 2));
console.log(`sync-now: Synced ${items.length} items (was ${existing.items?.length ?? 0}) → data/now.json`);
