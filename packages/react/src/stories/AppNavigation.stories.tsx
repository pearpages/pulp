import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapFolded, Newspaper, Search, User, Users } from '@pearpages/pulp-icons';
import { useState, type MouseEvent, type ReactNode } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { AppShell } from '../app-shell';
import { Badge } from '../badge';
import { Heading } from '../heading';
import { NavList } from '../nav-list';
import { Stack } from '../stack';
import { Switch } from '../switch';
import { TabBar } from '../tab-bar';
import { Text } from '../text';

/**
 * The app keeps one list of places. Both navigations are drawn from it, and which link is current is
 * worked out from the path in one function, so the sidebar and the tab bar never disagree.
 */
interface Place {
  href: string;
  label: string;
  icon: ReactNode;
  /** Raised in the tab bar: the app's main action. */
  prominent?: boolean;
  /** The section's own pages, listed under it in the sidebar while the section is current. */
  pages?: ReadonlyArray<{ href: string; label: string }>;
}

const PLACES: ReadonlyArray<Place> = [
  {
    href: '/feed',
    label: 'Feed',
    icon: <Newspaper />,
    pages: [
      { href: '/feed', label: 'Friends' },
      { href: '/feed/trending', label: 'Trending' },
    ],
  },
  { href: '/map', label: 'Map', icon: <MapFolded /> },
  { href: '/search', label: 'Search', icon: <Search />, prominent: true },
  { href: '/friends', label: 'Friends', icon: <Users /> },
  {
    href: '/you',
    label: 'You',
    icon: <User />,
    pages: [
      { href: '/you', label: 'Profile' },
      { href: '/you/saved', label: 'Saved' },
    ],
  },
];

/** `/friends` is current at `/friends/inbox` too; a section's hub page only at its own path. */
const inSection = (path: string, href: string) => path === href || path.startsWith(`${href}/`);

/** In a Next.js app this is `next/link`, and the path comes from `usePathname()`. */
function useStoryRouter(initial: string) {
  const [path, setPath] = useState(initial);
  const link = (href: string, label: ReactNode) => (
    <a
      href={href}
      onClick={(event: MouseEvent) => {
        event.preventDefault();
        setPath(href);
      }}
    >
      {label}
    </a>
  );
  return { path, link };
}

function Sidebar({ path, link, unread }: { path: string; link: (href: string, label: ReactNode) => ReactNode; unread: boolean }) {
  return (
    <NavList label="Primary">
      {PLACES.map((place) => {
        const section = inSection(path, place.href) || place.pages?.some((page) => inSection(path, page.href));
        const exact = path === place.href && !place.pages;
        return (
          <NavList.Item
            key={place.href}
            asChild
            icon={place.icon}
            current={exact ? 'page' : section ? 'section' : undefined}
            badge={place.href === '/friends' && unread ? <Badge variant="dot" tone="action" label="New activity" /> : undefined}
            sub={
              section && place.pages
                ? place.pages.map((page) => (
                    <NavList.Item key={page.href} asChild current={path === page.href ? 'page' : undefined}>
                      {link(page.href, page.label)}
                    </NavList.Item>
                  ))
                : undefined
            }
          >
            {link(place.href, place.label)}
          </NavList.Item>
        );
      })}
    </NavList>
  );
}

function Tabs({ path, link, unread }: { path: string; link: (href: string, label: ReactNode) => ReactNode; unread: boolean }) {
  return (
    <TabBar label="Primary">
      {PLACES.map((place) => (
        <TabBar.Item
          key={place.href}
          asChild
          icon={place.icon}
          prominent={place.prominent}
          current={inSection(path, place.href) || place.pages?.some((page) => inSection(path, page.href))}
          badge={place.href === '/friends' && unread ? <Badge variant="dot" tone="action" label="New activity" /> : undefined}
        >
          {link(place.href, place.label)}
        </TabBar.Item>
      ))}
    </TabBar>
  );
}

/** The page's name: a section's page first, so `/feed/trending` reads "Trending", not "Feed". */
const titleOf = (path: string) =>
  PLACES.flatMap((place) => place.pages ?? []).find((page) => page.href === path)?.label ??
  PLACES.find((place) => inSection(path, place.href))?.label ??
  path;

function App({ initialPath = '/feed', initiallySignedIn = true }: { initialPath?: string; initiallySignedIn?: boolean }) {
  const { path, link } = useStoryRouter(initialPath);
  const [signedIn, setSignedIn] = useState(initiallySignedIn);
  const nav = { path, link, unread: true };

  return (
    <AppShell
      header={
        <header className="sb-app-bar">
          <Heading level={2} size="md">
            bitepals
          </Heading>
          <Switch label="Signed in" checked={signedIn} onChange={(event) => setSignedIn(event.currentTarget.checked)} />
        </header>
      }
      // Signed out: the app passes no navigation, and the shell lays out header, page and footer.
      sidebar={signedIn ? <Sidebar {...nav} /> : undefined}
      tabBar={signedIn ? <Tabs {...nav} /> : undefined}
      footer={
        <footer className="sb-app-footer">
          <Text size="sm" tone="muted">
            © 2026 bitepals
          </Text>
        </footer>
      }
    >
      <div className="sb-app-page">
        <Stack gap={3}>
          <Heading level={1}>{titleOf(path)}</Heading>
          <Text tone="muted">{signedIn ? 'Follow a link in either navigation: both mark the same place.' : 'Signed out: no navigation at any width.'}</Text>
        </Stack>
      </div>
    </AppShell>
  );
}

const meta = {
  title: 'Patterns/App navigation',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * One list of places, drawn as a NavList beside the page from 48rem and as a TabBar under it below.
 * Resize the viewport to see the switch. Signing out removes both, and the shell closes the gap.
 */
export const Default: Story = {
  render: () => <App />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Whichever navigation fits the width is the only one assistive technology meets.
    const nav = canvas.getByRole('navigation', { name: 'Primary' });
    await userEvent.click(within(nav).getByRole('link', { name: 'Map' }));
    await expect(canvas.getByRole('heading', { level: 1, name: 'Map' })).toBeInTheDocument();
    await expect(within(nav).getByRole('link', { name: 'Map' })).toHaveAttribute('aria-current', 'page');
    await expect(within(nav).getAllByRole('link').filter((link) => link.getAttribute('aria-current') === 'page')).toHaveLength(1);

    await userEvent.click(canvas.getByRole('switch', { name: 'Signed in' }));
    await expect(canvas.queryByRole('navigation')).toBeNull();
  },
};

/** On a sub-page the sidebar marks the page and its section: `aria-current="page"` and `"true"`. */
export const SubPage: Story = {
  render: () => <App initialPath="/feed/trending" />,
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', { name: 'Primary' });
    if (!window.matchMedia('(width >= 48rem)').matches) return;
    await expect(within(nav).getByRole('link', { name: 'Trending' })).toHaveAttribute('aria-current', 'page');
    await expect(within(nav).getByRole('link', { name: 'Feed' })).toHaveAttribute('aria-current', 'true');
  },
};
