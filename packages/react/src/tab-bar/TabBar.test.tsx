import { createRef, type AnchorHTMLAttributes } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Badge } from '../badge';
import { TabBar } from './TabBar';

/** Stands in for a router's link (next/link): its own component, rendering an `a`. */
function RouterLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} data-router="" />;
}

function Bar({ position }: { position?: 'fixed' | 'static' }) {
  return (
    <TabBar label="Primary" position={position}>
      <TabBar.Item href="/feed" current icon={<svg data-testid="icon" />}>
        Feed
      </TabBar.Item>
      <TabBar.Item href="/map" icon={<svg />}>
        Map
      </TabBar.Item>
      <TabBar.Item href="/search" prominent icon={<svg />}>
        Search
      </TabBar.Item>
      <TabBar.Item href="/friends" icon={<svg />} badge={<Badge variant="dot" label="New activity" />}>
        Friends
      </TabBar.Item>
      <TabBar.Item href="/you" icon={<svg />}>
        You
      </TabBar.Item>
    </TabBar>
  );
}

describe('TabBar', () => {
  it('is a named nav landmark holding a list of links, not a tablist', () => {
    render(<Bar />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(['/feed', '/map', '/search', '/friends', '/you']);
    expect(within(nav).getAllByRole('listitem')).toHaveLength(5);
    expect(nav.querySelector('[role^="tab"]')).toBeNull();
  });

  it('marks the current tab with aria-current="page" and only that one', () => {
    render(<Bar />);
    expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('link').filter((link) => link.hasAttribute('aria-current'))).toHaveLength(1);
  });

  it('names each tab by its visible label; the icon is hidden and the badge follows the label', () => {
    render(<Bar />);
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('link', { name: /^Friends\s?New activity$/ }).textContent).toBe('Friends New activity');
  });

  it('marks the prominent tab with data-prominent', () => {
    render(<Bar />);
    expect(screen.getByRole('link', { name: 'Search' })).toHaveAttribute('data-prominent');
    expect(screen.getByRole('link', { name: 'Map' })).not.toHaveAttribute('data-prominent');
  });

  it('is fixed by default and static on request', () => {
    const { unmount } = render(<Bar />);
    expect(screen.getByRole('navigation')).toHaveAttribute('data-position', 'fixed');
    unmount();
    render(<Bar position="static" />);
    expect(screen.getByRole('navigation')).toHaveAttribute('data-position', 'static');
  });

  it('asChild renders the router\'s link with the icon and label inside it', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <TabBar label="Primary">
        <TabBar.Item<HTMLAnchorElement> asChild current ref={ref} icon={<svg data-testid="icon" />}>
          <RouterLink href="/feed">Feed</RouterLink>
        </TabBar.Item>
      </TabBar>,
    );
    const link = screen.getByRole('link', { name: 'Feed' });
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toContainElement(screen.getByTestId('icon'));
    expect(ref.current).toBe(link);
  });

  it('is reached with Tab, tab by tab', async () => {
    const user = userEvent.setup();
    render(<Bar />);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Feed' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Map' })).toHaveFocus();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Bar position="static" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
