import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAYERS, render } from './build.mjs';
import { toCss } from './format.mjs';
import { PUBLIC_SEMANTIC_TOKENS } from './public-tokens.mjs';
import { nativeBrand, themeCss, toPx } from './outputs.mjs';
import { validateTokens } from './schema.mjs';
import { MAX_OVERRIDES_PER_BRAND, checkOverrides } from './overrides.mjs';
import { checkFamilies, semanticRoles } from './roles.mjs';
import { cssName } from './format.mjs';
import { createRequire } from 'node:module';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const TOKENS = resolve(import.meta.dirname, '../tokens');
const readJson = (...path) => JSON.parse(readFileSync(resolve(TOKENS, ...path), 'utf8'));
const jsonFiles = (...path) => readdirSync(resolve(TOKENS, ...path)).filter((f) => f.endsWith('.json'));
// A brand's component overrides, tokens/component/<brand>/*.json. Decision record 007.
const brandDirs = () => readdirSync(resolve(TOKENS, 'component')).filter((f) => statSync(resolve(TOKENS, 'component', f)).isDirectory());

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
    for (const name of jsonFiles(tier)) {
      problems.push(...validateTokens(readJson(tier, name), `${tier}/${name}`));
      files += 1;
    }
  }
  for (const brand of brandDirs()) {
    for (const name of jsonFiles('component', brand)) {
      problems.push(...validateTokens(readJson('component', brand, name), `component/${brand}/${name}`));
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

test('brand overrides stay few, and each one says why', () => {
  const brands = Object.fromEntries(brandDirs().map((brand) => [brand, Object.fromEntries(jsonFiles('component', brand).map((name) => [name, readJson('component', brand, name)]))]));
  assert.ok(Object.keys(brands).length > 0, 'no brand override directories found');
  assert.deepEqual(checkOverrides(brands), []);
});

test('the override checks fire: past the cap, and without a reason', () => {
  const pill = { button: { radius: { $type: 'dimension', $description: 'Pills are the brand.', $value: '{radius.full}' } } };
  assert.deepEqual(checkOverrides({ bitepals: { 'button.json': pill } }), []);

  const many = { button: { $type: 'dimension' } };
  for (let i = 0; i <= MAX_OVERRIDES_PER_BRAND; i += 1) many.button[`k${i}`] = { $description: 'why', $value: '{radius.full}' };
  const [cap, ...rest] = checkOverrides({ loud: { 'button.json': many } });
  assert.deepEqual(rest, []);
  assert.match(cap, new RegExp(`^loud overrides ${MAX_OVERRIDES_PER_BRAND + 1} component tokens, over the cap of ${MAX_OVERRIDES_PER_BRAND}\\..*semantic tier is missing a name`));

  // The file's and the group's descriptions do not count: the reason is per override.
  const mute = { $description: 'file', button: { $description: 'group', radius: { $type: 'dimension', $value: '{radius.full}' } } };
  assert.deepEqual(checkOverrides({ mute: { 'button.json': mute } }), [
    'mute/button.json: button.radius overrides a component token without its own $description saying why (record 007)',
  ]);
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
  // A brand restates a component token only to override it, and the override must
  // come after the :root declaration to win at equal specificity. Record 007.
  const bitepalsBlock = css.slice(css.indexOf('[data-brand="bitepals"]'));
  assert.match(bitepalsBlock, /--button-radius: var\(--radius-full\);/);
  assert.ok(css.indexOf('--button-radius', css.indexOf('[data-brand="bitepals"]')) > css.indexOf('--button-radius'));

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
  const offenders = [];
  // Every brand, not only pulp: a brand's overrides (tokens/component/<brand>/) are
  // held to the same rule, or a brand could smuggle a literal into a component.
  for (const [brand, tokens] of Object.entries(manifest)) {
    const semantic = new Set(tokens.filter((t) => t.tier === 'semantic').map((t) => t.name));
    for (const token of tokens.filter((t) => t.tier === 'component')) {
      const refs = [...token.css.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1]);
      if (refs.length === 0 || refs.some((ref) => !semantic.has(ref))) offenders.push(`${brand}/${token.name}: ${token.css}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test('every semantic token states its role, once, in the base brand', async () => {
  // The role belongs to the name, the value to the brand (record 013). pulp is the base brand:
  // its file states every role, and another brand's $description says only why its value differs.
  const { missing } = semanticRoles(readJson('semantic', 'pulp.json'), cssName);
  assert.deepEqual(missing, [], 'semantic tokens without a role: add a $description to semantic/pulp.json');

  // Another brand states no role at all: its $description would be a second copy, or a
  // different answer to the same question. Why its value differs goes in its `note` extension.
  const stated = [];
  const collect = (node, path) => {
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$') || child === null || typeof child !== 'object') continue;
      if (child.$description !== undefined) stated.push([...path, key].join('.'));
      collect(child, [...path, key]);
    }
  };
  for (const name of jsonFiles('semantic').filter((f) => f !== 'pulp.json')) collect(readJson('semantic', name), [name]);
  assert.deepEqual(stated, [], 'a brand states a role; roles live in semantic/pulp.json, a brand\'s own reason in $extensions["com.pearpages.pulp"].note');

  const { json } = await render();
  for (const [brand, tokens] of Object.entries(JSON.parse(json))) {
    const roleless = tokens.filter((t) => t.tier === 'semantic' && !t.role).map((t) => t.name);
    assert.deepEqual(roleless, [], `${brand}: tokens.json entries without a role`);
  }
});

test('component colour tokens read a semantic family their slot accepts', async () => {
  // The semantic analogue of the contrast test: a design rule made mechanical. Record 013.
  const { json } = await render();
  assert.deepEqual(checkFamilies(JSON.parse(json)), []);
});

test('the family check fires: wrong family, a stray focus colour, no slot, no family, a stale exception', () => {
  const semantic = (name, role) => ({ name, path: [], type: 'color', tier: 'semantic', css: '#000', role });
  const component = (name, ref) => ({ name, path: name.slice(2).split('-'), type: 'color', tier: 'component', css: `var(${ref})` });
  const manifest = {
    x: [
      semantic('--color-text-muted', 'Secondary text.'),
      semantic('--color-surface-raised'),
      semantic('--color-border-default'),
      semantic('--color-border-focus'),
      semantic('--color-glow'),
      component('--button-primary-bg', '--color-text-muted'),
      component('--button-fg', '--color-surface-raised'),
      component('--button-focus-ring', '--color-border-default'),
      component('--card-border', '--color-border-default'),
      component('--card-glint', '--color-border-default'),
    ],
  };
  assert.deepEqual(checkFamilies(manifest, { '--card-border': 'stale' }), [
    'x: --color-glow belongs to no family; place it in familyOf (scripts/roles.mjs, record 013)',
    'x: --button-primary-bg is a bg slot and reads --color-text-muted (ink: "Secondary text."); a bg expects surface, tint, fill, scrim. Pick the semantic token whose role fits, or list the exception with its reason (scripts/roles.mjs, record 013).',
    'x: --button-fg is a fg slot and reads --color-surface-raised (surface); a fg expects ink, on-ink. Pick the semantic token whose role fits, or list the exception with its reason (scripts/roles.mjs, record 013).',
    'x: --button-focus-ring is a focus-ring slot and reads --color-border-default (line); a focus-ring expects --color-border-focus. Pick the semantic token whose role fits, or list the exception with its reason (scripts/roles.mjs, record 013).',
    'x: --card-glint names no slot (bg, fg, border, focus-ring…); name it, or add it to SLOT_OF (scripts/roles.mjs, record 013)',
    '--card-border is listed in EXCEPTIONS but fits its slot or no longer exists; remove the entry',
  ]);
});

test('a brand only overrides component tokens that already exist, never invents one', async () => {
  const { json } = await render();
  const manifest = JSON.parse(json);
  const base = new Set(manifest.pulp.filter((t) => t.tier === 'component').map((t) => t.name));
  const invented = [];
  for (const [brand, tokens] of Object.entries(manifest)) {
    if (brand === 'pulp') continue;
    for (const token of tokens.filter((t) => t.tier === 'component')) {
      if (!base.has(token.name)) invented.push(`${brand}: ${token.name}`);
    }
  }
  assert.deepEqual(invented, []);
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
