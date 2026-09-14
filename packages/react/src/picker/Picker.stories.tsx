import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Picker } from './Picker';

const currencies = [
  { id: 'eur', label: 'Euro', description: 'EUR · €' },
  { id: 'usd', label: 'US dollar', description: 'USD · $' },
  { id: 'gbp', label: 'Pound sterling', description: 'GBP · £' },
  { id: 'jpy', label: 'Japanese yen', description: 'JPY · ¥', disabled: true },
  { id: 'chf', label: 'Swiss franc', description: 'CHF' },
];

const meta = {
  title: 'Components/Picker',
  component: Picker,
  args: { label: 'Currency', items: currencies, size: 'md', onChange: fn() },
  argTypes: { items: { control: false }, value: { control: false }, size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  parameters: {
    a11y: { context: 'body' },
    docs: { description: { component: 'The rich single select on React Aria (decision 001). The native Select stays the default for plain word lists.' } },
  },
} satisfies Meta<typeof Picker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', { name: /Currency/ });
    await userEvent.click(trigger);
    await within(document.body).findByRole('listbox');
    await userEvent.click(within(document.body).getByRole('option', { name: /US dollar/ }));
    await expect(args.onChange).toHaveBeenLastCalledWith('usd');
    await waitFor(() => expect(within(document.body).queryByRole('listbox')).toBeNull());
    await expect(trigger).toHaveTextContent('US dollar');
  },
};

export const WithDescriptionAndError: Story = {
  args: { description: 'Charged monthly', error: 'Pick a currency', required: true },
};

export const Sizes: Story = {
  render: (args) => (
    <div>
      <Picker {...args} size="sm" label="Small" />
      <Picker {...args} size="md" label="Medium" />
      <Picker {...args} size="lg" label="Large" />
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 'eur' } };

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  args: { defaultValue: 'eur', description: 'Charged monthly' },
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Currency/ }));
    await within(document.body).findByRole('listbox');
  },
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
