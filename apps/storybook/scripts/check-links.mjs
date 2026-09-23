/**
 * Link check over storybook-static, run at the end of `build`.
 *
 * A broken import already fails `storybook build`. What builds fine and breaks
 * at runtime is a link to a page that is not there: the Status page links every
 * component through docs/paths.ts, an MDX file can miss the index, and a
 * decision record has to be added by hand to both Decisions.mdx and the
 * folder's README. Everything is resolved against the built index.json.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// Type-only syntax, so Node strips it: the same function StatusTable.tsx links with.
import { docsPath } from '../docs/paths.ts';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = resolve(APP, '../..');
const STATIC = resolve(APP, 'storybook-static');
const read = (file) => readFileSync(file, 'utf8');

if (!existsSync(resolve(STATIC, 'index.json'))) {
  console.error('check-links: storybook-static/index.json is missing. Run `pnpm storybook:build`.');
  process.exit(1);
}

const entries = Object.values(JSON.parse(read(resolve(STATIC, 'index.json'))).entries);
const ids = new Set(entries.map((entry) => entry.id));
const problems = [];

// 1. Every MDX page made it into the index.
const pages = readdirSync(resolve(APP, 'docs')).filter((file) => file.endsWith('.mdx'));
for (const page of pages) {
  if (!entries.some((entry) => entry.type === 'docs' && entry.importPath === `./docs/${page}`)) problems.push(`docs/${page} has no entry in index.json`);
}

// 2. Every component's docs link, as the Status page builds it, lands on a page.
const { components } = JSON.parse(read(resolve(REPO, 'packages/react/dist/component-manifest.json')));
for (const component of components) {
  const path = docsPath(component);
  if (!ids.has(path.replace('/docs/', ''))) problems.push(`${component.name}: ?path=${path} is not a page (category or STORY_OF out of step with the story title)`);
}

// 3. Every literal ?path= link in the built pages resolves. An id always carries "--".
const assets = readdirSync(resolve(STATIC, 'assets')).filter((file) => file.endsWith('.js'));
let literals = 0;
for (const asset of assets) {
  for (const [, id] of read(resolve(STATIC, 'assets', asset)).matchAll(/\?path=\/(?:docs|story)\/([a-z0-9-]+--[a-z0-9-]+)/g)) {
    literals += 1;
    if (!ids.has(id)) problems.push(`assets/${asset} links to ${id}, which is not in index.json`);
  }
}

// 4. Every decision record is rendered by Decisions.mdx and listed in the folder's README.
const decisionsPage = read(resolve(APP, 'docs/Decisions.mdx'));
const decisionsIndex = read(resolve(REPO, 'docs/decisions/README.md'));
const records = readdirSync(resolve(REPO, 'docs/decisions')).filter((file) => /^\d{3}-.+\.md$/.test(file));
for (const record of records) {
  const name = /import (\w+) from '[^']*\/([^'/]+)\?raw'/g;
  const imported = [...decisionsPage.matchAll(name)].find(([, , file]) => file === record);
  if (!imported) problems.push(`docs/decisions/${record} is not imported by docs/Decisions.mdx`);
  else if (!decisionsPage.includes(`{${imported[1]}}`)) problems.push(`docs/Decisions.mdx imports ${record} but never renders it`);
  if (!decisionsIndex.includes(`(${record})`)) problems.push(`docs/decisions/${record} is not listed in docs/decisions/README.md`);
}

// 5. The link preview: the built page names its share image and touch icon, and both files shipped.
// A crawler never runs the manager's JavaScript, so the tags have to be in the static HTML.
const head = read(resolve(STATIC, 'index.html'));
const meta = (key) => head.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`))?.[1];
for (const key of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt', 'twitter:card']) {
  if (!meta(key)) problems.push(`index.html has no ${key} (apps/storybook/.storybook/manager-head.html)`);
}
const ORIGIN = 'https://pulp.pearpages.com/';
for (const key of ['og:image', 'twitter:image']) {
  const url = meta(key);
  if (url && !url.startsWith(ORIGIN)) problems.push(`${key} must be an absolute ${ORIGIN} URL (got ${url})`);
  else if (url && !existsSync(resolve(STATIC, url.slice(ORIGIN.length)))) problems.push(`${key} points at ${url}, which is not in storybook-static`);
}
const touchIcon = head.match(/<link rel="apple-touch-icon" href="\.\/([^"]+)"/)?.[1];
if (!touchIcon || !existsSync(resolve(STATIC, touchIcon))) problems.push('the apple-touch-icon is not linked from index.html or not in storybook-static');

if (problems.length) {
  console.error(`check-links: ${problems.length} problem(s)\n${problems.map((line) => `  ${line}`).join('\n')}`);
  process.exit(1);
}
console.log(`check-links: ${pages.length} pages, ${components.length} component links, ${literals} literal links, ${records.length} decision records, link preview.`);
