import type { Meta, StoryObj } from '@storybook/react-vite';
import { Compass, MapFolded, Search, User, Users } from '@pearpages/pulp-icons';
import { expect, within } from 'storybook/test';
import { Badge } from '../badge';
import { Text } from '../text';
import { TabBar } from './TabBar';

const meta = {
  title: 'Components/Navigation/TabBar',
  component: TabBar,
  args: { label: 'Primary', position: 'static', children: null },
  argTypes: {
    position: { control: 'select', options: ['fixed', 'static'] },
    ref: { control: false, table: { disable: true } },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="sb-wide">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabs = (
  <>
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
  </>
);

/** Five places, the current one in the action colour, Search raised as the app's main action, a dot on Friends. */
export const Default: Story = {
  render: (args) => <TabBar {...args}>{tabs}</TabBar>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Primary' });
    await expect(canvas.getByRole('link', { name: 'Feed' })).toHaveAttribute('aria-current', 'page');
    // The tabs share the width equally, whatever their labels.
    const widths = within(nav).getAllByRole('listitem').map((item) => Math.round(item.getBoundingClientRect().width));
    await expect(new Set(widths).size).toBe(1);
    // The raised button rises above the bar, and the bar never shrinks a tab below its height.
    const bar = nav.getBoundingClientRect();
    const bubble = canvas.getByRole('link', { name: 'Search' }).firstElementChild!.getBoundingClientRect();
    await expect(bubble.top).toBeLessThan(bar.top);
    for (const link of within(nav).getAllByRole('link')) {
      await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }
  },
};

/** Three tabs, none prominent. */
export const Three: Story = {
  render: (args) => (
    <TabBar {...args}>
      <TabBar.Item href="?feed" icon={<Compass />}>
        Feed
      </TabBar.Item>
      <TabBar.Item href="?map" current icon={<MapFolded />}>
        Map
      </TabBar.Item>
      <TabBar.Item href="?you" icon={<User />}>
        You
      </TabBar.Item>
    </TabBar>
  ),
};

/** Docked to the bottom of the viewport, as an app uses it: the page scrolls behind it. */
export const Fixed: Story = {
  args: { position: 'fixed' },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="sb-grid">
        <Text>The bar is fixed to the bottom edge and pads itself by the safe-area inset on a phone.</Text>
        <Story />
      </div>
    ),
  ],
  render: (args) => <TabBar {...args}>{tabs}</TabBar>,
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', { name: 'Primary' });
    await expect(getComputedStyle(nav).position).toBe('fixed');
    await expect(Math.round(nav.getBoundingClientRect().bottom)).toBe(window.innerHeight);
  },
};

const matrix = (
  <div className="sb-grid">
    <TabBar label="Matrix five" position="static">
      {tabs}
    </TabBar>
    <TabBar label="Matrix three" position="static">
      <TabBar.Item href="?feed" icon={<Compass />} badge={<Badge count={3} label="new" tone="action" variant="solid" size="sm" />}>
        Feed
      </TabBar.Item>
      <TabBar.Item href="?map" current icon={<MapFolded />}>
        Map
      </TabBar.Item>
      <TabBar.Item href="?you" icon={<User />}>
        Recommendations for you
      </TabBar.Item>
    </TabBar>
  </div>
);

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  render: () => matrix,
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
export const MatrixMenjaLight: Story = { ...Matrix, name: 'Matrix: menja, light', globals: { brand: 'menja', scheme: 'light' } };
export const MatrixMenjaDark: Story = { ...Matrix, name: 'Matrix: menja, dark', globals: { brand: 'menja', scheme: 'dark' } };
