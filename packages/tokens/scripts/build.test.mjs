import { test } from 'node:test';
import assert from 'node:assert/strict';
import { render } from './build.mjs';
import { toCss } from './format.mjs';

test('references become var(), composites become CSS', () => {
  assert.equal(toCss('{color.neutral.50}'), 'var(--color-neutral-50)');
  assert.equal(toCss({ value: 0.25, unit: 'rem' }), '0.25rem');
  assert.equal(toCss([0.2, 0.7, 0.3, 1]), 'cubic-bezier(0.2, 0.7, 0.3, 1)');
  assert.equal(toCss(['Archivo Variable', 'system-ui']), "'Archivo Variable', system-ui");
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
  ...['success', 'warning', 'error', 'info', 'neutral'].flatMap((tone) => [
    [`--color-status-${tone}-text`, ['--color-surface-base', '--color-surface-raised', '--color-surface-sunken', `--color-status-${tone}-subtle`]],
    [`--color-status-on-${tone}`, [`--color-status-${tone}`]],
  ]),
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
