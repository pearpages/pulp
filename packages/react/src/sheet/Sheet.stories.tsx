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

export const DragToDismiss: Story = {
  render: () => filters('drag', 'bottom'),
  play: async ({ canvasElement }) => {
    const sheet = await open(canvasElement);
    const handle = sheet.querySelector<HTMLElement>('[class*="handle"]')!;
    // A pointer-only shortcut: nothing for assistive technology or the keyboard to find.
    await expect(handle).toHaveAttribute('aria-hidden', 'true');
    const { x, y, width } = handle.getBoundingClientRect();
    const at = (dy: number) => ({ clientX: x + width / 2, clientY: y + 4 + dy });
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: handle, coords: at(0) },
      { target: handle, coords: at(40) },
      { target: handle, coords: at(sheet.offsetHeight / 2) },
      { keys: '[/MouseLeft]', target: handle, coords: at(sheet.offsetHeight / 2) },
    ]);
    // Past a quarter of its height (and fast): it closes through the dialog's own path, so focus returns.
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(within(canvasElement).getAllByRole('button')[0]).toHaveFocus());
  },
};

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
