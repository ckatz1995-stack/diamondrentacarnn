#!/usr/bin/env node
/**
 * sync-shared-theme.mjs — keep the booking-ui pages' shared chrome identical.
 *
 * The booking-flow pages are standalone Wix HtmlComponent iframes, so they
 * can't @import a shared stylesheet at runtime. Instead, the canonical chrome
 * lives in src/public/booking-ui/shared/theme.css and is copied verbatim into
 * each page between marker comments:
 *
 *     <style>
 *       / * @shared-theme:start * /
 *       …canonical theme.css contents…
 *       / * @shared-theme:end * /
 *     </style>
 *
 * (markers shown with spaces here so this comment doesn't contain a literal one)
 *
 * Usage:
 *   node tools/sync-shared-theme.mjs            inject canon into every page
 *   node tools/sync-shared-theme.mjs --check    exit 1 if any page has drifted
 *
 * Pages that don't yet contain the markers are skipped with a notice — adopt a
 * page by pasting the start/end marker pair into one of its <style> blocks.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const UI_DIR = join(ROOT, 'src', 'public', 'booking-ui');
const CANON = join(UI_DIR, 'shared', 'theme.css');

const START = '/* @shared-theme:start */';
const END = '/* @shared-theme:end */';

// Pages eligible to consume the shared chrome. memberslogin.html is excluded
// on purpose — it's a standalone dark-theme portal login, not booking chrome.
const PAGES = ['index.html', 'vehicles.html', 'options.html', 'checkout.html', 'success.html', 'terms.html'];

const checkOnly = process.argv.includes('--check');

function buildBlock(canon) {
  // Indent the canon two spaces so it sits naturally inside a <style> block.
  const body = canon.replace(/\s+$/, '').split('\n').map((l) => (l ? '  ' + l : l)).join('\n');
  return `${START}\n${body}\n  ${END}`;
}

function replaceRegion(html, block) {
  const s = html.indexOf(START);
  const e = html.indexOf(END);
  if (s === -1 || e === -1 || e < s) return { found: false, html };
  // Preserve the indentation that precedes the start marker.
  let indentStart = s;
  while (indentStart > 0 && (html[indentStart - 1] === ' ' || html[indentStart - 1] === '\t')) indentStart--;
  const before = html.slice(0, indentStart);
  const after = html.slice(e + END.length);
  const indent = html.slice(indentStart, s);
  const next = before + indent + block + after;
  return { found: true, html: next };
}

const canon = await readFile(CANON, 'utf8');
const block = buildBlock(canon);

let drifted = 0;
let synced = 0;
let skipped = 0;

for (const page of PAGES) {
  const path = join(UI_DIR, page);
  let html;
  try {
    html = await readFile(path, 'utf8');
  } catch {
    console.log(`  · ${page} — not found, skipping`);
    continue;
  }
  const { found, html: next } = replaceRegion(html, block);
  const rel = relative(ROOT, path);
  if (!found) {
    console.log(`  · ${rel} — no markers, skipping (paste the marker pair to adopt)`);
    skipped++;
    continue;
  }
  if (next === html) {
    console.log(`  ✓ ${rel} — up to date`);
    continue;
  }
  if (checkOnly) {
    console.log(`  ✗ ${rel} — DRIFTED from shared/theme.css`);
    drifted++;
  } else {
    await writeFile(path, next);
    console.log(`  → ${rel} — synced`);
    synced++;
  }
}

if (checkOnly && drifted > 0) {
  console.error(`\n${drifted} page(s) out of sync with shared/theme.css. Run: npm run sync:theme`);
  process.exit(1);
}
if (!checkOnly) {
  console.log(`\nDone — ${synced} synced, ${skipped} without markers.`);
}
