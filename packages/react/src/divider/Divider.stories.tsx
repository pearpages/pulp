import type { Meta, StoryObj } from '@storybook/react-vite';
import { Inline } from '../inline';
import { Stack } from '../stack';
import { Text } from '../text';
import { Divider } from './Divider';

const meta = {
  title: 'Components/Layout/Divider',
  component: Divider,
  args: { orientation: 'horizontal', spacing: 'md', decorative: true },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    spacing: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    ref: { control: false, table: { disable: true } },
  },
  render: (args) =>
    args.orientation === 'vertical' ? (
      <Inline gap={1}>
        <Text>Saved</Text>
        <Divider {...args} />
        <Text>Liked</Text>
      </Inline>
    ) : (
      <Stack gap={1}>
        <Text>Saved places</Text>
        <Divider {...args} />
        <Text>Liked places</Text>
      </Stack>
    ),
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Vertical: Story = { args: { orientation: 'vertical' } };
export const Separator: Story = { args: { decorative: false } };

const spacings = ['none', 'sm', 'md', 'lg'] as const;
const matrix = (
  <div className="sb-grid">
    <Stack gap={1}>
      {spacings.map((spacing) => (
        <Stack gap={1} key={spacing}>
          <Text size="sm">{spacing}</Text>
          <Divider spacing={spacing} />
        </Stack>
      ))}
      <Text size="sm">end</Text>
    </Stack>
    <Inline gap={1}>
      {spacings.map((spacing) => (
        <Inline gap={1} key={spacing}>
          <Text size="sm">{spacing}</Text>
          <Divider orientation="vertical" spacing={spacing} />
        </Inline>
      ))}
      <Text size="sm">end</Text>
    </Inline>
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
