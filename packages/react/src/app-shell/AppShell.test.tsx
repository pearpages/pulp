import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { AppShell } from './AppShell';

function Shell({ signedIn = true }: { signedIn?: boolean }) {
  return (
    <AppShell
      header={<header>bitepals</header>}
      sidebar={signedIn ? <nav aria-label="Primary">sidebar</nav> : undefined}
      tabBar={signedIn ? <nav aria-label="Tabs">tabs</nav> : undefined}
      footer={<footer>© bitepals</footer>}
    >
      <h1>Feed</h1>
    </AppShell>
  );
}

describe('AppShell', () => {
  it('renders the page in its one main landmark, with each slot the app passed', () => {
    render(<Shell />);
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { name: 'Feed' }));
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('banner')).toHaveTextContent('bitepals');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© bitepals');
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Tabs' })).toBeInTheDocument();
  });

  it('says which slots it holds on the DOM, so the CSS lays out only those', () => {
    const { container } = render(<Shell />);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute('data-sidebar');
    expect(root).toHaveAttribute('data-tab-bar');
    expect(root).toHaveAttribute('data-footer');
  });

  it('signed out: no navigation slot, no wrapper, no attribute', () => {
    const { container } = render(<Shell signedIn={false} />);
    const root = container.firstElementChild!;
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(root).not.toHaveAttribute('data-sidebar');
    expect(root).not.toHaveAttribute('data-tab-bar');
    // Header, main and footer only: no empty wrapper for a slot that was left out.
    expect(root.children).toHaveLength(3);
  });

  it('keeps DOM order header, sidebar, page, footer, tab bar: the focus order', () => {
    const { container } = render(<Shell />);
    const text = Array.from(container.firstElementChild!.children).map((child) => child.textContent);
    expect(text).toEqual(['bitepals', 'sidebar', 'Feed', '© bitepals', 'tabs']);
  });

  it('forwards ref and attributes to the root', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AppShell ref={ref} data-testid="shell" className="mine">
        page
      </AppShell>,
    );
    expect(ref.current).toBe(screen.getByTestId('shell'));
    expect(ref.current).toHaveClass('mine');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Shell />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
