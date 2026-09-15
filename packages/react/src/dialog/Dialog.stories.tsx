import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../button';
import { TextField } from '../text-field';
import { Dialog, DialogSystem } from './Dialog';

const meta = {
  title: 'Components/Overlays/Dialog',
  component: Dialog,
  decorators: [(Story) => <DialogSystem><Story /></DialogSystem>],
  args: { id: 'example', children: null },
  argTypes: { children: { control: false }, id: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          'Built on `@pearpages/modals`: focus trap, inert page, Escape and backdrop dismissal, stacking. pulp owns the portal element and themes it with `--dialog-*` tokens. Mount `DialogSystem` once and import `@pearpages/modals/styles.css` (ideally into the `vendor` layer).',
      },
    },
    // The dialog renders outside the story root; check the whole document.
    a11y: { context: 'body' },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const settings = (id: string) => (
  <>
    <Dialog.Trigger asChild target={id}>
      <Button variant="secondary">Open settings</Button>
    </Dialog.Trigger>
    <Dialog id={id}>
      <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Settings</Dialog.Title>
        <Dialog.Description>Change how the workspace behaves.</Dialog.Description>
        <Dialog.Close aria-label="Close" />
      </Dialog.Header>
      <Dialog.Body>
        <TextField label="Workspace name" defaultValue="pulp" />
      </Dialog.Body>
      <Dialog.Footer>
        <Dialog.Close asChild>
          <Button variant="ghost">Cancel</Button>
        </Dialog.Close>
        <Button>Save</Button>
      </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  </>
);

const open = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open settings' }));
  const dialog = await within(document.body).findByRole('dialog', { name: 'Settings' });
  // The vendor animates in (data-state: opening → open, then an opacity
  // transition); poll until it is actually visible.
  await waitFor(() => expect(dialog).toHaveAttribute('data-state', 'open'));
  await waitFor(() => expect(dialog).toBeVisible());
  return dialog;
};

export const Basic: Story = {
  render: () => settings('basic'),
  play: async ({ canvasElement }) => {
    await open(canvasElement);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
  },
};

export const Stacked: Story = {
  render: () => (
    <>
      <Dialog.Trigger asChild target="outer">
        <Button variant="secondary">Open settings</Button>
      </Dialog.Trigger>
      <Dialog id="outer">
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Settings</Dialog.Title>
          <Dialog.Close aria-label="Close" />
        </Dialog.Header>
        <Dialog.Body>
          <Dialog.Trigger asChild target="inner">
            <Button variant="ghost">Delete workspace…</Button>
          </Dialog.Trigger>
          <Dialog id="inner">
            <Dialog.Content size="auto">
              <Dialog.Header>
                <Dialog.Title>Delete workspace?</Dialog.Title>
                <Dialog.Description>This cannot be undone.</Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant="secondary">Keep it</Button>
                </Dialog.Close>
                <Button>Delete</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>
        </Dialog.Body>
      </Dialog.Content>
      </Dialog>
    </>
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement);
    await userEvent.click(within(document.body).getByRole('button', { name: 'Delete workspace…' }));
    const inner = await within(document.body).findByRole('dialog', { name: 'Delete workspace?' });
    await waitFor(() => expect(inner).toHaveAttribute('data-state', 'open'));
  },
};

// One story per brand × scheme, opened before the a11y check runs.
export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  render: () => settings('matrix'),
  play: async ({ canvasElement }) => {
    await open(canvasElement);
  },
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = {
  ...Matrix,
  name: 'Matrix: bitepals, light',
  globals: { brand: 'bitepals', scheme: 'light' },
};
export const MatrixBitepalsDark: Story = {
  ...Matrix,
  name: 'Matrix: bitepals, dark',
  globals: { brand: 'bitepals', scheme: 'dark' },
};
