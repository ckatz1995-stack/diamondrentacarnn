// Custom Node.js ESM loader for Wix backend unit tests.
// Handles two things:
//   1. .jsw files → loaded as plain JavaScript ESM (Wix-specific extension)
//   2. 'wix-*' bare imports → replaced with minimal stubs so pure-logic
//      functions can be imported and tested without a Wix runtime.
//   3. 'backend/*' path aliases → resolved to src/backend/

import { resolve as pathResolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC_BACKEND = pathResolve(ROOT, 'src/backend');

// Minimal stub that satisfies any import from wix-* packages.
const WIX_STUB = `
export default {};
export const currentUser = null;
export function query(){
  const chain = { eq(){return this}, ne(){return this}, lt(){return this}, gt(){return this},
    ge(){return this}, le(){return this}, ascending(){return this}, descending(){return this},
    limit(){return this}, find(){ return Promise.resolve({ items: [] }); } };
  return chain;
}
export function insert(col, item){ return Promise.resolve({ ...item, _id: item._id || 'mock-id' }); }
export function get(){ return Promise.resolve(null); }
export function update(col, item){ return Promise.resolve({ ...item }); }
export function remove(){ return Promise.resolve(); }
`.trim();

export async function resolve(specifier, context, nextResolve) {
  // Wix runtime modules → stub
  if (specifier.startsWith('wix-') || specifier.startsWith('wix-users')) {
    return { shortCircuit: true, url: `data:text/javascript,${encodeURIComponent(WIX_STUB)}` };
  }

  // backend/* path aliases → src/backend/*
  if (specifier.startsWith('backend/')) {
    const rel = specifier.slice('backend/'.length);
    // Try with and without .js extension
    for (const candidate of [rel, rel + '.js']) {
      const abs = pathResolve(SRC_BACKEND, candidate);
      if (existsSync(abs)) {
        return { shortCircuit: true, url: `file://${abs}` };
      }
      // Also try .jsw
      const absJsw = pathResolve(SRC_BACKEND, rel.replace(/\.js$/, '') + '.jsw');
      if (existsSync(absJsw)) {
        return { shortCircuit: true, url: `file://${absJsw}` };
      }
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  // Force .jsw files to be treated as ESM JavaScript
  if (url.endsWith('.jsw')) {
    return nextLoad(url, { ...context, format: 'module' });
  }
  return nextLoad(url, context);
}
