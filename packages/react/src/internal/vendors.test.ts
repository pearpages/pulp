// The vendor-variable guardrail: every vendor variable a pulp stylesheet maps must be one the
// installed vendor stylesheet actually declares, so a vendor rename cannot silently unstyle the
// component that wraps it. Each vendor is resolved through its own package `exports`, so a moved
// stylesheet fails here too. The stylesheets are discovered, not listed: the next component that
// maps a vendor variable is covered the day it is written. One entry per vendor, keyed by the
// prefix it owns.
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const SRC = resolve(import.meta.dirname, '..');

interface Vendor {
  /** The package, for messages. */
  name: string;
  /** The subpath consumers import, through the vendor's exports map. */
  stylesheet: string;
  /** The variable prefix the vendor owns. */
  prefix: string;
  /** A lower bound of mapped names per stylesheet, so a dropped mapping is noticed and not only a renamed one. */
  atLeast: Record<string, number>;
}

const VENDORS: Vendor[] = [
  {
    name: '@pearpages/modals',
    stylesheet: '@pearpages/modals/styles.css',
    prefix: '--modal-',
    atLeast: { 'dialog/Dialog.module.css': 54, 'sheet/Sheet.module.css': 3 },
  },
  {
    name: '@pearpages/heatmap',
    stylesheet: '@pearpages/heatmap/styles.css',
    prefix: '--contribution-heatmap-',
    atLeast: { 'heatmap/Heatmap.module.css': 18 },
  },
];

const names = (css: string, pattern: RegExp) => new Set(Array.from(css.matchAll(pattern), (match) => match[1]));

const componentSheets = readdirSync(SRC, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap((dir) => readdirSync(join(SRC, dir.name)).filter((file) => file.endsWith('.module.css')).map((file) => join(dir.name, file)))
  .map((file) => ({ file, css: readFileSync(join(SRC, file), 'utf8') }));

describe.each(VENDORS)('vendor variables: $name', ({ name, stylesheet, prefix, atLeast }) => {
  const vendorCss = readFileSync(require.resolve(stylesheet), 'utf8');
  const escaped = prefix.replace(/[-]/g, '\\-');
  const declared = names(vendorCss, new RegExp(`(${escaped}[a-z0-9-]+)\\s*:`, 'g'));

  // Every component stylesheet that sets or reads one of this vendor's variables.
  const stylesheets = componentSheets
    .filter(({ css }) => css.includes(prefix))
    .map(({ file, css }) => ({
      file,
      mapped: names(css, new RegExp(`(${escaped}[a-z0-9-]+)\\s*:`, 'g')),
      read: names(css, new RegExp(`var\\((${escaped}[a-z0-9-]+)`, 'g')),
    }));

  it('finds the stylesheets that map them, each with a lower bound', () => {
    expect(stylesheets.map((sheet) => sheet.file).sort()).toEqual(Object.keys(atLeast).sort());
  });

  it.each(stylesheets)('$file maps only variables the installed vendor stylesheet declares', ({ mapped, read }) => {
    const unknown = [...mapped, ...read].filter((variable) => !declared.has(variable));
    expect(unknown, `not declared by ${name}: ${unknown.join(', ')}`).toEqual([]);
  });

  // The README imports each sheet into `layer(vendor)`. An @charset there lands inside the layer,
  // which is invalid: browsers drop it and Next's optimiser warns on every build. Fixed in modals 0.4.0;
  // heatmap guards it in its own tests from 0.4.0.
  it('has no @charset, which cannot live inside the vendor layer', () => {
    expect(vendorCss).not.toContain('@charset');
  });

  it.each(stylesheets)('$file keeps mapping the vendor surface it themes today', ({ file, mapped }) => {
    expect(declared.size).toBeGreaterThanOrEqual(mapped.size);
    expect(mapped.size).toBeGreaterThanOrEqual(atLeast[file] ?? Infinity);
  });
});
