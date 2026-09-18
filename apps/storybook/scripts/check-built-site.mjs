/**
 * Opens the *built* site (storybook-static) in Chromium and checks what is painted.
 *
 * Every other test renders through Vite's dev transform, where stylesheets are
 * injected in import order. The production build splits CSS into chunks and
 * links them in its own order, and cascade layers rank by first appearance: on
 * 2026-09-18 the deployed site linked a components chunk before the reset, so
 * the reset beat every component (a primary Button painted as bare text) while
 * all story tests, screenshots and axe were green. This is the test level that
 * sees it.
 *
 * Per story, in the page:
 *   1. the cascade-layer order, as the browser met it, is layers.css's order;
 *   2. for every element a rule in `@layer components` matches, each property
 *      that rule sets computes to a value one of the matching component rules
 *      asked for. If none did, something outside the component (reset, base)
 *      won the cascade. Checked by forcing each candidate rule inline and
 *      comparing computed values, so no selector specificity is re-implemented.
 *
 *   node scripts/check-built-site.mjs              every story
 *   node scripts/check-built-site.mjs button menu  only ids containing a word
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const STATIC = resolve(APP, 'storybook-static');
const LAYERS = readFileSync(resolve(APP, '../../packages/css/src/layers.css'), 'utf8').match(/@layer ([^;{]+);/)[1].split(',').map((name) => name.trim());
const CONCURRENCY = 4;

/**
 * A property a component sets and legitimately does not get, with the reason.
 * Keys are `property` or `property@selector-fragment`.
 */
const EXPECTED_LOSSES = {};

if (!existsSync(resolve(STATIC, 'index.json'))) {
  console.error('check-built-site: storybook-static is missing. Run `pnpm storybook:build`.');
  process.exit(1);
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = createServer((request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  let file = join(STATIC, path);
  if (!file.startsWith(STATIC)) return response.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) return response.writeHead(404).end();
  response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;

/** Runs in the page. Returns { layers, losses }. */
function inspect() {
  const SKIP = /^(--|transition|animation|will-change|cursor|pointer-events|content$)/;
  const layers = [];
  const rules = [];
  const see = (name) => name && !layers.includes(name) && layers.push(name);

  const walk = (list, inComponents, parent) => {
    for (const rule of list) {
      const kind = rule.constructor.name;
      if (kind === 'CSSLayerStatementRule') rule.nameList.forEach(see);
      else if (kind === 'CSSLayerBlockRule') {
        see(rule.name);
        walk(rule.cssRules, inComponents || rule.name === 'components', parent);
      } else if (kind === 'CSSStyleRule') {
        const selector = parent ? rule.selectorText.split(',').map((part) => (part.includes('&') ? part.replaceAll('&', `:is(${parent})`) : `:is(${parent}) ${part}`)).join(',') : rule.selectorText;
        if (inComponents && rule.style.length) rules.push({ selector, style: rule.style });
        if (rule.cssRules?.length) walk(rule.cssRules, inComponents, selector);
      } else if (kind === 'CSSMediaRule' || kind === 'CSSSupportsRule' || kind === 'CSSContainerRule') {
        if (kind !== 'CSSMediaRule' || matchMedia(rule.conditionText).matches) walk(rule.cssRules, inComponents, parent);
      }
    }
  };
  for (const sheet of document.styleSheets) {
    try { walk(sheet.cssRules, false, ''); } catch { /* cross-origin: not ours */ }
  }

  // Forcing a value inline must not start a transition, or computed values are mid-flight.
  const still = document.createElement('style');
  still.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }';
  document.head.append(still);

  // Stories are horizontal, left to right: a logical property and its physical twin are one slot.
  const SIDES = { 'block-start': 'top', 'block-end': 'bottom', 'inline-start': 'left', 'inline-end': 'right' };
  const twin = (prop) => {
    if (prop === 'inline-size') return 'width';
    if (prop === 'block-size') return 'height';
    if (/^(min|max)-(inline|block)-size$/.test(prop)) return prop.replace('inline-size', 'width').replace('block-size', 'height');
    for (const [logical, physical] of Object.entries(SIDES)) if (prop.includes(logical)) return prop.replace(logical, physical).replace(/^inset-/, '');
    return prop;
  };
  const important = (style) => [...new Set(Array.from(style).filter((prop) => !SKIP.test(prop)).map(twin))];
  const declarations = (style) => style.cssText.split(';').map((d) => d.trim()).filter(Boolean).filter((d) => !d.startsWith('--')).map((d) => `${d.replace(/\s*!important$/, '')} !important`).join(';');

  const elements = [...document.querySelectorAll('body *')].filter((el) => !el.closest('#storybook-docs, .sb-wrapper, .sb-preparing-story, .sb-preparing-docs, .sb-nopreview, .sb-errordisplay, script, style, head'));
  const losses = [];
  for (const el of elements) {
    const candidates = rules.filter((rule) => { try { return el.matches(rule.selector); } catch { return false; } });
    if (!candidates.length) continue;
    const props = [...new Set(candidates.flatMap((rule) => important(rule.style)))];
    const computed = getComputedStyle(el);
    const actual = Object.fromEntries(props.map((prop) => [prop, computed.getPropertyValue(prop)]));
    const original = el.getAttribute('style');
    const wanted = Object.fromEntries(props.map((prop) => [prop, new Set()]));
    // A rule forced whole brings its own font-size, which moves every em-based value it is
    // compared on (line-height, 1em icons). So font-size is read from the rule as it is, and
    // everything else with the element's real font-size pinned.
    // The same for color: outline and border colours default to currentcolor.
    const PINS = ['font-size', 'color'];
    const pinned = PINS.map((prop) => `${prop}: ${computed.getPropertyValue(prop)} !important`).join(';');
    for (const rule of candidates) {
      el.setAttribute('style', `${original ?? ''};${declarations(rule.style)}`);
      const free = getComputedStyle(el);
      for (const prop of PINS) if (important(rule.style).includes(prop)) wanted[prop].add(free.getPropertyValue(prop));
      el.setAttribute('style', `${original ?? ''};${declarations(rule.style)};${pinned}`);
      const forced = getComputedStyle(el);
      for (const prop of important(rule.style)) if (!PINS.includes(prop)) wanted[prop].add(forced.getPropertyValue(prop));
    }
    if (original === null) el.removeAttribute('style'); else el.setAttribute('style', original);
    // An inline style is a deliberate per-instance value (React Aria positions a slider thumb so): it may win.
    const inline = new Set(Array.from(el.style).map(twin));
    for (const prop of props) {
      if (wanted[prop].has(actual[prop]) || inline.has(prop)) continue;
      const rule = candidates.findLast((candidate) => important(candidate.style).includes(prop));
      losses.push({ element: `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? `.${el.className.split(' ')[0]}` : ''}`, selector: rule.selector, prop, got: actual[prop], wanted: [...wanted[prop]].join(' | ') });
    }
  }
  still.remove();
  return { layers, losses };
}

const filters = process.argv.slice(2);
const stories = Object.values(JSON.parse(readFileSync(resolve(STATIC, 'index.json'), 'utf8')).entries)
  .filter((entry) => entry.type === 'story')
  .filter((entry) => !filters.length || filters.some((word) => entry.id.includes(word)));

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
const problems = [];
const queue = [...stories];

async function worker() {
  const page = await context.newPage();
  for (let story = queue.shift(); story; story = queue.shift()) {
    try {
      await page.goto(`${origin}/iframe.html?viewMode=story&id=${story.id}`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.body.classList.contains('sb-show-main') && document.querySelector('#storybook-root')?.childElementCount > 0, null, { timeout: 15000 });
      await page.waitForTimeout(250);
      const { layers, losses } = await page.evaluate(inspect);
      const expected = LAYERS.filter((name) => layers.includes(name));
      if (layers.join() !== expected.join()) problems.push(`${story.id}: layer order is ${layers.join(', ')}; layers.css says ${expected.join(', ')}`);
      const seen = new Set();
      for (const loss of losses) {
        if (EXPECTED_LOSSES[loss.prop] || Object.keys(EXPECTED_LOSSES).some((key) => key.startsWith(`${loss.prop}@`) && loss.selector.includes(key.split('@')[1]))) continue;
        const line = `${story.id}: ${loss.element} ${loss.prop} is ${loss.got || '(empty)'}, the component asked for ${loss.wanted} (${loss.selector})`;
        if (!seen.has(line)) problems.push(line);
        seen.add(line);
      }
    } catch (error) {
      problems.push(`${story.id}: ${error.message.split('\n')[0]}`);
    }
  }
  await page.close();
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await browser.close();
server.close();

if (problems.length) {
  const byStory = new Set(problems.map((line) => line.split(':')[0]));
  console.error(`check-built-site: ${problems.length} problem(s) in ${byStory.size} of ${stories.length} stories\n${problems.slice(0, 80).map((line) => `  ${line}`).join('\n')}${problems.length > 80 ? `\n  … and ${problems.length - 80} more` : ''}`);
  process.exit(1);
}
console.log(`check-built-site: ${stories.length} stories painted as their components asked, layers in order (${LAYERS.join(', ')}).`);
