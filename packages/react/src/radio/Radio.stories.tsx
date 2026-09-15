import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Radio, RadioGroup } from './Radio';

const options = (
  <>
    <Radio value="free" label="Free" />
    <Radio value="team" label="Team" />
    <Radio value="enterprise" label="Enterprise" disabled />
  </>
);

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: { label: 'Plan', defaultValue: 'free', orientation: 'vertical', size: 'md', children: options },
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    children: { control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Free' }));
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Team' })).toBeChecked();
    await userEvent.keyboard('{ArrowDown}');
    // Disabled radios are skipped by the browser; selection wraps to Free.
    await expect(canvas.getByRole('radio', { name: 'Free' })).toBeChecked();
  },
};
export const Horizontal: Story = { args: { orientation: 'horizontal' } };
export const Invalid: Story = { args: { defaultValue: undefined, required: true, error: 'Choose a plan to continue.' } };

const matrix = (
  <div className="sb-grid">
    <RadioGroup label="Default" defaultValue="team" description="Billed yearly.">
      {options}
    </RadioGroup>
    <RadioGroup label="Invalid" required error="Choose a plan." size="sm" orientation="horizontal">
      {options}
    </RadioGroup>
    <RadioGroup label="Disabled" defaultValue="free" disabled size="lg">
      {options}
    </RadioGroup>
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
