import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SRC = resolve(import.meta.dirname, '../src');
const read = (file) => readFileSync(resolve(SRC, file), 'utf8');
const statement = (css) => css.match(/@layer ([^;{]+);/)?.[1].split(',').map((name) => name.trim());

test('layers.css declares the documented order', () => {
  assert.deepEqual(statement(read('layers.css')), ['reset', 'tokens', 'vendor', 'base', 'components', 'utilities']);
});

// Layers rank by first appearance and a bundler picks the load order, so every
// stylesheet restates the whole list before its first block (the built-site test
// is what found out: a components chunk linked before the reset).
test('reset.css and base.css restate the order before their own layer block', () => {
  for (const file of ['reset.css', 'base.css']) {
    const css = read(file);
    assert.deepEqual(statement(css), statement(read('layers.css')), file);
    assert.ok(css.indexOf('@layer reset,') < css.search(/@layer \w+ \{/), `${file}: the statement comes first`);
  }
});

test('index.css imports layers, tokens, reset, base, in that order', () => {
  const imports = [...read('index.css').matchAll(/@import "([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(imports, ['./layers.css', '@pearpages/pulp-tokens/tokens.css', './reset.css', './base.css']);
});

test('the reset keeps what the support floor and reduced motion need', () => {
  const css = read('reset.css');
  assert.match(css, /-webkit-text-size-adjust: none/);
  assert.match(css, /prefers-reduced-motion/);
});
