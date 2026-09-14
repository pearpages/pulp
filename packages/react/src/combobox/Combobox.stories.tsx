import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Combobox } from './Combobox';

const countries = [
  { id: 'es', label: 'Spain', description: 'Europe' },
  { id: 'se', label: 'Sweden', description: 'Europe' },
  { id: 'ch', label: 'Switzerland', description: 'Europe' },
  { id: 'jp', label: 'Japan', description: 'Asia' },
  { id: 'nz', label: 'New Zealand', description: 'Oceania', disabled: true },
  { id: 'ar', label: 'Argentina', description: 'South America' },
];

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  args: { label: 'Country', items: countries, placeholder: 'Type to search…', size: 'md', onChange: fn() },
  argTypes: { items: { control: false }, value: { control: false }, size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  parameters: {
    a11y: { context: 'body' },
    docs: { description: { component: 'A text input that suggests options on React Aria (decision 001). Static lists filter themselves; async lists are yours to fetch.' } },
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const list = () => within(document.body).findByRole('listbox');

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('combobox', { name: 'Country' });
    await userEvent.type(input, 'sw');
    await list();
    await expect(within(document.body).getAllByRole('option')).toHaveLength(2);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith('se');
    await expect(input).toHaveValue('Sweden');
  },
};

export const WithDescriptionAndError: Story = {
  args: { description: 'Where the invoice goes', error: 'Choose a country from the list', required: true },
};

export const Sizes: Story = {
  render: (args) => (
    <div>
      <Combobox {...args} size="sm" label="Small" />
      <Combobox {...args} size="md" label="Medium" />
      <Combobox {...args} size="lg" label="Large" />
    </div>
  ),
};

function AsyncExample(props: React.ComponentProps<typeof Combobox>) {
  const [text, setText] = useState('');
  // The "server" answer, tagged with the query it answers; loading is derived, not stored.
  const [result, setResult] = useState({ query: '', items: [] as typeof countries });
  useEffect(() => {
    if (!text) return;
    const timer = setTimeout(() => {
      setResult({ query: text, items: countries.filter((c) => c.label.toLowerCase().includes(text.toLowerCase())) });
    }, 600);
    return () => clearTimeout(timer);
  }, [text]);
  const loading = text !== '' && result.query !== text;
  return <Combobox {...props} items={loading ? [] : result.items} filter="none" loading={loading} inputValue={text} onInputChange={setText} />;
}

export const Async: Story = {
  render: (args) => <AsyncExample {...args} />,
  args: { description: 'Options load 600 ms after you type' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.type(input, 'a');
    await expect(await within(document.body).findByText('Loading…')).toBeInTheDocument();
    await waitFor(() => expect(within(document.body).getByRole('option', { name: /Spain/ })).toBeInTheDocument(), { timeout: 2000 });
  },
};

export const CustomValue: Story = { args: { allowsCustomValue: true, description: 'Anything you type is accepted' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'jp' } };

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  args: { defaultValue: 'es', description: 'Where the invoice goes' },
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /suggestions/i }));
    await list();
  },
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
