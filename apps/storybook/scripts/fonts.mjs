/**
 * Copies the brand typefaces the manager needs into public/fonts (gitignored),
 * from the same fontsource packages the preview imports. The manager iframe
 * cannot use the preview's stylesheets, and the repo carries no binaries.
 */
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/fonts');
const FILES = {
  'instrument-sans': 'instrument-sans-latin-wght-normal.woff2',
  'geist-mono': 'geist-mono-latin-wght-normal.woff2',
};

mkdirSync(OUT, { recursive: true });
for (const [pkg, file] of Object.entries(FILES)) {
  const from = resolve(dirname(require.resolve(`@fontsource-variable/${pkg}/package.json`)), 'files', file);
  copyFileSync(from, resolve(OUT, file));
}
console.log(`Copied ${Object.keys(FILES).length} typefaces to public/fonts`);
