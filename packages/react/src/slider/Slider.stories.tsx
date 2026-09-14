import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Slider } from './Slider';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  args: { label: 'Volume', defaultValue: 40, onChange: fn(), onChangeEnd: fn() },
  argTypes: { value: { control: false }, defaultValue: { control: false } },
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'A number or a range on a track, on React Aria (decision 001). The output shows what assistive technology hears.' } },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const slider = within(canvasElement).getByRole('slider', { name: 'Volume' });
    slider.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect(args.onChange).toHaveBeenLastCalledWith(42);
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('42');
  },
};

export const Percent: Story = {
  args: { label: 'Opacity', defaultValue: 0.65, min: 0, max: 1, step: 0.05, formatOptions: { style: 'percent' } },
};

export const Range: Story = {
  args: { label: 'Price', defaultValue: [200, 800], min: 0, max: 1000, step: 10, formatOptions: { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 } },
  play: async ({ canvasElement, args }) => {
    within(canvasElement).getByRole('slider', { name: /Minimum/ }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.onChange).toHaveBeenLastCalledWith([210, 800]);
  },
};

export const Vertical: Story = { args: { orientation: 'vertical', label: 'Level' } };
export const HiddenLabel: Story = { args: { hideLabel: true, description: 'The label is read out but not shown' } };
export const Disabled: Story = { args: { disabled: true } };

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  render: (args) => (
    <div>
      <Slider {...args} />
      <Slider {...args} label="Price" defaultValue={[20, 80]} description="Two thumbs" />
    </div>
  ),
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
