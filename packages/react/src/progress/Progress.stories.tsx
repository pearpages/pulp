import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from './Progress';

const meta = {
  title: 'Components/Feedback/Progress',
  component: Progress,
  args: { label: 'Uploading', value: 42, tone: 'primary', size: 'md' },
  argTypes: {
    tone: { control: 'select', options: ['primary', 'success', 'warning', 'error'] },
    size: { control: 'select', options: ['sm', 'md'] },
    value: { control: { type: 'range', min: 0, max: 100 } },
    ref: { control: false, table: { disable: true } },
  },
  render: (args) => (
    <div className="sb-wide">
      <Progress {...args} />
    </div>
  ),
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Indeterminate: Story = { args: { value: undefined, label: 'Publishing' } };
export const Files: Story = { args: { value: 3, max: 10, valueText: '3 of 10 files', label: 'Copying' } };

const matrix = (
  <div className="sb-grid sb-wide">
    <Progress label="Primary" value={60} />
    <Progress label="Success, small" value={100} tone="success" size="sm" />
    <Progress label="Warning" value={75} tone="warning" />
    <Progress label="Error" value={20} tone="error" />
    <Progress label="Indeterminate" />
    <Progress label="Hidden label" value={50} hideLabel />
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
