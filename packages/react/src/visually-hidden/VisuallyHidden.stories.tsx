import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Close } from '@pearpages/pulp-icons';
import { Button } from '../button';
import { VisuallyHidden } from './VisuallyHidden';

const meta = {
  title: 'Components/VisuallyHidden',
  component: VisuallyHidden,
  args: { children: 'Only assistive technology reads this.' },
  argTypes: { ref: { control: false, table: { disable: true } } },
  parameters: {
    docs: { description: { component: 'Present for screen readers, absent from the layout. The usual way to name an icon-only control.' } },
  },
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IconOnlyButton: Story = {
  name: 'Naming an icon-only button',
  render: () => (
    <Button variant="ghost" iconStart={<Close />}>
      <VisuallyHidden>Close</VisuallyHidden>
    </Button>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Close' })).toBeInTheDocument();
  },
};
