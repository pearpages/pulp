import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Text } from '../text';
import { Accordion } from './Accordion';

const items = (
  <>
    <Accordion.Item value="tokens">
      <Accordion.Trigger>Tokens are the product</Accordion.Trigger>
      <Accordion.Panel>
        <Text size="sm">Colour, type, radius, spacing and motion live as DTCG JSON; CSS and components are renderers.</Text>
      </Accordion.Panel>
    </Accordion.Item>
    <Accordion.Item value="axes">
      <Accordion.Trigger>Two axes, never mixed</Accordion.Trigger>
      <Accordion.Panel>
        <Text size="sm">A brand decides palette and shape; a scheme decides light or dark.</Text>
      </Accordion.Panel>
    </Accordion.Item>
    <Accordion.Item value="later" disabled>
      <Accordion.Trigger>Coming later</Accordion.Trigger>
      <Accordion.Panel>Not yet.</Accordion.Panel>
    </Accordion.Item>
  </>
);

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  args: { type: 'single', defaultValue: 'tokens', collapsible: true, headingLevel: 3, children: items },
  argTypes: {
    type: { control: 'select', options: ['single', 'multiple'] },
    headingLevel: { control: 'select', options: [2, 3, 4, 5, 6] },
    children: { control: false },
    ref: { control: false, table: { disable: true } },
  },
  render: (args) => (
    <div className="sb-wide">
      <Accordion {...args} />
    </div>
  ),
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Two axes, never mixed' }));
    await expect(canvas.getByRole('region', { name: 'Two axes, never mixed' })).toBeVisible();
    await expect(canvas.queryByRole('region', { name: 'Tokens are the product' })).toBeNull();
    await userEvent.keyboard('{ArrowUp}');
    await expect(canvas.getByRole('button', { name: 'Tokens are the product' })).toHaveFocus();
  },
};
export const Multiple: Story = { args: { type: 'multiple', defaultValue: ['tokens', 'axes'] } };

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  args: { type: 'multiple', defaultValue: ['tokens'] },
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
