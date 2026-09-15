import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button } from '../button';
import { Heading } from '../heading';
import { Text } from '../text';
import { Card } from './Card';

const meta = {
  title: 'Components/Layout/Card',
  component: Card,
  args: {
    variant: 'raised',
    padding: 'md',
    interactive: false,
    children: null,
  },
  argTypes: {
    variant: { control: 'select', options: ['raised', 'outlined', 'sunken'] },
    padding: { control: 'select', options: ['sm', 'md', 'lg'] },
    children: { control: false },
    ref: { control: false, table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A surface for related content. Slots carry padding and dividers; the root is the surface. Use `asChild` with a link for a whole-card target.',
      },
    },
  },
  render: (args) => (
    <Card {...args} aria-label="Plan">
      <Card.Header>
        <Heading level={3} size="md">
          Team plan
        </Heading>
      </Card.Header>
      <Card.Body>
        <Text>Unlimited projects, priority support, and a shared token library for every brand.</Text>
      </Card.Body>
      <Card.Footer>
        <Button size="sm">Choose</Button>
        <Button size="sm" variant="ghost">
          Compare
        </Button>
      </Card.Footer>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Raised: Story = {};
export const Outlined: Story = { args: { variant: 'outlined' } };
export const Sunken: Story = { args: { variant: 'sunken' } };

export const Padding: Story = {
  render: () => (
    <div className="sb-row">
      {(['sm', 'md', 'lg'] as const).map((padding) => (
        <Card key={padding} padding={padding} variant="outlined">
          <Card.Body>padding {padding}</Card.Body>
        </Card>
      ))}
    </div>
  ),
};

export const LinkCard: Story = {
  name: 'Link card (asChild)',
  render: () => (
    <Card asChild interactive>
      <a href="#docs">
        <Card.Body>Read the tokens guide</Card.Body>
      </a>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Read the tokens guide' });
    await expect(link).toHaveAttribute('data-variant', 'raised');
    await expect(link).toHaveAttribute('data-interactive');
  },
};

const matrix = (
  <div className="sb-grid">
    {(['raised', 'outlined', 'sunken'] as const).map((variant) => (
      <Card key={variant} variant={variant} aria-label={variant}>
        <Card.Header>
          <Heading level={3} size="md">
            {variant}
          </Heading>
        </Card.Header>
        <Card.Body>
          <Text>Body text on the card surface.</Text>
        </Card.Body>
        <Card.Footer>
          <Button size="sm" variant="secondary">
            Action
          </Button>
        </Card.Footer>
      </Card>
    ))}
    <Card asChild interactive>
      <a href="#x">
        <Card.Body>Interactive link card</Card.Body>
      </a>
    </Card>
  </div>
);

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  render: () => matrix,
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
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
