// What an npm consumer gets: the built ESM entries and their CSS, not src/.
// Driven by the component manifest so every component is covered without
// editing this file. Run with `pnpm test:dist` after `pnpm build`.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { render, screen } from '@testing-library/react';

const DIST = resolve(import.meta.dirname, '../../dist');
const SRC = resolve(import.meta.dirname, '..');
// The documented order: packages/css/src/layers.css. Read from there so the copies cannot drift.
const LAYER_ORDER = readFileSync(resolve(SRC, '../../css/src/layers.css'), 'utf8').match(/@layer [^;{]+;/)![0];
type Prop = { name: string; type: string; values?: string[]; required: boolean; default: string | null };
const manifest = JSON.parse(readFileSync(resolve(DIST, 'component-manifest.json'), 'utf8')) as {
  categories: string[];
  components: Array<{
    category: string;
    name: string;
    import: string;
    css: string;
    client: boolean;
    status: string;
    accessibility: string;
    do: string[];
    dont: string[];
    props: Prop[];
    parts: Array<{ name: string; props: Prop[] }>;
  }>;
};
const entryOf = (component: { import: string }) => component.import.match(/pulp-react\/([a-z-]+)'/)?.[1] ?? '';

describe('dist', () => {
  it('lists every component in the manifest', () => {
    expect(manifest.components.map((c) => c.name)).toEqual(
      expect.arrayContaining(['Button', 'TextField', 'Card', 'Tabs', 'Dialog', 'DialogSystem']),
    );
    const card = manifest.components.find((c) => c.name === 'Card');
    expect(card?.parts.map((p) => p.name)).toEqual(['Card.Header', 'Card.Body', 'Card.Footer']);
  });

  it.each(manifest.components)('$name: carries a status, a category and an accessibility note for the docs page and agents', (component) => {
    expect(['experimental', 'stable', 'deprecated']).toContain(component.status);
    expect(manifest.categories).toContain(component.category);
    expect(component.accessibility.length).toBeGreaterThan(20);
    expect(Array.isArray(component.do) && Array.isArray(component.dont)).toBe(true);
  });

  it.each(manifest.components)('$name: barrel and per-component entry export the same function', async (component) => {
    const barrel = await import(resolve(DIST, 'index.js'));
    const entry = await import(resolve(DIST, `${entryOf(component)}.js`));
    expect(typeof barrel[component.name]).toBe('function');
    expect(entry[component.name]).toBe(barrel[component.name]);
  });

  it.each(manifest.components)('$name: ships layered, token-only CSS and types', (component) => {
    const entry = entryOf(component);
    const css = readFileSync(resolve(DIST, `${entry}.css`), 'utf8');
    expect(css).toMatch(/@layer components\s*\{/);
  // Layers rank by first appearance and a bundler picks the load order: every entry restates the list first.
  expect(css.indexOf(LAYER_ORDER)).toBeGreaterThan(-1);
  expect(css.indexOf(LAYER_ORDER)).toBeLessThan(css.search(/@layer components\s*\{/));
    expect(css).toMatch(new RegExp(`var\\(--${entry}-`));
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(existsSync(resolve(DIST, `${entry}.d.ts`))).toBe(true);
    expect(component.props.length).toBeGreaterThan(0);
  });

  // The sidebar folder comes from the story title; the category comes from the JSDoc. They must agree.
  it('every story title places the component in its manifest category', () => {
    // A stories file can be named after a sibling: Radio.stories.tsx documents RadioGroup, Toast.stories.tsx ToastProvider.
    const STORY_TO_COMPONENT: Record<string, string> = { Radio: 'RadioGroup', Toast: 'ToastProvider' };
    const STORY_NAME: Record<string, string> = { Radio: 'RadioGroup' };
    const files = readdirSync(SRC, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((dir) => readdirSync(resolve(SRC, dir.name)).filter((file) => file.endsWith('.stories.tsx')).map((file) => resolve(SRC, dir.name, file)));
    expect(files.length).toBeGreaterThan(30);
    for (const file of files) {
      const title = readFileSync(file, 'utf8').match(/^\s+title: '([^']+)'/m)?.[1];
      const story = basename(file, '.stories.tsx');
      if (file.includes('/src/stories/')) {
        expect(title, file).toMatch(/^Patterns\//);
        continue;
      }
      const component = manifest.components.find((c) => c.name === (STORY_TO_COMPONENT[story] ?? story));
      expect(component, `${file}: no manifest component for story ${story}`).toBeDefined();
      expect(title, file).toBe(`Components/${component?.category}/${STORY_NAME[story] ?? story}`);
    }
  });

  // Storybook evaluates storySort statically, so the preview lists the categories as a literal.
  it('the Storybook sort order lists the manifest categories, in order', () => {
    const preview = readFileSync(resolve(SRC, '../../../apps/storybook/.storybook/preview.tsx'), 'utf8');
    const positions = manifest.categories.map((category) => preview.indexOf(`'${category}',`));
    expect(positions.every((position) => position > 0), 'every category appears in storySort').toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it('renders every component from the built modules', async () => {
    const { Button, TextField, Card, Tabs, Dialog, DialogSystem } = await import(resolve(DIST, 'index.js'));
    render(
      <DialogSystem>
        <Button variant="secondary">Built</Button>
        <TextField label="Name" />
        <Card aria-label="Card">
          <Card.Body>Card body</Card.Body>
        </Card>
        <Tabs defaultValue="a">
          <Tabs.List aria-label="Tabs">
            <Tabs.Tab value="a">A</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="a">Panel A</Tabs.Panel>
        </Tabs>
        <Dialog.Trigger target="d">Open</Dialog.Trigger>
        <Dialog id="d">
          <Dialog.Content>
            <Dialog.Title>Built dialog</Dialog.Title>
          </Dialog.Content>
        </Dialog>
      </DialogSystem>,
    );
    expect(screen.getByRole('button', { name: 'Built' })).toHaveAttribute('data-variant', 'secondary');
    expect(screen.getByLabelText('Name').className).toMatch(/input/);
    expect(screen.getByRole('region', { name: 'Card' }).className).toMatch(/card/);
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
    expect(document.body.querySelector('[data-pulp-dialogs]')?.className).toMatch(/root/);
  });

  it('imports the vendor packages (dialogs, icons, positioning, React Aria) instead of bundling them', () => {
    const js = readdirSync(DIST)
      .filter((file) => file.endsWith('.js'))
      .map((file) => readFileSync(resolve(DIST, file), 'utf8'))
      .join('\n');
    expect(js).toMatch(/from ['"]@pearpages\/modals['"]/);
    expect(js).not.toMatch(/modalBackdrop/);
    expect(js).toMatch(/from ['"]@pearpages\/pulp-icons['"]/);
    expect(js).not.toMatch(/M5 12h14/);
    expect(js).toMatch(/from ['"]@floating-ui\/react-dom['"]/);
    expect(js).not.toMatch(/computePosition/);
    // React Aria Components (decision record 001) stamps data-rac on its elements; that string only exists in its own code.
    expect(js).toMatch(/from ['"]react-aria-components['"]/);
    expect(js).not.toMatch(/data-rac/);
    expect(js).toMatch(/from ['"]@internationalized\/date['"]/);
  });

  // The React package's public API: every component, part and prop a consumer can write, with
  // required-ness, type (union members spelled out) and default. Prose (descriptions,
  // accessibility, do/don't) is left out so docs edits do not churn it. When this fails the API
  // changed: review the diff, update with `pnpm --filter @pearpages/pulp-react test:dist -u`, and
  // add a changeset. A removed prop or value, a narrowed type or a new required prop is breaking.
  it('the public API matches api.snapshot.txt', async () => {
    const byName = <T extends { name: string }>(a: T, b: T) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    const prop = (p: Prop) =>
      `${p.name}${p.required ? '' : '?'}: ${p.values ? p.values.join(' | ') : p.type}${p.default === null ? '' : ` = ${p.default}`}`;
    const lines = ['# @pearpages/pulp-react public API. Regenerate: pnpm --filter @pearpages/pulp-react test:dist -u', ''];
    for (const component of [...manifest.components].sort(byName)) {
      lines.push(`${component.name} (${component.status})`);
      for (const p of [...component.props].sort(byName)) lines.push(`  ${prop(p)}`);
      for (const part of [...component.parts].sort(byName)) {
        lines.push(`  ${part.name}`);
        for (const p of [...part.props].sort(byName)) lines.push(`    ${prop(p)}`);
      }
    }
    await expect(`${lines.join('\n')}\n`).toMatchFileSnapshot('../../api.snapshot.txt');
  });

  // Server Components. A consumer on the App Router imports an entry from a server file: a client
  // entry has to say so, and a server-safe one has to load where React has no hooks at all.
  it.each(manifest.components)("$name: carries 'use client' exactly when it needs a client", (component) => {
    const code = readFileSync(resolve(DIST, `${entryOf(component)}.js`), 'utf8');
    expect(code.startsWith('"use client";')).toBe(component.client);
  });

  it('the barrel is a client module, and the known leaves stay server-safe', () => {
    expect(readFileSync(resolve(DIST, 'index.js'), 'utf8').startsWith('"use client";')).toBe(true);
    const serverSafe = manifest.components.filter((component) => !component.client).map((component) => component.name);
    // Losing one of these to a stray hook is a regression for every App Router consumer: make it a decision.
    expect(serverSafe).toEqual(expect.arrayContaining(['Text', 'Heading', 'Stack', 'Inline', 'Card', 'Badge', 'Skeleton', 'Spinner', 'Icon', 'VisuallyHidden', 'Button', 'Link']));
  });

  it("server-safe entries import under React's react-server condition; a client entry does not", () => {
    const load = (entry: string) =>
      execFileSync(process.execPath, ['--conditions=react-server', '--input-type=module', '-e', `await import(${JSON.stringify(resolve(DIST, `${entry}.js`))})`], { stdio: 'pipe' });
    for (const component of manifest.components.filter((candidate) => !candidate.client)) {
      expect(() => load(entryOf(component)), `${component.name} should load without client React APIs`).not.toThrow();
    }
    // The control: without hooks in React's server build, a client entry cannot even be linked.
    expect(() => load('tabs')).toThrow();
  });

  it('the combined stylesheet contains every component', () => {
    const all = readFileSync(resolve(DIST, 'index.css'), 'utf8');
    for (const component of manifest.components) expect(all).toMatch(new RegExp(`var\\(--${entryOf(component)}-`));
  });
});
