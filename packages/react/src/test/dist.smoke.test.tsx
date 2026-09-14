// What an npm consumer gets: the built ESM entries and their CSS, not src/.
// Driven by the component manifest so every component is covered without
// editing this file. Run with `pnpm test:dist` after `pnpm build`.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';

const DIST = resolve(import.meta.dirname, '../../dist');
const manifest = JSON.parse(readFileSync(resolve(DIST, 'component-manifest.json'), 'utf8')) as {
  components: Array<{ name: string; import: string; css: string; props: Array<{ name: string }> }>;
};
const entryOf = (component: { import: string }) => component.import.match(/pulp-react\/([a-z-]+)'/)?.[1] ?? '';

describe('dist', () => {
  it('lists every component in the manifest', () => {
    expect(manifest.components.map((c) => c.name)).toEqual(expect.arrayContaining(['Button', 'TextField']));
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

  it('renders Button and TextField from the built modules', async () => {
    const { Button, TextField } = await import(resolve(DIST, 'index.js'));
    render(
      <div>
        <Button variant="secondary">Built</Button>
        <TextField label="Name" />
      </div>,
    );
    expect(screen.getByRole('button', { name: 'Built' })).toHaveAttribute('data-variant', 'secondary');
    expect(screen.getByRole('button').className).toMatch(/button/);
    expect(screen.getByLabelText('Name').className).toMatch(/input/);
  });

  it('the combined stylesheet contains every component', () => {
    const all = readFileSync(resolve(DIST, 'index.css'), 'utf8');
    for (const component of manifest.components) expect(all).toMatch(new RegExp(`var\\(--${entryOf(component)}-`));
  });
});
