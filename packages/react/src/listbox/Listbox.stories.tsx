import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Listbox } from './Listbox';

const items = [
  { id: 'apple', label: 'Apple', description: 'Crisp and sweet' },
  { id: 'banana', label: 'Banana' },
  { id: 'cherry', label: 'Cherry', disabled: true },
  { id: 'date', label: 'Date', description: 'Dried' },
  { id: 'elderberry', label: 'Elderberry' },
];

const meta = {
  title: 'Components/Listbox',
  component: Listbox,
  args: { 'aria-label': 'Fruit', items, selectionMode: 'single', onChange: fn() },
  argTypes: { items: { control: false }, value: { control: false }, defaultValue: { control: false } },
} satisfies Meta<typeof Listbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('option', { name: 'Banana' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(['banana']);
    await expect(canvas.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith(['date']);
  },
};

export const Multiple: Story = {
  args: { selectionMode: 'multiple', defaultValue: ['apple', 'date'] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('option', { name: 'Banana' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(['apple', 'date', 'banana']);
  },
};

export const Empty: Story = { args: { items: [], emptyMessage: 'No fruit today' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: ['apple'] } };

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  args: { selectionMode: 'multiple', defaultValue: ['apple'] },
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
