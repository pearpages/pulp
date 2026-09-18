import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Link } from './Link';

describe('Link', () => {
  it('renders an underlined action link by default', () => {
    render(<Link href="/feed">Feed</Link>);
    const link = screen.getByRole('link', { name: 'Feed' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/feed');
    expect(link).toHaveAttribute('data-tone', 'action');
    expect(link).toHaveAttribute('data-underline', 'always');
  });

  it('exposes tone and underline as data attributes', () => {
    render(
      <Link href="/about" tone="muted" underline="hover">
        About
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'About' });
    expect(link).toHaveAttribute('data-tone', 'muted');
    expect(link).toHaveAttribute('data-underline', 'hover');
  });

  it('styles the child with asChild and keeps its props', () => {
    render(
      <Link asChild tone="default" className="ours">
        <a href="/map" className="theirs" data-router="">
          Map
        </a>
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Map' });
    expect(link).toHaveAttribute('href', '/map');
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveAttribute('data-tone', 'default');
    expect(link).toHaveClass('theirs');
    expect(link).toHaveClass('ours');
    expect(document.querySelectorAll('a')).toHaveLength(1);
  });

  it('composes click handlers with the child under asChild', async () => {
    const ours = vi.fn();
    const theirs = vi.fn((event: React.MouseEvent) => event.preventDefault());
    render(
      <Link asChild onClick={ours}>
        <a href="/map" onClick={theirs}>
          Map
        </a>
      </Link>,
    );
    await userEvent.click(screen.getByRole('link', { name: 'Map' }));
    expect(theirs).toHaveBeenCalledOnce();
    // The child prevented the default: ours is skipped.
    expect(ours).not.toHaveBeenCalled();
  });

  it('throws when asChild does not get a single element', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Link asChild>plain text</Link>)).toThrow(/asChild requires a single valid React element/);
    error.mockRestore();
  });

  it('forwards its ref', () => {
    let node: HTMLAnchorElement | null = null;
    render(
      <Link href="/feed" ref={(el) => { node = el; }}>
        Feed
      </Link>,
    );
    expect(node).toBeInstanceOf(HTMLAnchorElement);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <p>
        Read the <Link href="/principles">principles</Link>, or the{' '}
        <Link href="/tokens" tone="default">
          tokens
        </Link>
        .
      </p>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
