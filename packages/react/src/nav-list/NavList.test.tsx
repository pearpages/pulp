import { createRef, type AnchorHTMLAttributes } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Badge } from '../badge';
import { NavList } from './NavList';

/** Stands in for a router's link (next/link): its own component, rendering an `a`. */
function RouterLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} data-router="" />;
}

function Sidebar() {
  return (
    <NavList label="Primary">
      <NavList.Item
        href="/discover"
        current="section"
        icon={<svg data-testid="icon" />}
        sub={
          <>
            <NavList.Item href="/discover/feed" current="page">
              Feed
            </NavList.Item>
            <NavList.Item href="/discover/trending">Trending</NavList.Item>
          </>
        }
      >
        Discover
      </NavList.Item>
      <NavList.Item href="/map">Map</NavList.Item>
      <NavList.Item href="/friends" badge={<Badge variant="dot" label="New activity" />}>
        Friends
      </NavList.Item>
    </NavList>
  );
}

describe('NavList', () => {
  it('is a named nav landmark holding a list of links', () => {
    render(<Sidebar />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(nav.firstElementChild?.tagName).toBe('UL');
    expect(within(nav).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/discover',
      '/discover/feed',
      '/discover/trending',
      '/map',
      '/friends',
    ]);
    // Links, not a menu: no menu roles anywhere.
    expect(nav.querySelector('[role^="menu"]')).toBeNull();
  });

  it('marks the page with aria-current="page" and its section with aria-current="true"', () => {
    render(<Sidebar />);
    expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute('data-current', 'section');
    expect(screen.getByRole('link', { name: 'Map' })).not.toHaveAttribute('aria-current');
  });

  it('nests a section\'s pages as a list inside its item', () => {
    render(<Sidebar />);
    const section = screen.getByRole('link', { name: 'Discover' }).closest('li')!;
    const sub = within(section).getByRole('list');
    expect(within(sub).getAllByRole('link').map((link) => link.textContent)).toEqual(['Feed', 'Trending']);
  });

  it('hides the icon and names a badge through its own label', () => {
    render(<Sidebar />);
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('link', { name: /^Friends\s?New activity$/ }).textContent).toBe('Friends New activity');
  });

  it('asChild renders the router\'s link with the icon, label and badge inside it', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <NavList label="Primary">
        <NavList.Item<HTMLAnchorElement> asChild current="page" ref={ref} icon={<svg data-testid="icon" />} badge={<Badge count={3} label="unread" />}>
          <RouterLink href="/inbox">Inbox</RouterLink>
        </NavList.Item>
      </NavList>,
    );
    const link = screen.getByRole('link', { name: /^Inbox\s?3\s?unread$/ });
    expect(link.textContent).toBe('Inbox 3 unread');
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toContainElement(screen.getByTestId('icon'));
    expect(ref.current).toBe(link);
  });

  it('asChild takes a button for an action in the list, and its handler runs', async () => {
    const onClick = vi.fn();
    render(
      <NavList label="Account">
        <NavList.Item href="/profile">Profile</NavList.Item>
        <NavList.Item asChild>
          <button type="button" onClick={onClick}>
            Sign out
          </button>
        </NavList.Item>
      </NavList>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is reached with Tab, link by link, with no roving focus', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Discover' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Feed' })).toHaveFocus();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Sidebar />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
