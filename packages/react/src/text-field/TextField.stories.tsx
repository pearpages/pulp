import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { TextField } from './TextField';

const meta = {
  title: 'Components/Forms/TextField',
  component: TextField,
  args: {
    label: 'Email address',
    placeholder: 'you@example.com',
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    ref: { control: false, table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A single-line input with its label, description and error wired for assistive technology. The label is always visible: a placeholder is a hint, not a name.',
      },
    },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Email address');
    await userEvent.type(input, 'hello@pearpages.com');
    await expect(input).toHaveValue('hello@pearpages.com');
  },
};

export const WithDescription: Story = {
  args: { description: 'We only use it to send the receipt.' },
};

export const WithError: Story = {
  args: { error: 'Enter a valid email address.', defaultValue: 'pere@' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Email address');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  },
};

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'hello@pearpages.com' } };

export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 'hello@pearpages.com' } };

export const Sizes: Story = {
  render: (args) => (
    <div className="sb-grid">
      <TextField {...args} size="sm" label="Small" />
      <TextField {...args} size="md" label="Medium" />
      <TextField {...args} size="lg" label="Large" />
    </div>
  ),
};

export const SearchBox: Story = {
  args: { label: 'Search places', hideLabel: true, type: 'search', placeholder: 'Tapas, wine, a street…', onClear: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('searchbox', { name: 'Search places' });
    await expect(canvas.queryByRole('button', { name: 'Clear' })).toBeNull();
    await userEvent.type(input, 'tapas');
    // The clear button comes after the input in the tab order, and gives focus back.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Clear' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await userEvent.type(input, 'wine');
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('');
  },
};

const matrix = (
  <div className="sb-grid">
    <TextField label="Default" placeholder="Placeholder" />
    <TextField label="Described" description="Help text under the field." defaultValue="Value" />
    <TextField label="Invalid" error="Something is wrong." defaultValue="Wrong" />
    <TextField label="Required" required />
    <TextField label="Disabled" disabled defaultValue="Disabled" />
    <TextField label="Read only" readOnly defaultValue="Read only" />
    <TextField label="Search" type="search" placeholder="Search places" onClear={() => {}} />
    <TextField label="Search with a value" type="search" defaultValue="tapas" onClear={() => {}} />
    <TextField label="Search, small" size="sm" type="search" defaultValue="tapas" onClear={() => {}} />
  </div>
);

// One matrix story per brand × scheme so axe checks contrast in every combination.
export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  render: () => matrix,
};

export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };

export const MatrixBitepalsLight: Story = {
  ...Matrix,
  name: 'Matrix: bitepals, light',
  globals: { brand: 'bitepals', scheme: 'light' },
};

export const MatrixBitepalsDark: Story = {
  ...Matrix,
  name: 'Matrix: bitepals, dark',
  globals: { brand: 'bitepals', scheme: 'dark' },
};
