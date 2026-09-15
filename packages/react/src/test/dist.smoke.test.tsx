// What an npm consumer gets: the built ESM entries and their CSS, not src/.
// Driven by the component manifest so every component is covered without
// editing this file. Run with `pnpm test:dist` after `pnpm build`.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';

const DIST = resolve(import.meta.dirname, '../../dist');
const manifest = JSON.parse(readFileSync(resolve(DIST, 'component-manifest.json'), 'utf8')) as {
  components: Array<{
    name: string;
    import: string;
    css: string;
    status: string;
    accessibility: string;
    do: string[];
    dont: string[];
    props: Array<{ name: string }>;
    parts: Array<{ name: string }>;
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

  it.each(manifest.components)('$name: carries a status and an accessibility note for the docs page and agents', (component) => {
    expect(['experimental', 'stable', 'deprecated']).toContain(component.status);
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
    expect(css).toMatch(new RegExp(`var\\(--${entry}-`));
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(existsSync(resolve(DIST, `${entry}.d.ts`))).toBe(true);
    expect(component.props.length).toBeGreaterThan(0);
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

  it('the combined stylesheet contains every component', () => {
    const all = readFileSync(resolve(DIST, 'index.css'), 'utf8');
    for (const component of manifest.components) expect(all).toMatch(new RegExp(`var\\(--${entryOf(component)}-`));
  });
});
