// The vendor-variable guardrail: every `--modal-*` name a pulp stylesheet maps must be a variable
// the installed `@pearpages/modals` stylesheet actually declares, so a vendor rename cannot
// silently unstyle Dialog or Sheet. Resolved through the vendor package's own `exports`, so a moved
// stylesheet fails here too. The stylesheets are discovered, not listed: the next component that
// maps a vendor variable is covered the day it is written.
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

// The same subpath consumers import (`@pearpages/modals/styles.css`), through the vendor's exports map.
const vendorCss = readFileSync(createRequire(import.meta.url).resolve('@pearpages/modals/styles.css'), 'utf8');
const SRC = resolve(import.meta.dirname, '..');

const names = (css: string, pattern: RegExp) => new Set(Array.from(css.matchAll(pattern), (match) => match[1]));
const declared = names(vendorCss, /(--modal-[a-z0-9-]+)\s*:/g);

// Every component stylesheet that sets or reads a vendor variable.
const stylesheets = readdirSync(SRC, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap((dir) => readdirSync(join(SRC, dir.name)).filter((file) => file.endsWith('.module.css')).map((file) => join(dir.name, file)))
  .map((file) => ({ file, css: readFileSync(join(SRC, file), 'utf8') }))
  .filter(({ css }) => css.includes('--modal-'))
  .map(({ file, css }) => ({
    file,
    mapped: names(css, /(--modal-[a-z0-9-]+)\s*:/g),
    read: names(css, /var\((--modal-[a-z0-9-]+)/g),
  }));

// A lower bound per stylesheet, so a dropped mapping is noticed and not only a renamed one.
const AT_LEAST: Record<string, number> = { 'dialog/Dialog.module.css': 54, 'sheet/Sheet.module.css': 3 };

describe('vendor variables', () => {
  it('finds the stylesheets that map them, each with a lower bound', () => {
    expect(stylesheets.map((sheet) => sheet.file).sort()).toEqual(Object.keys(AT_LEAST).sort());
  });

  it.each(stylesheets)('$file maps only variables the installed vendor stylesheet declares', ({ mapped, read }) => {
    const unknown = [...mapped, ...read].filter((name) => !declared.has(name));
    expect(unknown, `not declared by @pearpages/modals: ${unknown.join(', ')}`).toEqual([]);
  });

  // The README imports the sheet into `layer(vendor)`. An @charset there lands inside the layer,
  // which is invalid: browsers drop it and Next's optimiser warns on every build. Fixed in 0.4.0.
  it('has no @charset, which cannot live inside the vendor layer', () => {
    expect(vendorCss).not.toContain('@charset');
  });

  it.each(stylesheets)('$file keeps mapping the vendor surface it themes today', ({ file, mapped }) => {
    expect(declared.size).toBeGreaterThanOrEqual(mapped.size);
    expect(mapped.size).toBeGreaterThanOrEqual(AT_LEAST[file] ?? Infinity);
  });
});
