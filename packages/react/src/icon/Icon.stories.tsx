import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentType } from 'react';
import * as icons from '@pearpages/pulp-icons';
import type { IconProps as GlyphProps } from '@pearpages/pulp-icons';
import { Text } from '../text';
import { Icon } from './Icon';

const glyphs = Object.entries(icons).filter(([name]) => /^[A-Z]/.test(name)) as Array<[string, ComponentType<GlyphProps>]>;

const meta = {
  title: 'Components/Utilities/Icon',
  component: Icon,
  args: { size: 'md', children: <icons.ArrowRight /> },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    children: { control: false },
    ref: { control: false, table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Sizes any SVG to the icon scale and settles its accessibility. Decorative by default; `label` makes it a named image. The glyphs come from `@pearpages/pulp-icons`.',
      },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Decorative: Story = {};
export const Named: Story = { args: { label: 'Continue' } };

export const Gallery: Story = {
  name: 'Gallery (@pearpages/pulp-icons)',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-row">
      {glyphs.map(([name, Glyph]) => (
        <div className="sb-tile" key={name}>
          <Icon size="lg">
            <Glyph />
          </Icon>
          <Text as="span" size="xs" tone="muted" family="mono">
            {name}
          </Text>
        </div>
      ))}
    </div>
  ),
};

const matrix = (
  <div className="sb-grid">
    {(['sm', 'md', 'lg'] as const).map((size) => (
      <div className="sb-row" key={size}>
        {glyphs.map(([name, Glyph]) => (
          <Icon key={name} size={size}>
            <Glyph />
          </Icon>
        ))}
        <Text as="span" size="sm" tone="muted">
          size {size}
        </Text>
      </div>
    ))}
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
