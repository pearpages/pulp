import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { Inline } from '../inline';
import { Text } from '../text';
import { Avatar } from './Avatar';

// A picture that needs no network: two tones, so the circular crop is visible.
const portrait = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#c9d3e6"/><circle cx="48" cy="38" r="18" fill="#5b6475"/><path d="M12 96c4-24 20-34 36-34s32 10 36 34z" fill="#5b6475"/></svg>',
)}`;

const meta = {
  title: 'Components/Utilities/Avatar',
  component: Avatar,
  args: { name: 'Ana Ruiz', size: 'md' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    children: { control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};
export const Image: Story = { args: { src: portrait } };

export const BrokenImage: Story = {
  args: { src: 'data:image/png;base64,AAAA' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The image fails in the browser, and the initials take its place under the same name.
    await waitFor(() => expect(canvas.getByRole('img', { name: 'Ana Ruiz' })).toHaveTextContent('AR'));
    await expect(canvasElement.querySelector('img')).toBeNull();
  },
};

export const BesideTheName: Story = {
  render: (args) => (
    <Inline gap={2} align="center">
      <Avatar {...args} alt="" src={portrait} />
      <Text>Ana Ruiz</Text>
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    // Decorative: the name is said once, by the text.
    await expect(within(canvasElement).queryByRole('img', { name: 'Ana Ruiz' })).toBeNull();
  },
};

const sizes = ['sm', 'md', 'lg', 'xl'] as const;
const matrix = (
  <div className="sb-grid">
    <Inline gap={3} align="center">
      {sizes.map((size) => (
        <Avatar key={size} size={size} name="Ana Ruiz" />
      ))}
    </Inline>
    <Inline gap={3} align="center">
      {sizes.map((size) => (
        <Avatar key={size} size={size} name="Ana Ruiz" src={portrait} />
      ))}
    </Inline>
    <Inline gap={3} align="center">
      <Avatar name="Élodie" />
      <Avatar name="Wei Chen" />
      <Avatar />
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
