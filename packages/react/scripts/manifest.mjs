/**
 * Emits dist/component-manifest.json: every exported component with its props,
 * types, defaults, and descriptions, straight from the TypeScript source.
 *
 * Two consumers: the Storybook docs (so prose and props never drift from
 * code) and coding agents (a machine-readable contract for what the system
 * offers, so they compose from it instead of inventing markup).
 */

import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withCustomConfig } from 'react-docgen-typescript';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'src');
const OUT = resolve(ROOT, 'dist/component-manifest.json');

const parser = withCustomConfig(resolve(ROOT, 'tsconfig.json'), {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  savePropValueAsString: true,
  // Only props declared in this package: the HTML attribute surface is implied.
  propFilter: (prop) => !prop.parent?.fileName.includes('node_modules'),
});

const componentFiles = readdirSync(SRC, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !['internal', 'test'].includes(entry.name))
  .map((entry) => {
    const name = entry.name.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    return { dir: entry.name, file: resolve(SRC, entry.name, `${name}.tsx`) };
  });

const components = componentFiles.flatMap(({ dir, file }) =>
  parser.parse(file).map((doc) => ({
    name: doc.displayName,
    description: doc.description,
    import: `import { ${doc.displayName} } from '@pearpages/pulp-react/${dir}';`,
    css: `@pearpages/pulp-react/${dir}.css`,
    tokens: `--${dir}-*`,
    props: Object.values(doc.props)
      .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name))
      .map((prop) => ({
        name: prop.name,
        type: prop.type.name,
        required: prop.required,
        default: prop.defaultValue?.value ?? null,
        description: prop.description,
      })),
  })),
);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  `${JSON.stringify(
    {
      package: '@pearpages/pulp-react',
      requires: {
        tokens: '@pearpages/pulp-tokens/tokens.css (every --button-* value resolves through it; without it components render unstyled)',
        base: '@pearpages/pulp-css (optional: layer order, reset, body defaults)',
        fonts: 'consumers load the brand typefaces themselves (pulp: Archivo, Instrument Sans, Geist Mono; bitepals: Nunito, Inter)',
      },
      components,
    },
    null,
    2,
  )}\n`,
);
console.log(`Wrote component manifest: ${components.map((c) => c.name).join(', ')}`);
