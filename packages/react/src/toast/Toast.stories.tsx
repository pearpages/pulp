import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../button';
import { Inline } from '../inline';
import { ToastProvider, type ToastPlacement } from './Toast';
import { useState } from 'react';
import { Text } from '../text';
import { useToast } from './context';

function Demo() {
  const { toast, dismissAll } = useToast();
  return (
    <Inline gap={2}>
      <Button variant="secondary" onClick={() => toast({ title: 'Tokens rebuilt', description: 'dist/tokens.css matches its source.' })}>
        Info toast
      </Button>
      <Button variant="secondary" onClick={() => toast({ tone: 'success', title: 'Published 0.1.0' })}>
        Success toast
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast({ tone: 'error', title: 'Publish failed', description: 'Stays until you dismiss it.', action: { label: 'Retry', onClick: () => {} } })}
      >
        Error toast
      </Button>
      <Button variant="ghost" onClick={dismissAll}>
        Clear
      </Button>
    </Inline>
  );
}

const meta = {
  title: 'Components/Feedback/Toast',
  component: ToastProvider,
  args: { placement: 'bottom-end', max: 5, duration: 6000, children: <Demo /> },
  argTypes: {
    placement: { control: 'select', options: ['bottom-end', 'top-end', 'top-center'] satisfies ToastPlacement[] },
    children: { control: false },
  },
  parameters: {
    layout: 'padded',
    a11y: { context: 'body' },
  },
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Error toast' }));
    const region = within(document.body).getByRole('region', { name: 'Notifications' });
    // The toast animates in; poll until it is visible.
    await waitFor(() => expect(within(region).getByText('Publish failed')).toBeVisible());
    await userEvent.click(within(region).getByRole('button', { name: 'Dismiss' }));
    await waitFor(() => expect(within(region).queryByText('Publish failed')).toBeNull());
  },
};
function UndoDemo() {
  const { toast } = useToast();
  const [saved, setSaved] = useState(true);
  return (
    <Inline gap={2} align="center">
      <Button
        variant="secondary"
        tone="danger"
        disabled={!saved}
        onClick={() => {
          // Do the work first; the toast only offers to reverse it.
          setSaved(false);
          toast.undo('Casa Leopoldo removed', () => setSaved(true));
        }}
      >
        Remove place
      </Button>
      <Text>{saved ? 'Saved: Casa Leopoldo' : 'Nothing saved'}</Text>
    </Inline>
  );
}

export const Undo: Story = {
  args: { children: <UndoDemo /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const remove = canvas.getByRole('button', { name: 'Remove place' });
    await userEvent.click(remove);
    await expect(canvas.getByText('Nothing saved')).toBeInTheDocument();
    const region = within(document.body).getByRole('region', { name: 'Notifications' });
    await waitFor(() => expect(within(region).getByText('Casa Leopoldo removed')).toBeVisible());
    // The toast offers the way back without taking focus; the keyboard reaches it by Tab.
    await expect(region.contains(document.activeElement)).toBe(false);
    await userEvent.click(within(region).getByRole('button', { name: 'Undo' }));
    await expect(canvas.getByText('Saved: Casa Leopoldo')).toBeInTheDocument();
    await waitFor(() => expect(within(region).queryByText('Casa Leopoldo removed')).toBeNull());
  },
};

export const TopCenter: Story = { args: { placement: 'top-center' } };

const show = async (canvasElement: HTMLElement) => {
  for (const name of ['Info toast', 'Success toast', 'Error toast']) {
    await userEvent.click(within(canvasElement).getByRole('button', { name }));
  }
  await expect(within(document.body).getAllByRole('listitem')).toHaveLength(3);
};

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  args: { duration: Infinity },
  play: async ({ canvasElement }) => show(canvasElement),
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
