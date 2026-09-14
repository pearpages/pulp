import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { label: 'Send me the changelog', size: 'md' },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] }, ref: { control: false, table: { disable: true } } },
  parameters: { docs: { description: { component: 'A native checkbox drawn with tokens. Label, description and error come from Field.' } } },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox', { name: 'Send me the changelog' });
    await userEvent.click(box);
    await expect(box).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(box).not.toBeChecked();
  },
};
export const WithDescription: Story = { args: { description: 'About once a month. Unsubscribe any time.' } };
export const Invalid: Story = { args: { label: 'I accept the terms', required: true, error: 'You need to accept the terms to continue.' } };
export const Indeterminate: Story = { args: { label: 'Select all', indeterminate: true } };

const matrix = (
  <div className="sb-grid">
    {(['sm', 'md', 'lg'] as const).map((size) => (
      <div className="sb-row" key={size}>
        <Checkbox size={size} label="Unchecked" />
        <Checkbox size={size} label="Checked" defaultChecked />
        <Checkbox size={size} label="Mixed" indeterminate />
        <Checkbox size={size} label="Invalid" error="Required" />
        <Checkbox size={size} label="Disabled" disabled defaultChecked />
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
