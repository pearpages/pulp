/**
 * Renders the Open Graph card (og/card.html → public/og.png, 1200×630) and the apple-touch-icon
 * (the mark on the brand fill, public/apple-touch-icon.png, 180×180).
 *   pnpm --filter pulp-docs og-card
 * Rerun after a brand change and commit the PNG. The page is set with inline content (tokens.css, the
 * brand typefaces as data URLs, the wordmark), so nothing is fetched and the render needs no server.
 * PNG, not WebP: LinkedIn's link preview does not reliably take WebP.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const require = createRequire(import.meta.url);
const APP = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(APP, 'public/og.png');
const ICON = resolve(APP, 'public/apple-touch-icon.png');

const FONTS = [
  ['Archivo Variable', 'archivo', 'archivo-latin-wght-normal.woff2'],
  ['Instrument Sans Variable', 'instrument-sans', 'instrument-sans-latin-wght-normal.woff2'],
  ['Geist Mono Variable', 'geist-mono', 'geist-mono-latin-wght-normal.woff2'],
  ['Nunito Variable', 'nunito', 'nunito-latin-wght-normal.woff2'],
  ['Inter Variable', 'inter', 'inter-latin-wght-normal.woff2'],
];
const fontFaces = FONTS.map(([family, pkg, file]) => {
  const path = resolve(dirname(require.resolve(`@fontsource-variable/${pkg}/package.json`)), 'files', file);
  const data = readFileSync(path).toString('base64');
  return `@font-face { font-family: '${family}'; font-weight: 100 900; src: url(data:font/woff2;base64,${data}) format('woff2-variations'); }`;
}).join('\n');

const tokens = readFileSync(require.resolve('@pearpages/pulp-tokens/tokens.css'), 'utf8');
const wordmark = readFileSync(resolve(APP, 'public/wordmark-dark.svg'), 'utf8').replace('<svg ', '<svg class="intro__mark" ');
const tiles = [
  ['pulp', 'light'],
  ['pulp', 'dark'],
  ['bitepals', 'light'],
  ['bitepals', 'dark'],
]
  .map(
    ([brand, scheme]) => `<section class="tile" data-brand="${brand}" data-scheme="${scheme}">
        <p class="tile__label">${brand} · ${scheme}</p>
        <span class="tile__button">Save changes</span>
        <div class="tile__scale">${'<span class="tile__cell"></span>'.repeat(5)}</div>
        <div class="tile__accents">${'<span class="tile__dot"></span>'.repeat(8)}</div>
      </section>`,
  )
  .join('\n      ');

const html = readFileSync(resolve(APP, 'og/card.html'), 'utf8')
  .replace('/*FONTS*/', () => fontFaces)
  .replace('/*TOKENS*/', () => tokens)
  .replace('<!--WORDMARK-->', () => wordmark)
  .replace('<!--TILES-->', () => tiles);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: OUT, type: 'png' });

  // iOS rounds the icon itself and shows transparency as black: the mark sits on its own fill, edge to edge.
  const mark = readFileSync(resolve(APP, 'public/favicon.svg'), 'utf8').replace('<svg ', '<svg class="icon__mark" ');
  const icon = await browser.newPage({ viewport: { width: 180, height: 180 }, deviceScaleFactor: 1 });
  await icon.setContent(
    `<html data-brand="pulp" data-scheme="light"><style>${tokens}
      * { margin: 0; } body { background: var(--color-action-primary); }
      .icon__mark { display: block; inline-size: 180px; block-size: 180px; }</style><body>${mark}</body></html>`,
  );
  await icon.screenshot({ path: ICON, type: 'png' });
} finally {
  await browser.close();
}
console.log(`Wrote ${OUT} and ${ICON}`);
