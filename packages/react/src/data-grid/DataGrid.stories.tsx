import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Badge } from '../badge';
import { DataGrid, type DataGridSort } from './DataGrid';

const people = [
  { id: 'p1', name: 'Alice Martin', role: 'Engineer', team: 'Platform', age: 34, status: 'active' },
  { id: 'p2', name: 'Bob Chen', role: 'Designer', team: 'Product', age: 29, status: 'away' },
  { id: 'p3', name: 'Carla Ruiz', role: 'Manager', team: 'Platform', age: 41, status: 'active' },
  { id: 'p4', name: 'Dmitri Volkov', role: 'Engineer', team: 'Data', age: 37, status: 'offline' },
  { id: 'p5', name: 'Eva Lindqvist', role: 'Researcher', team: 'Data', age: 45, status: 'active' },
];
type Person = (typeof people)[number];

function Example(props: Partial<React.ComponentProps<typeof DataGrid>> & { rows?: Person[] }) {
  const { rows = people, ...rest } = props;
  return (
    <DataGrid aria-label="People" {...rest}>
      <DataGrid.Header>
        <DataGrid.Column id="name" isRowHeader allowsSorting>
          Name
        </DataGrid.Column>
        <DataGrid.Column id="role" allowsSorting>
          Role
        </DataGrid.Column>
        <DataGrid.Column id="team">Team</DataGrid.Column>
        <DataGrid.Column id="age" align="end" allowsSorting>
          Age
        </DataGrid.Column>
        <DataGrid.Column id="status">Status</DataGrid.Column>
      </DataGrid.Header>
      <DataGrid.Body items={rows} emptyMessage="No people match">
        {(person) => (
          <DataGrid.Row>
            <DataGrid.Cell>{person.name}</DataGrid.Cell>
            <DataGrid.Cell>{person.role}</DataGrid.Cell>
            <DataGrid.Cell>{person.team}</DataGrid.Cell>
            <DataGrid.Cell align="end">{person.age}</DataGrid.Cell>
            <DataGrid.Cell>
              <Badge tone={person.status === 'active' ? 'success' : person.status === 'away' ? 'warning' : 'neutral'} variant="subtle">
                {person.status}
              </Badge>
            </DataGrid.Cell>
          </DataGrid.Row>
        )}
      </DataGrid.Body>
    </DataGrid>
  );
}

const meta = {
  title: 'Components/Data/DataGrid',
  component: DataGrid,
  args: { 'aria-label': 'People', selectionMode: 'none', density: 'default', children: null, onSelectedChange: fn(), onSortChange: fn(), onRowAction: fn() },
  argTypes: {
    children: { control: false },
    selectionMode: { control: 'inline-radio', options: ['none', 'single', 'multiple'] },
    density: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  parameters: {
    layout: 'padded',
  },
  render: (args) => <Example {...args} />,
} satisfies Meta<typeof DataGrid>;

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
  const [sort, setSort] = useState<DataGridSort>({ column: 'age', direction: 'descending' });
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
