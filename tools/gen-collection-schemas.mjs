// Generates src/backend/collectionSchemas.js from the cms/*.json schema files.
// Run from the repo root:  node tools/gen-collection-schemas.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CMS = path.join(ROOT, 'cms');
const OUT = path.join(ROOT, 'src', 'backend', 'collectionSchemas.js');

const TYPE_MAP = {
  Text: 'TEXT', LongText: 'TEXT', Number: 'NUMBER', Boolean: 'BOOLEAN',
  Date: 'DATE', DateTime: 'DATETIME', URL: 'URL', Image: 'IMAGE'
};
const PERM_MAP = { Anyone: 'ANYONE', Admin: 'ADMIN' };

const files = readdirSync(CMS).filter((f) => f.endsWith('.json')).sort();
const collections = files.map((f) => {
  const j = JSON.parse(readFileSync(path.join(CMS, f), 'utf8'));
  const fields = (j.fields || []).map((fl) => ({
    key: fl.key,
    displayName: fl.displayName,
    type: TYPE_MAP[fl.type] || 'TEXT'
  }));
  const p = j.permissions || {};
  return {
    _id: j.collectionId,
    displayName: j.displayName,
    fields,
    permissions: {
      read: PERM_MAP[p.read] || 'ADMIN',
      insert: PERM_MAP[p.insert] || 'ADMIN',
      update: PERM_MAP[p.update] || 'ADMIN',
      remove: PERM_MAP[p.delete] || 'ADMIN'
    }
  };
});

const banner = `/* eslint-disable */
// AUTO-GENERATED from /cms/*.json — do not edit by hand.
// Regenerate after changing any cms/*.json schema file:
//   node tools/gen-collection-schemas.mjs
// Field types use the Wix Data v2 Collections enum (TEXT, NUMBER, BOOLEAN,
// DATE, DATETIME, URL, IMAGE). Permissions use ANYONE | ADMIN.
`;
const body = `export const COLLECTION_SCHEMAS = ${JSON.stringify(collections, null, 2)};\n`;
writeFileSync(OUT, banner + '\n' + body);
console.log('Wrote', path.relative(ROOT, OUT), 'with', collections.length, 'collections,',
  collections.reduce((n, c) => n + c.fields.length, 0), 'fields total');
