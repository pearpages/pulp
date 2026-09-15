import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button';
import { Inline } from './Inline';

const meta = {
  title: 'Components/Inline',
  component: Inline,
  args: { gap: 3, wrap: true, children: null },
  argTypes: {
    gap: { control: 'select', options: [1, 2, 3, 4, 5, 6, 7, 8] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between'] },
    children: { control: false },
    ref: { control: false, table: { disable: true } },
  },
  render: (args) => (
    <Inline {...args}>
      <Button size="sm">One</Button>
      <Button size="sm" variant="secondary">
        Two
      </Button>
      <Button size="sm" variant="ghost">
        Three
      </Button>
    </Inline>
  ),
} satisfies Meta<typeof Inline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SpaceBetween: Story = { args: { justify: 'between' }, render: (args) => <div className="sb-wide"><Inline {...args}><Button size="sm">Left</Button><Button size="sm" variant="ghost">Right</Button></Inline></div> };
