import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';

const meta = {
  title: 'Components/Text',
  component: Text,
  args: { children: 'Tokens are the product; components are one renderer of them.', size: 'md', weight: 'regular', tone: 'default', family: 'body' },
  argTypes: {
    as: { control: 'select', options: ['p', 'span', 'div', 'strong', 'em', 'small'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    weight: { control: 'select', options: ['regular', 'medium', 'semibold'] },
    tone: { control: 'select', options: ['default', 'muted', 'faint'] },
    family: { control: 'select', options: ['body', 'mono'] },
    ref: { control: false, table: { disable: true } },
  },
  parameters: { docs: { description: { component: 'The type scale as a component. Body copy never carries its own font declarations.' } } },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mono: Story = { args: { family: 'mono', children: 'pnpm build:tokens' } };
export const Truncated: Story = {
  args: { truncate: true, children: 'A very long line of text that will be cut off with an ellipsis rather than wrapping onto a second line.' },
  render: (args) => (
    <div className="sb-narrow">
      <Text {...args} />
    </div>
  ),
};

const matrix = (
  <div className="sb-grid">
    {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
      <Text key={size} size={size}>
        Size {size}: the quick brown fox jumps over the lazy dog.
      </Text>
    ))}
    {(['regular', 'medium', 'semibold'] as const).map((weight) => (
      <Text key={weight} weight={weight}>
        Weight {weight}
      </Text>
    ))}
    {(['default', 'muted', 'faint'] as const).map((tone) => (
      <Text key={tone} tone={tone}>
        Tone {tone}
      </Text>
    ))}
    <Text family="mono">family mono: var(--text-font-family-mono)</Text>
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
