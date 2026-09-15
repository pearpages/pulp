import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Select } from './Select';

const options = (
  <>
    <option value="pulp">pulp</option>
    <option value="bitepals">bitepals</option>
    <optgroup label="Coming">
      <option value="third">a third brand</option>
    </optgroup>
  </>
);

const meta = {
  title: 'Components/Forms/Select',
  component: Select,
  args: { label: 'Brand', placeholder: 'Choose a brand', size: 'md', children: options },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] }, children: { control: false }, ref: { control: false, table: { disable: true } } },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole('combobox', { name: 'Brand' });
    await userEvent.selectOptions(select, 'bitepals');
    await expect(select).toHaveValue('bitepals');
  },
};
export const Invalid: Story = { args: { required: true, error: 'Choose a brand to continue.' } };

const matrix = (
  <div className="sb-grid">
    <Select label="Placeholder" placeholder="Choose a brand">
      {options}
    </Select>
    <Select label="Selected" defaultValue="pulp" description="The default brand." size="sm">
      {options}
    </Select>
    <Select label="Invalid" error="Choose a brand." placeholder="Choose a brand" required>
      {options}
    </Select>
    <Select label="Disabled" disabled defaultValue="bitepals" size="lg">
      {options}
    </Select>
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
