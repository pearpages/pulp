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
import { CATEGORIES } from './categories.mjs';
import { clientEntries } from './client-entries.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'src');
const OUT = resolve(ROOT, 'dist/component-manifest.json');

const parser = withCustomConfig(resolve(ROOT, 'tsconfig.json'), {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  savePropValueAsString: true,
  // Only props declared in this package or by a composed pulp dependency: the
  // HTML attribute surface is implied.
  propFilter: (prop) =>
    !prop.parent?.fileName.includes('node_modules') || prop.parent.fileName.includes('/@pearpages/'),
});

const componentFiles = readdirSync(SRC, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !['internal', 'test', 'stories'].includes(entry.name))
  .map((entry) => {
    const name = entry.name.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    return { dir: entry.name, file: resolve(SRC, entry.name, `${name}.tsx`) };
  });

const STATUSES = ['experimental', 'stable', 'deprecated'];

// JSDoc block tags are the component's own metadata: one source read by the
// docs page, the status page and agents. `@do`/`@dont` hold one bullet per line.
function metadata(doc) {
  const tags = doc.tags ?? {};
  if (!STATUSES.includes(tags.status)) {
    throw new Error(`${doc.displayName}: JSDoc needs "@status ${STATUSES.join(' | ')}" (got "${tags.status ?? ''}")`);
  }
  if (!tags.accessibility?.trim()) throw new Error(`${doc.displayName}: JSDoc needs an "@accessibility" paragraph`);
  if (!CATEGORIES.includes(tags.category)) {
    throw new Error(`${doc.displayName}: JSDoc needs "@category ${CATEGORIES.join(' | ')}" (got "${tags.category ?? ''}")`);
  }
  const bullets = (text) => (text ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
  return { status: tags.status, category: tags.category, accessibility: tags.accessibility.replace(/\s+/g, ' ').trim(), do: bullets(tags.do), dont: bullets(tags.dont) };
}

const props = (doc) =>
  Object.values(doc.props)
    .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name))
    .map((prop) => ({
      name: prop.name,
      type: prop.type.name,
      // A literal union reports only "enum"; keep its members, as written in source
      // ('"ghost"', '1'), so removing a value is visible in the manifest.
      ...(prop.type.name === 'enum' && Array.isArray(prop.type.value) ? { values: prop.type.value.map((member) => member.value) } : {}),
      required: prop.required,
      default: prop.defaultValue?.value ?? null,
      description: prop.description,
    }));

// Sub-components (`Card.Header`) nest under their parent as `parts`. Each is also exported flat
// (`CardHeader`, the `flat` field), which is the only form a Server Component can use from a
// client entry.
// Server-safe or client, from the same analysis that stamps 'use client' on the built entries.
const client = clientEntries(Object.fromEntries(componentFiles.map(({ dir }) => [dir, `src/${dir}/index.ts`])));

const components = componentFiles.flatMap(({ dir, file }) => {
  const docs = parser.parse(file);
  // Hooks (useField), helpers (lower-case names) and sub-components (Card.Header) are not root components.
  // A part is also exported flat (`CardHeader`), so its flat name is not a root either.
  const flatParts = new Set(docs.filter((doc) => doc.displayName.includes('.')).map((doc) => doc.displayName.replace('.', '')));
  const roots = docs.filter(
    (doc) => /^[A-Z]/.test(doc.displayName) && !doc.displayName.includes('.') && !/^use[A-Z]/.test(doc.displayName) && !flatParts.has(doc.displayName),
  );
  return roots.map((doc) => ({
    name: doc.displayName,
    description: doc.description,
    ...metadata(doc),
    import: `import { ${doc.displayName} } from '@pearpages/pulp-react/${dir}';`,
    css: `@pearpages/pulp-react/${dir}.css`,
    // true: the entry carries 'use client'. false: it renders in a React Server Component as it is.
    client: client.get(dir) ?? true,
    tokens: `--${dir}-*`,
    props: props(doc),
    parts: docs
      .filter((part) => part.displayName.startsWith(`${doc.displayName}.`))
      .map((part) => ({ name: part.displayName, flat: part.displayName.replace('.', ''), description: part.description, props: props(part) })),
  }));
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  `${JSON.stringify(
    {
      package: '@pearpages/pulp-react',
      categories: CATEGORIES,
      requires: {
        tokens: '@pearpages/pulp-tokens/tokens.css (every --<component>-* value resolves through it; without it components render unstyled)',
        base: '@pearpages/pulp-css (optional: layer order, reset, body defaults, vendor layer)',
        icons: '@pearpages/pulp-icons (optional: stroke glyphs; wrap them in Icon or pass them to Button slots)',
        dialogs: '@pearpages/modals/styles.css (only when using Dialog or Sheet, which needs 0.3.0 or later; import it into the vendor layer)',
        heatmap: '@pearpages/heatmap/styles.css (only when using Heatmap, which needs 0.4.1 or later; import it into the vendor layer)',
        headless: 'react-aria-components (installed automatically; Combobox, Listbox, Picker, Calendar, DatePicker, Slider and DataGrid build on it, see docs/decisions/001)',
        fonts: 'consumers load the brand typefaces themselves (pulp: Archivo, Instrument Sans, Geist Mono; bitepals: Nunito, Inter)',
      },
      components,
    },
    null,
    2,
  )}\n`,
);
console.log(`Wrote component manifest: ${components.map((c) => c.name).join(', ')}`);
