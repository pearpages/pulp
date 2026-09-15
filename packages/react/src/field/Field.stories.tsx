import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Field } from './Field';

const meta = {
  title: 'Components/Forms/Field',
  component: Field,
  args: { invalid: false, disabled: false, required: false, children: null },
  argTypes: { children: { control: false }, ref: { control: false, table: { disable: true } } },
  parameters: {
    docs: {
      description: {
        component:
          'The wiring every form control shares. `TextField` is built on it; use it directly to give any control a label, description and error with correct `aria-describedby`.',
      },
    },
  },
  render: (args) => (
    <Field {...args}>
      <Field.Label>Favourite colour</Field.Label>
      <Field.Control>
        <select defaultValue="ultramarine">
          <option value="ultramarine">Ultramarine</option>
          <option value="saffron">Saffron</option>
        </select>
      </Field.Control>
      <Field.Description>A native select, wired by Field.</Field.Description>
      {args.invalid && <Field.Error>Pick one you actually like.</Field.Error>}
    </Field>
  ),
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByLabelText('Favourite colour');
    await expect(select).toHaveAccessibleDescription('A native select, wired by Field.');
  },
};
export const Invalid: Story = { args: { invalid: true, required: true } };
export const Disabled: Story = { args: { disabled: true } };

const matrix = (
  <div className="sb-grid">
    <Field>
      <Field.Label>Default</Field.Label>
      <Field.Control>
        <input defaultValue="value" />
      </Field.Control>
      <Field.Description>Description text.</Field.Description>
    </Field>
    <Field invalid required>
      <Field.Label>Invalid and required</Field.Label>
      <Field.Control>
        <input defaultValue="wrong" />
      </Field.Control>
      <Field.Error>Error text.</Field.Error>
    </Field>
    <Field disabled>
      <Field.Label>Disabled</Field.Label>
      <Field.Control>
        <input defaultValue="off" />
      </Field.Control>
    </Field>
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
