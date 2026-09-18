import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from '@pearpages/pulp-icons';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Stack } from '../stack';
import { SegmentedControl } from './SegmentedControl';

const views = [
  { value: 'list', label: 'List' },
  { value: 'map', label: 'Map' },
  { value: 'grid', label: 'Grid' },
] as const;

const meta = {
  title: 'Components/Forms/SegmentedControl',
  component: SegmentedControl,
  args: { label: 'View', options: views, defaultValue: 'list', look: 'segmented', size: 'md', onValueChange: fn() },
  argTypes: {
    look: { control: 'select', options: ['segmented', 'chips'] },
    size: { control: 'select', options: ['sm', 'md'] },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    // One tab stop, on the checked radio; the arrows are the browser's.
    await expect(canvas.getByRole('radio', { name: 'List' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'Map' })).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('map');
    await userEvent.click(canvas.getByText('Grid'));
    await expect(canvas.getByRole('radio', { name: 'Grid' })).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('grid');
  },
};

export const Chips: Story = { args: { look: 'chips' } };
export const Small: Story = { args: { size: 'sm' } };
export const FullWidth: Story = { args: { fullWidth: true } };
export const WithIcons: Story = {
  args: { options: [{ value: 'search', label: 'Search', icon: <Search /> }, { value: 'saved', label: 'Saved' }], defaultValue: 'search' },
};
export const OneDisabled: Story = { args: { options: [views[0], { ...views[1], disabled: true }, views[2]] } };
export const Disabled: Story = { args: { disabled: true } };

export const Nav: Story = {
  render: () => (
    <SegmentedControl.Nav label="Places view">
      <SegmentedControl.NavItem href="?view=mine" current>
        Mine
      </SegmentedControl.NavItem>
      <SegmentedControl.NavItem href="?view=friends">Friends</SegmentedControl.NavItem>
    </SegmentedControl.Nav>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Navigation, said as navigation: links in a named landmark, no radios, no tabs.
    await expect(canvas.getByRole('navigation', { name: 'Places view' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Mine' })).toHaveAttribute('aria-current', 'page');
    await expect(canvas.queryByRole('radio')).toBeNull();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Mine' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Friends' })).toHaveFocus();
  },
};

const matrix = (
  <div className="sb-grid">
    <Stack gap={3} align="start">
      <SegmentedControl label="md" options={views} defaultValue="list" />
      <SegmentedControl label="sm" size="sm" options={views} defaultValue="map" />
      <SegmentedControl label="chips" look="chips" options={views} defaultValue="grid" />
      <SegmentedControl label="chips sm" look="chips" size="sm" options={views} defaultValue="list" />
      <SegmentedControl label="one disabled" options={[views[0], { ...views[1], disabled: true }, views[2]]} defaultValue="list" />
      <SegmentedControl label="disabled" options={views} defaultValue="list" disabled />
      <SegmentedControl.Nav label="nav">
        <SegmentedControl.NavItem href="?a" current>
          Mine
        </SegmentedControl.NavItem>
        <SegmentedControl.NavItem href="?b">Friends</SegmentedControl.NavItem>
      </SegmentedControl.Nav>
    </Stack>
    <SegmentedControl label="full width" fullWidth options={views} defaultValue="map" />
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
