import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '../button';
import { Alert } from './Alert';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  args: { tone: 'info', title: 'Tokens rebuilt', children: 'The generated CSS matches its JSON source.', onDismiss: fn() },
  argTypes: {
    tone: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
    live: { control: 'select', options: ['polite', 'assertive', 'off'] },
    icon: { control: false },
    action: { control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Dismiss' }));
    await expect(args.onDismiss).toHaveBeenCalled();
  },
};
export const WithAction: Story = {
  args: {
    tone: 'error',
    title: 'Publish failed',
    children: 'npm rejected the tarball. Check the trusted publisher configuration.',
    action: (
      <Button size="sm" variant="secondary">
        Retry
      </Button>
    ),
  },
};

const matrix = (
  <div className="sb-grid">
    {(['info', 'success', 'warning', 'error'] as const).map((tone) => (
      <Alert key={tone} tone={tone} title={`${tone} title`} live="off" onDismiss={() => {}}>
        Body text keeps the default colour so long messages stay readable.
      </Alert>
    ))}
    <Alert tone="success" icon={null} live="off">
      No glyph, no title.
    </Alert>
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
