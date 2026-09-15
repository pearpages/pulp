import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ArrowRight, Close, Plus } from '@pearpages/pulp-icons';
import { Button } from '../button';
import { Menu } from './Menu';

const meta = {
  title: 'Components/Overlays/Menu',
  component: Menu,
  args: { placement: 'bottom-start', children: null },
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end'] },
    children: { control: false },
  },
  parameters: {
    a11y: { context: 'body' },
  },
  render: (args) => (
    <Menu {...args}>
      <Menu.Trigger asChild>
        <Button variant="secondary">Actions</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item icon={<Plus />} onSelect={fn()}>
          New workspace
        </Menu.Item>
        <Menu.Item icon={<ArrowRight />} onSelect={fn()}>
          Move to…
        </Menu.Item>
        <Menu.Item disabled>Share (coming soon)</Menu.Item>
        <Menu.Separator />
        <Menu.Item tone="danger" icon={<Close />} onSelect={fn()}>
          Delete
        </Menu.Item>
      </Menu.Content>
    </Menu>
  ),
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

const open = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Actions' }));
  await waitFor(() => expect(within(document.body).getByRole('menu')).toBeVisible());
};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await open(canvasElement);
    await waitFor(() => expect(within(document.body).getByRole('menuitem', { name: 'New workspace' })).toHaveFocus());
    // The gap token reaches the position: the menu sits below the trigger, not flush against it.
    const menu = within(document.body).getByRole('menu');
    const trigger = within(canvasElement).getByRole('button', { name: 'Actions' });
    await waitFor(() => expect(menu.getBoundingClientRect().top).toBeGreaterThan(trigger.getBoundingClientRect().bottom + 4));
    await userEvent.keyboard('{ArrowDown}');
    await expect(within(document.body).getByRole('menuitem', { name: 'Move to…' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('menu')).toBeNull());
  },
};

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  play: async ({ canvasElement }) => open(canvasElement),
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
