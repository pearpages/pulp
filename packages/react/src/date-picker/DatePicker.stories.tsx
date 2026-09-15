import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { DatePicker } from './DatePicker';

const meta = {
  title: 'Components/Forms/DatePicker',
  component: DatePicker,
  args: { label: 'Start date', defaultValue: '2026-09-14', locale: 'en-GB', size: 'md', onChange: fn() },
  argTypes: { value: { control: false }, size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  parameters: {
    a11y: { context: 'body' },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const openCalendar = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: /calendar/i }));
  await within(document.body).findByRole('dialog');
};

// Keyboard only inside the calendar (see Calendar.stories.tsx for why).
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    await openCalendar(canvasElement);
    await waitFor(() => expect(within(document.body).getByRole('button', { name: /14 September 2026/ })).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith('2026-09-15');
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
  },
};

export const WithDescriptionAndError: Story = {
  args: { description: 'The first day of the booking', error: 'Start must be before the end date', required: true },
};

export const Bounded: Story = { args: { min: '2026-09-01', max: '2026-09-30', description: 'September only' } };
export const UnitedStates: Story = { args: { locale: 'en-US', description: 'Month first' } };
export const Disabled: Story = { args: { disabled: true } };

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  args: { description: 'The first day of the booking' },
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  play: async ({ canvasElement }) => openCalendar(canvasElement),
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
