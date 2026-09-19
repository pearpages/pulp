import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search, Warning } from '@pearpages/pulp-icons';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '../button';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Components/Feedback/EmptyState',
  component: EmptyState,
  args: {
    title: 'No places match',
    description: 'Try a wider area or fewer filters.',
    icon: <Search />,
    tone: 'neutral',
    headingLevel: 3,
  },
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'error'] },
    headingLevel: { control: 'select', options: [1, 2, 3, 4, 5, 6] },
    icon: { control: false },
    action: { control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAction: Story = { args: { action: <Button variant="secondary">Clear filters</Button> } };
export const TitleOnly: Story = { args: { description: undefined, icon: undefined } };

const onRetry = fn();
export const ErrorWithRetry: Story = {
  args: {
    tone: 'error',
    icon: <Warning />,
    title: 'Could not load your feed',
    description: 'Check your connection and try again.',
    action: <Button onClick={onRetry}>Try again</Button>,
    // It replaces the feed after a failed reload, so it is announced.
    role: 'alert',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('Could not load your feed');
    await expect(canvas.getByRole('heading', { level: 3, name: 'Could not load your feed' })).toBeInTheDocument();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Try again' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onRetry).toHaveBeenCalledOnce();
  },
};

const matrix = (
  <div className="sb-grid">
    <EmptyState title="No places match" description="Try a wider area or fewer filters." icon={<Search />} action={<Button variant="secondary">Clear filters</Button>} />
    <EmptyState tone="error" title="Could not load your feed" description="Check your connection and try again." icon={<Warning />} action={<Button>Try again</Button>} />
    <EmptyState title="Nothing here yet" />
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
