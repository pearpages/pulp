import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './Button';

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Save changes',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    iconStart: { control: false },
    iconEnd: { control: false },
    ref: { control: false, table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The one action component. Variants map to emphasis, not colour: one `primary` per view, `secondary` for the rest, `ghost` inside other content. Every value comes from `--button-*` tokens, so a brand restyles it without touching the component.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Save changes' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Ghost: Story = { args: { variant: 'ghost' } };

export const Sizes: Story = {
  render: (args) => (
    <div className="sb-row">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  args: { iconStart: <ArrowIcon />, iconEnd: <ArrowIcon />, children: 'Continue' },
};

export const Loading: Story = {
  args: { loading: true, children: 'Saving' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Saving' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const AsLink: Story = {
  name: 'As a link (asChild)',
  args: { asChild: true, variant: 'secondary', iconEnd: <ArrowIcon /> },
  render: (args) => (
    <Button {...args}>
      <a href="#docs">Read the docs</a>
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Read the docs' });
    await expect(link).toHaveAttribute('data-variant', 'secondary');
  },
};

const matrix = (
  <div className="sb-grid">
    {(['primary', 'secondary', 'ghost'] as const).map((variant) => (
      <div className="sb-row" key={variant}>
        <Button variant={variant}>{variant}</Button>
        <Button variant={variant} iconStart={<ArrowIcon />}>
          icon
        </Button>
        <Button variant={variant} loading>
          loading
        </Button>
        <Button variant={variant} disabled>
          disabled
        </Button>
      </div>
    ))}
  </div>
);

// One matrix story per brand × scheme. Each runs as a test with axe, so
// contrast is checked in every combination, not only the toolbar default.
export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  render: () => matrix,
};

export const MatrixPulpDark: Story = {
  ...Matrix,
  name: 'Matrix: pulp, dark',
  globals: { brand: 'pulp', scheme: 'dark' },
};

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
