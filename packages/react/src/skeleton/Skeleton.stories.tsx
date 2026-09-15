import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../card';
import { Inline } from '../inline';
import { Stack } from '../stack';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Components/Feedback/Skeleton',
  component: Skeleton,
  args: { shape: 'text', lines: 1, size: 'md' },
  argTypes: {
    shape: { control: 'select', options: ['text', 'rect', 'circle'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    ref: { control: false, table: { disable: true } },
  },
  render: (args) => (
    <div className="sb-wide">
      <Skeleton {...args} />
    </div>
  ),
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Paragraph: Story = { args: { lines: 3 } };

const card = (
  <Card variant="outlined" aria-busy="true" aria-label="Loading profile">
    <Card.Body>
      <Inline gap={3} align="center">
        <Skeleton shape="circle" size="lg" />
        <Stack gap={2} className="sb-wide">
          <Skeleton />
          <Skeleton lines={2} />
        </Stack>
      </Inline>
    </Card.Body>
  </Card>
);

export const LoadingCard: Story = { name: 'Pattern: loading card', render: () => card };

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  render: () => card,
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
