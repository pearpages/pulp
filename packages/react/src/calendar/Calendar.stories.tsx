import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Calendar } from './Calendar';

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  args: { defaultValue: '2026-09-14', onChange: fn() },
  argTypes: { value: { control: false } },
  parameters: {
    docs: { description: { component: 'A month grid on React Aria (decision 001). Dates cross the API as YYYY-MM-DD strings; the locale sets names and the first weekday.' } },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Keyboard only: a pointer press on a day cell makes the vendor listen for window focus
// events, and the Storybook iframe's own focus event (target: Window) is not a Node.
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('button', { name: /September 14, 2026/ }).focus();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith('2026-09-15');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith('2026-09-22');
    await expect(canvas.getByRole('gridcell', { selected: true })).toHaveTextContent('22');
  },
};

export const Bounded: Story = {
  args: { min: '2026-09-07', max: '2026-09-25', isDateUnavailable: (date: string) => date === '2026-09-20' },
};

export const Spanish: Story = { args: { locale: 'es-ES' } };
export const Disabled: Story = { args: { disabled: true } };

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  args: { min: '2026-09-03', isDateUnavailable: (date: string) => date === '2026-09-20' },
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
