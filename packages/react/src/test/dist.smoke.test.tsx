// What an npm consumer gets: the built ESM entry and its CSS, not src/.
// Run with `pnpm test:dist` after `pnpm build`.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';

const DIST = resolve(import.meta.dirname, '../../dist');

describe('dist', () => {
  it('exports Button from the barrel and the per-component entry', async () => {
    const barrel = await import(resolve(DIST, 'index.js'));
    const entry = await import(resolve(DIST, 'button.js'));
    expect(typeof barrel.Button).toBe('function');
    expect(entry.Button).toBe(barrel.Button);
  });

  it('renders from the built module', async () => {
    const { Button } = await import(resolve(DIST, 'index.js'));
    render(<Button variant="secondary">Built</Button>);
    const button = screen.getByRole('button', { name: 'Built' });
    expect(button).toHaveAttribute('data-variant', 'secondary');
    expect(button.className).toMatch(/button/);
  });

  it('ships CSS that only uses tokens for colour', () => {
    for (const file of ['index.css', 'button.css']) {
      const path = resolve(DIST, file);
      expect(existsSync(path)).toBe(true);
      const css = readFileSync(path, 'utf8');
      expect(css).toMatch(/var\(--button-primary-bg\)/);
      // Component rules live in the `components` layer so app CSS can override them from a later layer.
      expect(css).toMatch(/@layer components\s*\{/);
      expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    }
  });

  it('ships types and the component manifest', () => {
    expect(existsSync(resolve(DIST, 'index.d.ts'))).toBe(true);
    expect(existsSync(resolve(DIST, 'button.d.ts'))).toBe(true);
    const manifest = JSON.parse(readFileSync(resolve(DIST, 'component-manifest.json'), 'utf8'));
    const button = manifest.components.find((c: { name: string }) => c.name === 'Button');
    expect(button.props.map((p: { name: string }) => p.name)).toEqual(
      expect.arrayContaining(['variant', 'size', 'loading', 'asChild']),
    );
  });
});
