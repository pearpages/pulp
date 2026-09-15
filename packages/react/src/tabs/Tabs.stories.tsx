import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Tabs } from './Tabs';

const sections = (
  <>
    <Tabs.List aria-label="Account">
      <Tabs.Tab value="profile">Profile</Tabs.Tab>
      <Tabs.Tab value="billing">Billing</Tabs.Tab>
      <Tabs.Tab value="team" disabled>
        Team
      </Tabs.Tab>
      <Tabs.Tab value="security">Security</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="profile">Name, avatar and the languages you speak.</Tabs.Panel>
    <Tabs.Panel value="billing">Invoices, payment method and the current plan.</Tabs.Panel>
    <Tabs.Panel value="team">Members and roles.</Tabs.Panel>
    <Tabs.Panel value="security">Sessions, passkeys and two-factor authentication.</Tabs.Panel>
  </>
);

const meta = {
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  args: { defaultValue: 'profile', orientation: 'horizontal', activation: 'automatic', children: sections },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    activation: { control: 'select', options: ['automatic', 'manual'] },
    children: { control: false },
    ref: { control: false, table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'WAI-ARIA tabs: one tab stop, arrows move between tabs and skip disabled ones, Home and End jump to the ends. `automatic` selects on focus; `manual` selects on Enter, Space or click.',
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Profile' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Billing' })).toHaveFocus();
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Invoices');
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Security' })).toHaveFocus();
  },
};

export const Manual: Story = {
  args: { activation: 'manual' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Profile' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Name, avatar');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Invoices');
  },
};

export const Vertical: Story = { args: { orientation: 'vertical' } };

const matrix = (
  <div className="sb-grid">
    <Tabs defaultValue="profile">{sections}</Tabs>
    <Tabs defaultValue="billing" orientation="vertical">
      {sections}
    </Tabs>
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
