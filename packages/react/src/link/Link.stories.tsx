import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Inline } from '../inline';
import { Text } from '../text';
import { Link } from './Link';

const meta = {
  title: 'Components/Typography/Link',
  component: Link,
  args: { children: 'Read the principles', href: '#principles', tone: 'action', underline: 'always' },
  argTypes: {
    tone: { control: 'select', options: ['action', 'default', 'muted'] },
    underline: { control: 'select', options: ['always', 'hover'] },
    asChild: { control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Read the principles' });
    await userEvent.tab();
    await expect(link).toHaveFocus();
  },
};

export const InText: Story = {
  render: (args) => (
    <Text>
      Every value comes from a token. <Link {...args} /> before adding a component.
    </Text>
  ),
};

export const AsChild: Story = {
  args: { asChild: true, children: <a href="#router">A router's own link</a> },
};

const tones = ['action', 'default', 'muted'] as const;
const matrix = (
  <div className="sb-grid">
    {(['always', 'hover'] as const).map((underline) => (
      <Inline gap={4} key={underline}>
        {tones.map((tone) => (
          <Link key={tone} href={`#${tone}`} tone={tone} underline={underline}>
            {tone}, {underline}
          </Link>
        ))}
      </Inline>
    ))}
    <Text>
      Inside a sentence the <Link href="#sentence">link is underlined</Link>, whatever the brand.
    </Text>
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
