// The vendor-variable guardrail: every `--modal-*` name Dialog maps must be a
// variable the installed `@pearpages/modals` stylesheet actually declares, so
// a vendor rename cannot silently unstyle Dialog. Resolved through the vendor
// package's own `exports`, so a moved stylesheet fails here too.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

// The same subpath consumers import (`@pearpages/modals/styles.css`), through the vendor's exports map.
const vendorCss = readFileSync(createRequire(import.meta.url).resolve('@pearpages/modals/styles.css'), 'utf8');
const dialogCss = readFileSync(resolve(import.meta.dirname, 'Dialog.module.css'), 'utf8');

const names = (css: string, pattern: RegExp) => new Set(Array.from(css.matchAll(pattern), (match) => match[1]));
const declared = names(vendorCss, /(--modal-[a-z0-9-]+)\s*:/g);
const mapped = names(dialogCss, /(--modal-[a-z0-9-]+)\s*:/g);
const read = names(dialogCss, /var\((--modal-[a-z0-9-]+)/g);

describe('Dialog vendor variables', () => {
  it('maps only variables the installed vendor stylesheet declares', () => {
    const unknown = [...mapped, ...read].filter((name) => !declared.has(name));
    expect(unknown, `not declared by @pearpages/modals: ${unknown.join(', ')}`).toEqual([]);
  });

  it('keeps mapping the vendor surface it themes today (a lower bound, so a dropped mapping is noticed)', () => {
    expect(declared.size).toBeGreaterThanOrEqual(mapped.size);
    expect(mapped.size).toBeGreaterThanOrEqual(54);
  });
});
