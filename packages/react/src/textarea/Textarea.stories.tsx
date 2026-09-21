import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Textarea } from './Textarea';

const meta = {
  title: 'Components/Forms/Textarea',
  component: Textarea,
  args: { label: 'Message', placeholder: 'What would you like to tell us?', size: 'md', resize: 'vertical', rows: 3 },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    resize: { control: 'select', options: ['vertical', 'none', 'both'] },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const area = within(canvasElement).getByLabelText('Message');
    await userEvent.type(area, 'Hello');
    await expect(area).toHaveValue('Hello');
  },
};
export const AutoGrow: Story = { args: { autoGrow: true, rows: 2, description: 'Grows with the text.' } };
/** The label is still there for assistive technology: a reply box under a thread needs no visible "Message". */
export const HiddenLabel: Story = {
  args: { hideLabel: true, placeholder: 'Write a reply…' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox', { name: 'Message' })).toBeVisible();
  },
};

export const Invalid: Story = { args: { error: 'Say a little more.', defaultValue: 'Hi' } };

const matrix = (
  <div className="sb-grid">
    <Textarea label="Default" placeholder="Placeholder" />
    <Textarea label="Invalid" error="Say a little more." defaultValue="Hi" size="sm" />
    <Textarea label="Read only" readOnly defaultValue="Fixed text" />
    <Textarea label="Disabled" disabled defaultValue="Off" size="lg" />
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
