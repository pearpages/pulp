/**
 * Which entries need `'use client'`, decided from source.
 *
 * An entry is a client module when anything it reaches, through relative
 * imports, uses a client-only React API or a package that does. Everything
 * else is server-safe: it renders in a React Server Component as it is.
 *
 * Source, not dist, is what is analysed: esbuild puts a shared module in the
 * chunk of exactly the entries that reach it, so a server-safe entry never
 * imports a chunk holding client code. The dist smoke test proves the result
 * (the directive per entry, and a real import under the `react-server` condition).
 *
 *   import { clientEntries } from './client-entries.mjs'   → Map<entry, boolean>
 *   node scripts/client-entries.mjs                        → stamps dist/<entry>.js (tsup's onSuccess)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Absent from React's `react-server` build, or meaningless without a browser.
const CLIENT_API =
  /\b(useState|useReducer|useEffect|useLayoutEffect|useInsertionEffect|useRef|useImperativeHandle|useContext|createContext|useCallback|useMemo|useSyncExternalStore|useTransition|useDeferredValue|useOptimistic|useActionState|createPortal)\b/;
const CLIENT_PACKAGES = ['react-aria-components', '@pearpages/modals', '@floating-ui/react-dom', '@internationalized/date', 'react-dom'];

const IMPORT = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]/g;

function resolveModule(from, specifier) {
  const base = resolve(dirname(from), specifier);
  for (const candidate of [`${base}.ts`, `${base}.tsx`, resolve(base, 'index.ts'), resolve(base, 'index.tsx')]) {
    if (existsSync(candidate)) return candidate;
  }
  return null; // a stylesheet, or not ours
}

function isClient(file, seen = new Set()) {
  if (seen.has(file)) return false;
  seen.add(file);
  const source = readFileSync(file, 'utf8');
  if (CLIENT_API.test(source)) return true;
  for (const [, from, bare] of source.matchAll(IMPORT)) {
    const specifier = from ?? bare;
    if (CLIENT_PACKAGES.some((name) => specifier === name || specifier.startsWith(`${name}/`))) return true;
    if (!specifier.startsWith('.')) continue;
    const next = resolveModule(file, specifier);
    if (next && isClient(next, seen)) return true;
  }
  return false;
}

/** entry name (as in tsup.config.ts) → needs 'use client' */
export function clientEntries(entries) {
  return new Map(Object.entries(entries).map(([name, path]) => [name, isClient(resolve(ROOT, path))]));
}

export const DIRECTIVE = '"use client";';

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  // tsup.config.ts is TypeScript; the entry map is all that is needed, and it is a plain object literal.
  const config = readFileSync(resolve(ROOT, 'tsup.config.ts'), 'utf8');
  const entries = Object.fromEntries([...config.matchAll(/^\s*'?([\w-]+)'?:\s*'(src\/[^']+)'/gm)].map(([, name, path]) => [name, path]));
  const stamped = [];
  for (const [name, client] of clientEntries(entries)) {
    const file = resolve(ROOT, 'dist', `${name}.js`);
    if (!client || !existsSync(file)) continue;
    const code = readFileSync(file, 'utf8');
    // On the first line, without a line break, so the source map's lines stay true.
    if (!code.startsWith(DIRECTIVE)) writeFileSync(file, `${DIRECTIVE}${code}`);
    stamped.push(name);
  }
  console.log(`'use client' on ${stamped.length} of ${Object.keys(entries).length} entries; server-safe: ${Object.keys(entries).filter((name) => !stamped.includes(name)).join(', ')}`);
}
