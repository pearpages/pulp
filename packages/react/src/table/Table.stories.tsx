import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Badge } from '../badge';
import { Table, type TableSort } from './Table';

const people = [
  { id: 'p1', name: 'Alice Martin', role: 'Engineer', team: 'Platform', age: 34, status: 'active' },
  { id: 'p2', name: 'Bob Chen', role: 'Designer', team: 'Product', age: 29, status: 'away' },
  { id: 'p3', name: 'Carla Ruiz', role: 'Manager', team: 'Platform', age: 41, status: 'active' },
  { id: 'p4', name: 'Dmitri Volkov', role: 'Engineer', team: 'Data', age: 37, status: 'offline' },
  { id: 'p5', name: 'Eva Lindqvist', role: 'Researcher', team: 'Data', age: 45, status: 'active' },
];
type Person = (typeof people)[number];

function Example(props: Partial<React.ComponentProps<typeof Table>> & { rows?: Person[] }) {
  const { rows = people, ...rest } = props;
  return (
    <Table aria-label="People" {...rest}>
      <Table.Header>
        <Table.Column id="name" isRowHeader allowsSorting>
          Name
        </Table.Column>
        <Table.Column id="role" allowsSorting>
          Role
        </Table.Column>
        <Table.Column id="team">Team</Table.Column>
        <Table.Column id="age" align="end" allowsSorting>
          Age
        </Table.Column>
        <Table.Column id="status">Status</Table.Column>
      </Table.Header>
      <Table.Body items={rows} emptyMessage="No people match">
        {(person) => (
          <Table.Row>
            <Table.Cell>{person.name}</Table.Cell>
            <Table.Cell>{person.role}</Table.Cell>
            <Table.Cell>{person.team}</Table.Cell>
            <Table.Cell align="end">{person.age}</Table.Cell>
            <Table.Cell>
              <Badge tone={person.status === 'active' ? 'success' : person.status === 'away' ? 'warning' : 'neutral'} variant="subtle">
                {person.status}
              </Badge>
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );
}

const meta = {
  title: 'Components/Table',
  component: Table,
  args: { 'aria-label': 'People', selectionMode: 'none', density: 'default', children: null, onSelectedChange: fn(), onSortChange: fn(), onRowAction: fn() },
  argTypes: {
    children: { control: false },
    selectionMode: { control: 'inline-radio', options: ['none', 'single', 'multiple'] },
    density: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'A data grid on React Aria (decision 001): sorting, selection and a sticky header, with row density from the spacing scale.' } },
  },
  render: (args) => <Example {...args} />,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('columnheader', { name: 'Name' }));
    await expect(args.onSortChange).toHaveBeenLastCalledWith({ column: 'name', direction: 'ascending' });
    await expect(canvas.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'ascending');
  },
};

function SortedExample(props: React.ComponentProps<typeof Example>) {
  const [sort, setSort] = useState<TableSort>({ column: 'age', direction: 'descending' });
  const rows = useMemo(() => {
    const key = sort.column as keyof Person;
    return [...people].sort((a, b) => {
      const result = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
      return sort.direction === 'ascending' ? result : -result;
    });
  }, [sort]);
  return <Example {...props} rows={rows} sort={sort} onSortChange={setSort} />;
}

export const SortedData: Story = {
  render: (args) => <SortedExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('rowheader')[0]).toHaveTextContent('Eva Lindqvist');
    await userEvent.click(canvas.getByRole('columnheader', { name: 'Age' }));
    await expect(canvas.getAllByRole('rowheader')[0]).toHaveTextContent('Bob Chen');
  },
};

export const MultipleSelection: Story = {
  args: { selectionMode: 'multiple', defaultSelected: ['p2'] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(within(canvas.getByRole('row', { name: 'Carla Ruiz' })).getByRole('checkbox'));
    await expect(args.onSelectedChange).toHaveBeenLastCalledWith(['p2', 'p3']);
  },
};

export const SingleSelection: Story = { args: { selectionMode: 'single', disabledIds: ['p4'] } };
export const Compact: Story = { args: { density: 'compact' } };
export const StickyHeader: Story = {
  args: { stickyHeader: true, className: 'sb-table-sticky' },
  render: (args) => <Example {...args} rows={[...people, ...people.map((p) => ({ ...p, id: `${p.id}b` })), ...people.map((p) => ({ ...p, id: `${p.id}c` }))]} />,
};
export const Empty: Story = { render: (args) => <Example {...args} rows={[]} /> };

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  args: { selectionMode: 'multiple', defaultSelected: ['p2'], defaultSort: { column: 'name', direction: 'ascending' } },
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
