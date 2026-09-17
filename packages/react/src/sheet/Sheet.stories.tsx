import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { DialogSystem } from '../dialog';
import { Stack } from '../stack';
import { Sheet, type SheetPlacement } from './Sheet';

const meta = {
  title: 'Components/Overlays/Sheet',
  component: Sheet,
  decorators: [(Story) => <DialogSystem><Story /></DialogSystem>],
  args: { id: 'example', children: null },
  argTypes: { children: { control: false }, id: { control: false } },
  parameters: {
    // The sheet renders outside the story root; check (and shoot) the whole document.
    a11y: { context: 'body' },
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const filters = (id: string, placement?: SheetPlacement) => (
  <>
    <Sheet.Trigger asChild target={id}>
      <Button variant="secondary">Open filters</Button>
    </Sheet.Trigger>
    <Sheet id={id}>
      <Sheet.Content placement={placement}>
        <Sheet.Header>
          <Sheet.Title>Filters</Sheet.Title>
          <Sheet.Description>Narrow the list of workspaces.</Sheet.Description>
          <Sheet.Close aria-label="Close" />
        </Sheet.Header>
        <Sheet.Body>
          <Stack gap={3}>
            <Checkbox label="Active" defaultChecked />
            <Checkbox label="Archived" />
            <Checkbox label="Shared with me" />
          </Stack>
        </Sheet.Body>
        <Sheet.Footer>
          <Sheet.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Sheet.Close>
          <Button>Apply</Button>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  </>
);

const open = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open filters' }));
  const sheet = await within(document.body).findByRole('dialog', { name: 'Filters' });
  // The vendor slides it in (data-state: opening → open); poll until it has arrived.
  await waitFor(() => expect(sheet).toHaveAttribute('data-state', 'open'));
  await waitFor(() => expect(sheet).toBeVisible());
  return sheet;
};

export const Default: Story = {
  render: () => filters('default'),
  play: async ({ canvasElement }) => {
    const sheet = await open(canvasElement);
    await expect(sheet).toHaveAttribute('data-placement', 'end');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
  },
};

const docked = (placement: SheetPlacement): Story => ({
  render: () => filters(placement, placement),
  play: async ({ canvasElement }) => {
    await expect(await open(canvasElement)).toHaveAttribute('data-placement', placement);
  },
});

export const Start: Story = docked('start');
export const Top: Story = docked('top');
export const Bottom: Story = docked('bottom');

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  render: () => filters('matrix'),
  play: async ({ canvasElement }) => {
    await open(canvasElement);
  },
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
