import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Switch } from './Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: { label: 'Dark scheme', size: 'md' },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] }, ref: { control: false, table: { disable: true } } },
  parameters: { docs: { description: { component: 'A native checkbox with `role="switch"` for settings that take effect immediately.' } } },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('switch', { name: 'Dark scheme' });
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
  },
};
export const WithDescription: Story = { args: { description: 'Follows the system when off.', defaultChecked: true } };

const matrix = (
  <div className="sb-grid">
    {(['sm', 'md', 'lg'] as const).map((size) => (
      <div className="sb-row" key={size}>
        <Switch size={size} label="Off" />
        <Switch size={size} label="On" defaultChecked />
        <Switch size={size} label="Invalid" error="Unavailable" />
        <Switch size={size} label="Disabled" disabled defaultChecked />
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
