/**
 * Serves storybook-static on 127.0.0.1 for the tests of the built site
 * (check-built-site.mjs and the Playwright visual suite). Node builtins only.
 *
 *   node scripts/serve-static.mjs [port]   as a process (Playwright's webServer)
 *   import { serve } from './serve-static.mjs'   in a script; port 0 picks a free one
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const STATIC = resolve(dirname(fileURLToPath(import.meta.url)), '../storybook-static');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };

export async function serve(port = 0) {
  const server = createServer((request, response) => {
    let file = join(STATIC, normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname)));
    if (!file.startsWith(STATIC)) return response.writeHead(403).end();
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) return response.writeHead(404).end();
    response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
  });
  await new Promise((done) => server.listen(port, '127.0.0.1', done));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!existsSync(join(STATIC, 'index.json'))) {
    console.error('serve-static: storybook-static is missing. Run `pnpm storybook:build`.');
    process.exit(1);
  }
  const { origin } = await serve(Number(process.argv[2] ?? 6107));
  console.log(`serve-static: ${origin}`);
}
