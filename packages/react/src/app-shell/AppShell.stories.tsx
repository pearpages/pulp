import type { Meta, StoryObj } from '@storybook/react-vite';
import { Compass, MapFolded, Search, User, Users } from '@pearpages/pulp-icons';
import { expect, within } from 'storybook/test';
import { Badge } from '../badge';
import { Button } from '../button';
import { Card } from '../card';
import { Heading } from '../heading';
import { NavList } from '../nav-list';
import { Stack } from '../stack';
import { TabBar } from '../tab-bar';
import { Text } from '../text';
import { AppShell } from './AppShell';

const header = (
  <header className="sb-app-bar">
    <Heading level={2} size="md">
      bitepals
    </Heading>
    <Button size="sm" variant="ghost">
      Settings
    </Button>
  </header>
);

const footer = (
  <footer className="sb-app-footer">
    <Text size="sm" tone="muted">
      © 2026 bitepals
    </Text>
  </footer>
);

const sidebar = (
  <NavList label="Primary">
    <NavList.Item
      href="?discover"
      current="section"
      icon={<Compass />}
      sub={
        <>
          <NavList.Item href="?feed" current="page">
            Feed
          </NavList.Item>
          <NavList.Item href="?trending">Trending</NavList.Item>
        </>
      }
    >
      Discover
    </NavList.Item>
    <NavList.Item href="?map" icon={<MapFolded />}>
      Map
    </NavList.Item>
    <NavList.Item href="?search" icon={<Search />}>
      Search
    </NavList.Item>
    <NavList.Item href="?friends" icon={<Users />} badge={<Badge variant="dot" tone="action" label="New activity" />}>
      Friends
    </NavList.Item>
    <NavList.Item href="?you" icon={<User />}>
      You
    </NavList.Item>
  </NavList>
);

const tabBar = (
  <TabBar label="Primary">
    <TabBar.Item href="?feed" current icon={<Compass />}>
      Feed
    </TabBar.Item>
    <TabBar.Item href="?map" icon={<MapFolded />}>
      Map
    </TabBar.Item>
    <TabBar.Item href="?search" prominent icon={<Search />}>
      Search
    </TabBar.Item>
    <TabBar.Item href="?friends" icon={<Users />} badge={<Badge variant="dot" tone="action" label="New activity" />}>
      Friends
    </TabBar.Item>
    <TabBar.Item href="?you" icon={<User />}>
      You
    </TabBar.Item>
  </TabBar>
);

const page = (
  <div className="sb-app-page">
    <Stack gap={4}>
      <Heading level={1}>Feed</Heading>
      <Text tone="muted">What your friends saved this week.</Text>
      <Card padding="md">Can Culleretes · saved by Marta</Card>
      <Card padding="md">Bar Cañete · saved by Pau</Card>
      <Card padding="md">Els Pescadors · saved by Laia</Card>
    </Stack>
  </div>
);

const meta = {
  title: 'Components/Layout/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  args: { header, sidebar, tabBar, footer, children: page },
  argTypes: {
    header: { control: false },
    sidebar: { control: false },
    tabBar: { control: false },
    footer: { control: false },
    children: { control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Signed in: the same places as a NavList beside the page from 48rem, as a TabBar under it below. Resize to see the switch. */
export const SignedIn: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('main')).toBeInTheDocument();
    // One primary navigation at any width: the other one is display: none, out of the accessibility tree.
    await expect(canvas.getAllByRole('navigation', { name: 'Primary' })).toHaveLength(1);
    const wide = window.matchMedia('(width >= 48rem)').matches;
    const visible = canvas.getByRole('navigation', { name: 'Primary' });
    await expect(visible.querySelector('[data-prominent]') == null).toBe(wide);
  },
};

/** Signed out: the app passes no navigation, so the shell is a header, the page and a footer at every width. */
export const SignedOut: Story = {
  args: { sidebar: undefined, tabBar: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('navigation')).toBeNull();
    await expect(canvas.getByRole('main')).toBeInTheDocument();
  },
};

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
export const MatrixMenjaLight: Story = { ...Matrix, name: 'Matrix: menja, light', globals: { brand: 'menja', scheme: 'light' } };
export const MatrixMenjaDark: Story = { ...Matrix, name: 'Matrix: menja, dark', globals: { brand: 'menja', scheme: 'dark' } };
