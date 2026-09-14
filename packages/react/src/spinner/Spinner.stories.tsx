import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button';
import { Text } from '../text';
import { Spinner } from './Spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  args: { size: 'md', tone: 'default', label: 'Loading', decorative: false },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'inherit'] },
    tone: { control: 'select', options: ['default', 'inherit'] },
    ref: { control: false, table: { disable: true } },
  },
  parameters: { docs: { description: { component: 'Indeterminate progress. Announces its label unless decorative; Button uses it decoratively with aria-busy.' } } },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const InText: Story = {
  name: 'Inherit inside text and controls',
  render: () => (
    <div className="sb-row">
      <Text>
        Syncing <Spinner size="inherit" tone="inherit" decorative /> your workspace
      </Text>
      <Button loading>Saving</Button>
    </div>
  ),
};

const matrix = (
  <div className="sb-row">
    <Spinner size="sm" />
    <Spinner size="md" />
    <Spinner size="lg" />
    <Button loading>Loading</Button>
    <Button loading variant="secondary">
      Loading
    </Button>
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
