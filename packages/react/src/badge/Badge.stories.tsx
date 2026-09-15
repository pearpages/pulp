import type { Meta, StoryObj } from '@storybook/react-vite';
import { Check, Info, Warning } from '@pearpages/pulp-icons';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Feedback/Badge',
  component: Badge,
  args: { children: 'Beta', tone: 'neutral', variant: 'subtle', size: 'md' },
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'info', 'success', 'warning', 'error'] },
    variant: { control: 'select', options: ['solid', 'subtle'] },
    size: { control: 'select', options: ['sm', 'md'] },
    icon: { control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithIcon: Story = { args: { tone: 'success', icon: <Check />, children: 'Published' } };

const tones = ['neutral', 'info', 'success', 'warning', 'error'] as const;
const icons = { neutral: undefined, info: <Info />, success: <Check />, warning: <Warning />, error: <Warning /> };
const matrix = (
  <div className="sb-grid">
    {(['subtle', 'solid'] as const).map((variant) => (
      <div className="sb-row" key={variant}>
        {tones.map((tone) => (
          <Badge key={tone} tone={tone} variant={variant} icon={icons[tone]}>
            {tone}
          </Badge>
        ))}
        <Badge tone="info" variant={variant} size="sm">
          sm
        </Badge>
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
