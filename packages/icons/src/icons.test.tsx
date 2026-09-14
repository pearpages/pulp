import { render, screen } from '@testing-library/react';
import * as icons from './index';

const components = Object.entries(icons).filter(([name, value]) => /^[A-Z]/.test(name) && typeof value === 'function') as Array<
  [string, (props: { title?: string; className?: string }) => React.JSX.Element]
>;

describe('icons', () => {
  it('exports every generated icon', () => {
    expect(components.map(([name]) => name)).toEqual([
      'ArrowLeft',
      'ArrowRight',
      'Calendar',
      'Check',
      'ChevronDown',
      'ChevronLeft',
      'ChevronRight',
      'Close',
      'Info',
      'Plus',
      'Search',
      'Warning',
    ]);
  });

  it.each(components)('%s is decorative by default and sized by font-size', (_name, Glyph) => {
    const { container } = render(<Glyph className="extra" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveClass('extra');
  });

  it.each(components)('%s is a named image with a title', (name, Glyph) => {
    render(<Glyph title={name} />);
    expect(screen.getByRole('img', { name })).toBeInTheDocument();
  });
});
