import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAYERS, render } from './build.mjs';
import { toCss } from './format.mjs';
import { PUBLIC_SEMANTIC_TOKENS } from './public-tokens.mjs';
import { nativeBrand, themeCss, toPx } from './outputs.mjs';
import { validateTokens } from './schema.mjs';
import { createRequire } from 'node:module';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const TOKENS = resolve(import.meta.dirname, '../tokens');

test('references become var(), composites become CSS', () => {
  assert.equal(toCss('{color.neutral.50}'), 'var(--color-neutral-50)');
  assert.equal(toCss({ value: 0.25, unit: 'rem' }), '0.25rem');
  assert.equal(toCss([0.2, 0.7, 0.3, 1]), 'cubic-bezier(0.2, 0.7, 0.3, 1)');
  assert.equal(toCss(['Archivo Variable', 'system-ui']), "'Archivo Variable', system-ui");
});

test('every token has a known $type, its own or its group\'s', () => {
  const problems = [];
  let files = 0;
  for (const tier of ['primitives', 'semantic', 'component']) {
    for (const name of readdirSync(resolve(TOKENS, tier)).filter((f) => f.endsWith('.json'))) {
      const tree = JSON.parse(readFileSync(resolve(TOKENS, tier, name), 'utf8'));
      problems.push(...validateTokens(tree, `${tier}/${name}`));
      files += 1;
    }
  }
  assert.ok(files > 4, 'no token files found');
  assert.deepEqual(problems, []);
});

test('the schema check fires: missing type, unknown type, misspelt key', () => {
  // Fixtures, not files: a wrong JSON dropped into tokens/ would enter the build glob.
  assert.deepEqual(validateTokens({ size: { $type: 'dimension', sm: { $value: '{space.1}' } } }), []);
  assert.deepEqual(validateTokens({ size: { sm: { $value: '{space.1}' } } }, 'x.json'), ["x.json: size.sm has no $type, its own or a group's"]);
  assert.deepEqual(validateTokens({ a: { $value: 1, $type: 'fontSize' } }, 'x.json'), ['x.json: a has an unknown $type "fontSize"']);
  assert.deepEqual(validateTokens({ size: { $typ: 'dimension', sm: { $value: 1 } } }, 'x.json'), [
    'x.json: size has an unknown key $typ',
    "x.json: size.sm has no $type, its own or a group's",
  ]);
  assert.deepEqual(validateTokens({ size: { sm: '4px' } }, 'x.json'), ['x.json: size.sm is neither a group nor a token']);
});

test('tokens.css restates the layer order of the css package before its own block', async () => {
  // Layers rank by first appearance; a bundler may load tokens.css before layers.css.
  const { css } = await render();
  const documented = readFileSync(resolve(TOKENS, '../../css/src/layers.css'), 'utf8').match(/@layer ([^;{]+);/)[1].split(',').map((name) => name.trim());
  assert.deepEqual(LAYERS, documented);
  assert.ok(css.indexOf(`@layer ${LAYERS.join(', ')};`) !== -1 && css.indexOf(`@layer ${LAYERS.join(', ')};`) < css.indexOf('@layer tokens {'));
});

test('both brands render, with light-dark() and calc() from $extensions', async () => {
  const { css, json } = await render();
  assert.match(css, /:root, \[data-brand="pulp"\] \{/);
  assert.match(css, /\[data-brand="bitepals"\] \{/);
  assert.match(css, /--color-surface-base: light-dark\(var\(--color-neutral-50\), var\(--color-neutral-975\)\);/);
  assert.match(css, /--space-4: calc\(var\(--space-unit\) \* 4\);/);
  assert.match(css, /--button-primary-bg: var\(--color-action-primary\);/);
  // Component tokens live on :root only: a brand block must not restate them.
  const bitepalsBlock = css.slice(css.indexOf('[data-brand="bitepals"]'));
  assert.doesNotMatch(bitepalsBlock, /--button-/);

  const manifest = JSON.parse(json);
  const surface = manifest.pulp.find((t) => t.name === '--color-surface-base');
  assert.equal(surface.light, '#f3f4f7');
  assert.equal(surface.dark, '#090b11');
  assert.equal(surface.tier, 'semantic');
  const shadow = manifest.bitepals.find((t) => t.name === '--shadow-raised');
  assert.equal(shadow.light, '0px 2px 12px 0px #1f24301a');
  assert.equal(shadow.dark, '0px 2px 12px 0px #00000038');
  // light-dark() takes colours only: shadows split into geometry + a colour variable.
  assert.match(css, /--shadow-raised-color: light-dark\(#0c0e141a, #00000059\);\n\s+--shadow-raised: 0px 2px 12px 0px var\(--shadow-raised-color\);/);
  assert.doesNotMatch(css, /light-dark\(0px/);
});

test('the published semantic names are unchanged', async () => {
  const { json } = await render();
  const manifest = JSON.parse(json);
  const actual = manifest.pulp.filter((t) => t.tier === 'semantic').map((t) => t.name).sort();
  const expected = [...PUBLIC_SEMANTIC_TOKENS].sort();
  const added = actual.filter((name) => !expected.includes(name));
  const removed = expected.filter((name) => !actual.includes(name));
  // These names are what consumers write in their own CSS. A rename does not
  // error for them: var() of a missing token drops the declaration and the page
  // silently repaints. Updating scripts/public-tokens.mjs is the deliberate act
  // that should cost — do it in this commit, and call it breaking in the changeset.
  assert.deepEqual({ added, removed }, { added: [], removed: [] });
});

test('every semantic token exists in both brands', async () => {
  const { json } = await render();
  const manifest = JSON.parse(json);
  const names = (brand) => manifest[brand].filter((t) => t.tier === 'semantic').map((t) => t.name).sort();
  assert.deepEqual(names('pulp'), names('bitepals'));
});

test('component tokens reference the semantic layer only, never a primitive or a literal', async () => {
  const { json } = await render();
  const manifest = JSON.parse(json);
  const semantic = new Set(manifest.pulp.filter((t) => t.tier === 'semantic').map((t) => t.name));
  const offenders = manifest.pulp
    .filter((t) => t.tier === 'component')
    .filter((t) => {
      const refs = [...t.css.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1]);
      return refs.length === 0 || refs.some((ref) => !semantic.has(ref));
    })
    .map((t) => `${t.name}: ${t.css}`);
  assert.deepEqual(offenders, []);
});

test("a subtle badge's edge is the colour of its label, in every tone", async () => {
  // Not a contrast test: a subtle fill is 1.0-1.4:1 on a surface in both brands, so the fill can
  // never be the boundary. The hairline carries the shape, and it is the label's own colour, which
  // the text pairs above already hold to 4.5:1 on every surface. This keeps the two from drifting.
  // Component tokens are declared once, on :root, so pulp's block is all of them.
  const { json } = await render();
  const byName = Object.fromEntries(JSON.parse(json).pulp.map((t) => [t.name, t]));
  const drifted = [];
  for (const tone of ['neutral', 'info', 'success', 'warning', 'error', 'action']) {
    const border = byName[`--badge-${tone}-subtle-border`];
    const fg = byName[`--badge-${tone}-subtle-fg`];
    if (border.css !== fg.css) drifted.push(`${tone}: edge ${border.css}, label ${fg.css}`);
  }
  assert.deepEqual(drifted, []);
});

test('every semantic colour has a dark counterpart', async () => {
  const { json } = await render();
  const manifest = JSON.parse(json);
  for (const brand of Object.keys(manifest)) {
    const missing = manifest[brand]
      .filter((t) => t.tier === 'semantic' && t.type === 'color' && t.dark === undefined)
      .map((t) => t.name);
    assert.deepEqual(missing, [], `${brand} semantic colours without dark: ${missing.join(', ')}`);
  }
});

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// WCAG AA for normal text: the pairs the components actually produce. Faint
// text is only promised on base and raised surfaces; muted and default on all.
const PAIRS = [
  ['--color-text-default', ['--color-surface-base', '--color-surface-raised', '--color-surface-sunken']],
  ['--color-text-muted', ['--color-surface-base', '--color-surface-raised', '--color-surface-sunken']],
  ['--color-text-faint', ['--color-surface-base', '--color-surface-raised']],
  ['--color-text-on-action', ['--color-action-primary', '--color-action-primary-hover', '--color-action-primary-active']],
  ['--color-action-text', ['--color-surface-base', '--color-surface-raised', '--color-surface-sunken', '--color-action-primary-quiet']],
  ['--color-text-default', ['--color-action-secondary', '--color-action-secondary-hover']],
  ['--color-status-error-text', ['--color-surface-base', '--color-surface-raised', '--color-surface-sunken']],
  ['--color-text-on-inverse', ['--color-surface-inverse']],
  // What overlays paint: body text, muted text, links and ghost actions, and a Menu's danger item.
  ...['--color-text-default', '--color-text-muted', '--color-action-text', '--color-status-error-text'].map((fg) => [fg, ['--color-surface-overlay']]),
  // A danger Button: filled (on-error over the three error fills), and quiet (error text over the subtle hover).
  ['--color-status-on-error', ['--color-status-error-hover', '--color-status-error-active']],
  ['--color-status-error-text', ['--color-action-secondary']],
  ...['success', 'warning', 'error', 'info', 'neutral'].flatMap((tone) => [
    [`--color-status-${tone}-text`, ['--color-surface-base', '--color-surface-raised', '--color-surface-sunken', `--color-status-${tone}-subtle`]],
    [`--color-status-on-${tone}`, [`--color-status-${tone}`]],
  ]),
  // The eight categorical fills: an Avatar's initials, a Chip's label.
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => [`--color-accent-on-${n}`, [`--color-accent-${n}`]]),
];

test('text pairs meet WCAG AA (4.5:1) in every brand and scheme', async () => {
  const { json } = await render();
  const manifest = JSON.parse(json);
  const failures = [];
  for (const [brand, tokens] of Object.entries(manifest)) {
    const byName = Object.fromEntries(tokens.map((t) => [t.name, t]));
    for (const [fg, bgs] of PAIRS) {
      for (const bg of bgs) {
        for (const scheme of ['light', 'dark']) {
          const ratio = contrast(byName[fg][scheme], byName[bg][scheme]);
          if (ratio < 4.5) failures.push(`${brand}/${scheme}: ${fg} on ${bg} = ${ratio.toFixed(2)}`);
        }
      }
    }
  }
  assert.deepEqual(failures, []);
});

test('every size scale has distinct values (no two steps resolve to the same size)', async () => {
  const { json } = await render();
  const manifest = JSON.parse(json);
  const duplicates = [];
  for (const [brand, tokens] of Object.entries(manifest)) {
    const groups = new Map();
    for (const token of tokens) {
      if (token.type !== 'dimension' || !token.path.includes('size')) continue;
      const group = token.path.slice(0, -1).join('.');
      if (!groups.has(group)) groups.set(group, new Map());
      const seen = groups.get(group);
      if (seen.has(token.value)) duplicates.push(`${brand}: ${token.name} = ${seen.get(token.value)} = ${token.value}`);
      else seen.set(token.value, token.name);
    }
  }
  assert.deepEqual(duplicates, []);
});

// Decision record 005: two views of the semantic tier for consumers that are not a browser stylesheet.

test('toPx resolves what the manifest holds: px, rem, and the spacing calc()', () => {
  assert.equal(toPx('3px'), 3);
  assert.equal(toPx('0.25rem'), 4);
  assert.equal(toPx('calc(0.25rem * 6)'), 24);
  assert.equal(toPx('calc(0.28rem * 6)'), 26.88);
  assert.equal(toPx('9999px'), 9999);
  assert.throws(() => toPx('50%'), /cannot resolve/);
});

test('theme.css is a Tailwind v4 reference theme over the semantic tier only', async () => {
  const { theme, json } = await render();
  // `reference` is what keeps Tailwind from emitting `--x: var(--x)` on :root, a cycle that would
  // beat pulp's layered tokens. Compiled against tailwindcss 4.3.0 when this was written (record 005).
  assert.match(theme, /@theme inline reference \{/);
  assert.match(theme, /--color-surface-base: var\(--color-surface-base\);/);
  assert.match(theme, /--radius-control: var\(--radius-control\);/);
  assert.match(theme, /--shadow-raised: var\(--shadow-raised\);/);
  assert.match(theme, /--font-display: var\(--font-family-display\);/);

  const manifest = JSON.parse(json);
  const allowed = new Set(manifest.pulp.filter((t) => t.tier === 'semantic').map((t) => t.name));
  const referenced = [...theme.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1]);
  assert.ok(referenced.length > 40);
  // No primitive and no component token: a consumer's utilities are the semantic vocabulary.
  assert.deepEqual(referenced.filter((name) => !allowed.has(name)), []);
  assert.deepEqual(themeCss(manifest), theme);
});

test('native: the shape NativeWind and a Tailwind v3 config read, resolved per brand and scheme', async () => {
  const { json } = await render();
  const manifest = JSON.parse(json);
  for (const [brand, tokens] of Object.entries(manifest)) {
    const native = nativeBrand(tokens);
    assert.deepEqual(Object.keys(native), ['colors', 'radius', 'space', 'themeVars']);
    assert.equal(native.colors.surface.base, 'var(--color-surface-base)');
    assert.equal(native.colors.status['error-hover'], 'var(--color-status-error-hover)');
    assert.deepEqual(Object.keys(native.radius), ['control', 'surface', 'full']);
    assert.deepEqual(Object.keys(native.space), ['1', '2', '3', '4', '5', '6', '7', '8']);

    // Every variable the names point at has a value in both schemes, and the values are literals.
    const names = [...JSON.stringify([native.colors, native.radius, native.space]).matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1]);
    for (const scheme of ['light', 'dark']) {
      assert.deepEqual(names.filter((name) => !(name in native.themeVars[scheme])), [], `${brand} ${scheme}`);
      for (const [name, value] of Object.entries(native.themeVars[scheme])) assert.match(value, /^(#[0-9a-f]{6,8}|-?[\d.]+px)$/, `${brand} ${scheme} ${name}: ${value}`);
    }
    assert.notEqual(native.themeVars.light['--color-surface-base'], native.themeVars.dark['--color-surface-base']);
  }
  // Density is the brand's: the same step resolves differently.
  assert.equal(nativeBrand(manifest.pulp).themeVars.light['--space-4'], '16px');
  assert.equal(nativeBrand(manifest.bitepals).themeVars.light['--space-4'], '17.92px');
});

test('the committed native builds load with import and with require, and agree', async () => {
  const require = createRequire(import.meta.url);
  const cjs = require('../dist/native.cjs');
  const esm = await import('../dist/native.js');
  assert.deepEqual(Object.keys(cjs), ['pulp', 'bitepals']);
  assert.deepEqual(esm.default, cjs);
  assert.deepEqual(esm.bitepals, cjs.bitepals);
});
