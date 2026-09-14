import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button';
import { Card } from '../card';
import { Text } from '../text';
import { Stack } from './Stack';

const meta = {
  title: 'Components/Stack',
  component: Stack,
  args: { gap: 3, children: null },
  argTypes: {
    gap: { control: 'select', options: [1, 2, 3, 4, 5, 6, 7, 8] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between'] },
    children: { control: false },
    ref: { control: false, table: { disable: true } },
  },
  parameters: { docs: { description: { component: 'A flex column whose gap is a step on the spacing scale.' } } },
  render: (args) => (
    <Stack {...args}>
      <Text>First</Text>
      <Text>Second</Text>
      <Button size="sm">Third</Button>
    </Stack>
  ),
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Gaps: Story = {
  render: () => (
    <div className="sb-row">
      {([1, 3, 5, 8] as const).map((gap) => (
        <Card key={gap} variant="outlined" padding="sm">
          <Card.Body>
            <Stack gap={gap}>
              <Text size="sm">gap {gap}</Text>
              <Text size="sm">item</Text>
              <Text size="sm">item</Text>
            </Stack>
          </Card.Body>
        </Card>
      ))}
    </div>
  ),
};
