import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Close, Plus, Search } from '@pearpages/pulp-icons';
import { IconButton } from './IconButton';

const meta = {
  title: 'Components/Actions/IconButton',
  component: IconButton,
  args: { label: 'Search', icon: <Search />, variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    icon: { control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Search' })).toHaveAttribute('data-icon-only');
  },
};
export const Ghost: Story = { args: { variant: 'ghost', label: 'Close', icon: <Close /> } };

const matrix = (
  <div className="sb-grid">
    {(['primary', 'secondary', 'ghost'] as const).map((variant) => (
      <div className="sb-row" key={variant}>
        <IconButton variant={variant} size="sm" label="Add" icon={<Plus />} />
        <IconButton variant={variant} size="md" label="Search" icon={<Search />} />
        <IconButton variant={variant} size="lg" label="Close" icon={<Close />} />
        <IconButton variant={variant} label="Loading" icon={<Plus />} loading />
        <IconButton variant={variant} label="Disabled" icon={<Plus />} disabled />
        <IconButton variant={variant} tone="danger" label="Delete" icon={<Close />} />
      </div>
    ))}
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
