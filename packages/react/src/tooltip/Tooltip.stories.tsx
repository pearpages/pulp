import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Info } from '@pearpages/pulp-icons';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { Tooltip } from './Tooltip';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: { content: 'Saves to the cloud and keeps a version.', placement: 'top', delay: 300, children: <Button variant="secondary">Save</Button> },
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end'] },
    children: { control: false },
  },
  parameters: {
    a11y: { context: 'body' },
    docs: { description: { component: 'Extra detail on hover or focus, linked with aria-describedby while visible. Never the only name of a control.' } },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const button = within(canvasElement).getByRole('button', { name: 'Save' });
    await expect(button).toHaveFocus();
    await waitFor(() => expect(within(document.body).getByRole('tooltip')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('tooltip')).toBeNull());
  },
};

export const OnIconButton: Story = {
  name: 'Supplementing an icon button',
  args: { content: 'Opens the token documentation', children: <IconButton variant="ghost" label="Help" icon={<Info />} /> },
};

const matrix = (
  <div className="sb-row">
    <Tooltip content="Top" placement="top" delay={0}>
      <Button variant="secondary">Top</Button>
    </Tooltip>
    <Tooltip content="Bottom" placement="bottom" delay={0}>
      <Button variant="secondary">Bottom</Button>
    </Tooltip>
    <Tooltip content="A longer tooltip that wraps onto two lines to show the maximum width." placement="right" delay={0}>
      <Button variant="secondary">Long</Button>
    </Tooltip>
  </div>
);

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  render: () => matrix,
  play: async () => {
    await userEvent.tab();
    await waitFor(() => expect(within(document.body).getByRole('tooltip')).toBeVisible());
  },
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
