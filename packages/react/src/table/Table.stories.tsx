import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Badge } from '../badge';
import { Table } from './Table';

const people = [
  { id: 'p1', name: 'Alice Martin', role: 'Engineer', team: 'Platform', age: 34, status: 'active' },
  { id: 'p2', name: 'Noah Chen', role: 'Designer', team: 'Product', age: 29, status: 'away' },
  { id: 'p3', name: 'Carla Ruiz', role: 'Manager', team: 'Platform', age: 41, status: 'active' },
  { id: 'p4', name: 'Dmitri Volkov', role: 'Engineer', team: 'Data', age: 37, status: 'offline' },
  { id: 'p5', name: 'Eva Lindqvist', role: 'Researcher', team: 'Data', age: 45, status: 'active' },
] as const;

const tone = { active: 'success', away: 'warning', offline: 'neutral' } as const;

function Example({ data = people, ...props }: { data?: readonly (typeof people)[number][] } & Partial<Parameters<typeof Table>[0]>) {
  return (
    <Table caption="People on the team" {...props}>
      <Table.Header>
        <Table.Row>
          <Table.Column>Name</Table.Column>
          <Table.Column>Role</Table.Column>
          <Table.Column>Team</Table.Column>
          <Table.Column align="end">Age</Table.Column>
          <Table.Column>Status</Table.Column>
        </Table.Row>
      </Table.Header>
      <Table.Body emptyMessage="No people match" columnCount={5}>
        {data.map((person) => (
          <Table.Row key={person.id}>
            <Table.Cell rowHeader>{person.name}</Table.Cell>
            <Table.Cell>{person.role}</Table.Cell>
            <Table.Cell>{person.team}</Table.Cell>
            <Table.Cell align="end">{person.age}</Table.Cell>
            <Table.Cell>
              <Badge tone={tone[person.status]}>{person.status}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

const meta = {
  title: 'Components/Data/Table',
  component: Table,
  // The render builds the rows; children is in args only because the prop is required.
  args: { caption: 'People on the team', captionHidden: false, density: 'default', children: null },
  argTypes: {
    density: { control: 'inline-radio', options: ['default', 'compact'] },
    children: { control: false },
    ref: { control: false, table: { disable: true } },
  },
  parameters: { layout: 'padded' },
  render: (args) => <Example {...args} />,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const table = within(canvasElement).getByRole('table', { name: 'People on the team' });
    // A real table: the caption names it and each row is identified by its own header cell.
    await expect(within(table).getByRole('rowheader', { name: 'Carla Ruiz' })).toBeVisible();
    await expect(within(table).getAllByRole('columnheader')).toHaveLength(5);
  },
};

export const Compact: Story = { args: { density: 'compact' } };

/** The name is still there for assistive technology when a heading above already says it. */
export const HiddenCaption: Story = {
  args: { captionHidden: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('table', { name: 'People on the team' })).toBeVisible();
  },
};

export const Empty: Story = {
  render: (args) => <Example {...args} data={[]} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No people match')).toBeVisible();
  },
};

const matrix = (
  <div className="sb-grid">
    <Example />
    <Example density="compact" data={people.slice(0, 2)} />
    <Example data={[]} />
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
