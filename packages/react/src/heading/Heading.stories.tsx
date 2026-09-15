import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './Heading';

const meta = {
  title: 'Components/Typography/Heading',
  component: Heading,
  args: { level: 2, children: 'Two axes, never mixed' },
  argTypes: {
    level: { control: 'select', options: [1, 2, 3, 4, 5, 6] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', '2xl'] },
    tone: { control: 'select', options: ['default', 'muted'] },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SizeDecoupled: Story = { name: 'Level 2, size sm', args: { level: 2, size: 'sm' } };

const matrix = (
  <div className="sb-grid">
    {([1, 2, 3, 4, 5, 6] as const).map((level) => (
      <Heading key={level} level={level}>
        Heading level {level}
      </Heading>
    ))}
    <Heading level={3} tone="muted">
      Muted tone
    </Heading>
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
