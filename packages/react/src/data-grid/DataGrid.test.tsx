import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { DataGrid, type DataGridSort } from './DataGrid';

const rows = [
  { id: 'r1', name: 'Alice', role: 'Engineer', age: 34 },
  { id: 'r2', name: 'Bob', role: 'Designer', age: 29 },
  { id: 'r3', name: 'Chen', role: 'Manager', age: 41 },
];

function Example(props: Partial<React.ComponentProps<typeof DataGrid>>) {
  return (
    <DataGrid aria-label="People" {...props}>
      <DataGrid.Header>
        <DataGrid.Column id="name" isRowHeader allowsSorting>
          Name
        </DataGrid.Column>
        <DataGrid.Column id="role">Role</DataGrid.Column>
        <DataGrid.Column id="age" align="end" allowsSorting>
          Age
        </DataGrid.Column>
      </DataGrid.Header>
      <DataGrid.Body items={rows}>
        {(row) => (
          <DataGrid.Row>
            <DataGrid.Cell>{row.name}</DataGrid.Cell>
            <DataGrid.Cell>{row.role}</DataGrid.Cell>
            <DataGrid.Cell align="end">{row.age}</DataGrid.Cell>
          </DataGrid.Row>
        )}
      </DataGrid.Body>
    </DataGrid>
  );
}

describe('DataGrid', () => {
  it('is a grid with column headers, row headers, and density on the DOM', () => {
    render(<Example density="compact" />);
    const table = screen.getByRole('grid', { name: 'People' });
    expect(table).toHaveAttribute('data-density', 'compact');
    expect(screen.getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Name', 'Role', 'Age']);
    expect(screen.getAllByRole('rowheader').map((c) => c.textContent)).toEqual(['Alice', 'Bob', 'Chen']);
    expect(screen.getByRole('columnheader', { name: 'Age' })).toHaveAttribute('data-align', 'end');
  });

  it('sorting: pressing a sortable header reports the sort and sets aria-sort; uncontrolled toggles direction', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<Example onSortChange={onSortChange} />);
    const name = screen.getByRole('columnheader', { name: 'Name' });
    expect(name).toHaveAttribute('aria-sort', 'none');
    expect(screen.getByRole('columnheader', { name: 'Role' })).not.toHaveAttribute('aria-sort');
    await user.click(name);
    expect(onSortChange).toHaveBeenLastCalledWith({ column: 'name', direction: 'ascending' });
    expect(name).toHaveAttribute('aria-sort', 'ascending');
    expect(name).toHaveAttribute('data-sort-direction', 'ascending');
    await user.click(name);
    expect(onSortChange).toHaveBeenLastCalledWith({ column: 'name', direction: 'descending' });
    expect(name).toHaveAttribute('aria-sort', 'descending');
  });

  it('sorting is controlled by `sort`', () => {
    const sort: DataGridSort = { column: 'age', direction: 'descending' };
    render(<Example sort={sort} />);
    expect(screen.getByRole('columnheader', { name: 'Age' })).toHaveAttribute('aria-sort', 'descending');
  });

  it('multiple selection: a checkbox column appears, rows toggle, select all resolves to ids', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(<Example selectionMode="multiple" defaultSelected={['r1']} onSelectedChange={onSelectedChange} />);
    expect(screen.getByRole('grid')).toHaveAttribute('aria-multiselectable', 'true');
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);
    expect(checkboxes[0]).toHaveAccessibleName('Select All');
    expect(screen.getByRole('row', { name: 'Alice' })).toHaveAttribute('aria-selected', 'true');
    await user.click(within(screen.getByRole('row', { name: 'Bob' })).getByRole('checkbox'));
    expect(onSelectedChange).toHaveBeenLastCalledWith(['r1', 'r2']);
    await user.click(checkboxes[0]!);
    expect(onSelectedChange).toHaveBeenLastCalledWith(['r1', 'r2', 'r3']);
  });

  it('single selection: arrows move rows, Enter runs the action while nothing is selected, checkboxes choose, disabled rows are skipped', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    const onRowAction = vi.fn();
    render(<Example selectionMode="single" disabledIds={['r3']} onSelectedChange={onSelectedChange} onRowAction={onRowAction} />);
    await user.tab();
    expect(screen.getByRole('row', { name: 'Alice' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('row', { name: 'Bob' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onRowAction).toHaveBeenLastCalledWith('r2');
    await user.click(within(screen.getByRole('row', { name: 'Chen' })).getByRole('checkbox'));
    expect(onSelectedChange).not.toHaveBeenCalled();
    expect(screen.getByRole('row', { name: 'Chen' })).toHaveAttribute('data-disabled');
    await user.click(within(screen.getByRole('row', { name: 'Bob' })).getByRole('checkbox'));
    expect(onSelectedChange).toHaveBeenLastCalledWith(['r2']);
    // With a selection in place, Enter toggles selection instead of running the action.
    onRowAction.mockClear();
    screen.getByRole('row', { name: 'Alice' }).focus();
    await user.keyboard('{Enter}');
    expect(onRowAction).not.toHaveBeenCalled();
  });

  it('shows the empty message and puts the sticky header on the DOM', () => {
    render(
      <DataGrid aria-label="Empty" stickyHeader>
        <DataGrid.Header>
          <DataGrid.Column isRowHeader>Name</DataGrid.Column>
        </DataGrid.Header>
        <DataGrid.Body emptyMessage="Nothing yet">{[]}</DataGrid.Body>
      </DataGrid>,
    );
    expect(screen.getByText('Nothing yet')).toBeInTheDocument();
    expect(screen.getByRole('grid').parentElement).toHaveAttribute('data-sticky-header');
  });

  it('has no accessibility violations with selection and sorting', async () => {
    const { container } = render(<Example selectionMode="multiple" defaultSelected={['r2']} defaultSort={{ column: 'name', direction: 'ascending' }} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
