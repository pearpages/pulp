import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Inline } from '../inline';
import { Stack } from '../stack';
import { Popover } from './Popover';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  args: { placement: 'bottom-start', children: null },
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end'] },
    children: { control: false },
  },
  parameters: {
    a11y: { context: 'body' },
  },
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger asChild>
        <Button variant="secondary">Filters</Button>
      </Popover.Trigger>
      <Popover.Content title="Filter results">
        <Stack gap={2}>
          <Checkbox label="Only mine" defaultChecked />
          <Checkbox label="Include archived" />
        </Stack>
        <Inline gap={2} justify="end">
          <Popover.Close asChild>
            <Button size="sm">Apply</Button>
          </Popover.Close>
        </Inline>
      </Popover.Content>
    </Popover>
  ),
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

const open = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Filters' }));
  await waitFor(() => expect(within(document.body).getByRole('dialog', { name: 'Filter results' })).toBeVisible());
};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await open(canvasElement);
    await expect(within(document.body).getByRole('checkbox', { name: 'Only mine' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
    await expect(within(canvasElement).getByRole('button', { name: 'Filters' })).toHaveFocus();
  },
};
export const Top: Story = { args: { placement: 'top-end' } };

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  play: async ({ canvasElement }) => open(canvasElement),
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
