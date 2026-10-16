import type { Meta, StoryObj } from '@storybook/react-vite';
import { Compass, MapFolded, Search, User, Users } from '@pearpages/pulp-icons';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Badge } from '../badge';
import { NavList } from './NavList';

const meta = {
  title: 'Components/Navigation/NavList',
  component: NavList,
  args: { label: 'Primary', children: null },
  argTypes: {
    ref: { control: false, table: { disable: true } },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="sb-narrow">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NavList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An app's sidebar: the Discover section is open on its Feed page, Friends has new activity. */
export const Default: Story = {
  render: (args) => (
    <NavList {...args}>
      <NavList.Item
        href="?discover"
        current="section"
        icon={<Compass />}
        sub={
          <>
            <NavList.Item href="?feed" current="page">
              Feed
            </NavList.Item>
            <NavList.Item href="?recommended">Recommended</NavList.Item>
            <NavList.Item href="?trending">Trending</NavList.Item>
            <NavList.Item href="?boards">Boards</NavList.Item>
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
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Feed' })).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('link', { name: 'Discover' })).toHaveAttribute('aria-current', 'true');
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Discover' })).toHaveFocus();
  },
};

/** A section's own list, with actions at the end: an action is a `button` through `asChild`, never a link to nowhere. */
export const WithActions: Story = {
  args: { label: 'Account' },
  render: (args) => {
    const signOut = fn();
    return (
      <NavList {...args}>
        <NavList.Item href="?profile" current="page">
          Profile
        </NavList.Item>
        <NavList.Item href="?saved">Saved</NavList.Item>
        <NavList.Item href="?activity" badge={<Badge count={3} label="new" tone="action" />}>
          Activity
        </NavList.Item>
        <NavList.Item asChild>
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </NavList.Item>
      </NavList>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: /^Activity\s?3\s?new$/ })).toBeInTheDocument();
  },
};

/** A label longer than the column ends in an ellipsis; the badge stays whole. */
export const LongLabel: Story = {
  render: (args) => (
    <NavList {...args}>
      <NavList.Item href="?a" icon={<Users />} badge={<Badge count={12} label="waiting" />}>
        Invite requests waiting for review
      </NavList.Item>
    </NavList>
  ),
};

// A grid, not a row: a flex row would shrink each list to its words, and the badges would stop
// lining up at the end of the column.
const matrix = (
  <div className="sb-grid">
    <div className="sb-narrow">
      <NavList label="Matrix primary">
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
        <NavList.Item href="?friends" icon={<Users />} badge={<Badge variant="dot" tone="action" label="New activity" />}>
          Friends
        </NavList.Item>
      </NavList>
    </div>
    <div className="sb-narrow">
      <NavList label="Matrix account">
        <NavList.Item href="?profile" current="page" icon={<User />}>
          Profile
        </NavList.Item>
        <NavList.Item href="?activity" icon={<Search />} badge={<Badge count={3} label="new" tone="action" />}>
          Activity
        </NavList.Item>
        <NavList.Item asChild>
          <button type="button">Sign out</button>
        </NavList.Item>
      </NavList>
    </div>
  </div>
);

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  decorators: [(Story) => <Story />],
  render: () => matrix,
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
export const MatrixMenjaLight: Story = { ...Matrix, name: 'Matrix: menja, light', globals: { brand: 'menja', scheme: 'light' } };
export const MatrixMenjaDark: Story = { ...Matrix, name: 'Matrix: menja, dark', globals: { brand: 'menja', scheme: 'dark' } };
