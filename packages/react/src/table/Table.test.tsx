import { createRef } from 'react';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Table } from './Table';

const rows = [
  { id: 'p1', name: 'Alice Martin', team: 'Platform', age: 34 },
  { id: 'p2', name: 'Noah Chen', team: 'Product', age: 29 },
];

function Example({ data = rows, ...props }: { data?: typeof rows } & Partial<Parameters<typeof Table>[0]>) {
  return (
    <Table caption="People" {...props}>
      <Table.Header>
        <Table.Row>
          <Table.Column>Name</Table.Column>
          <Table.Column>Team</Table.Column>
          <Table.Column align="end">Age</Table.Column>
        </Table.Row>
      </Table.Header>
      <Table.Body emptyMessage="No people match" columnCount={3}>
        {data.map((row) => (
          <Table.Row key={row.id}>
            <Table.Cell rowHeader>{row.name}</Table.Cell>
            <Table.Cell>{row.team}</Table.Cell>
            <Table.Cell align="end">{row.age}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

describe('Table', () => {
  it('is a real table: a caption names it, columns and row headers are th with a scope', () => {
    render(<Example />);
    const table = screen.getByRole('table', { name: 'People' });
    expect(within(table).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(['Name', 'Team', 'Age']);
    expect(within(table).getAllByRole('columnheader')[0]).toHaveAttribute('scope', 'col');
    const rowHeader = within(table).getByRole('rowheader', { name: 'Alice Martin' });
    expect(rowHeader).toHaveAttribute('scope', 'row');
    expect(within(table).getAllByRole('row')).toHaveLength(3);
  });

  it('keeps the caption for assistive technology when it is hidden', () => {
    render(<Example captionHidden />);
    expect(screen.getByRole('table', { name: 'People' })).toBeInTheDocument();
    expect(screen.getByText('People')).toHaveClass('captionHidden');
  });

  it('shows the empty message in place of the rows, spanning the columns', () => {
    render(<Example data={[]} />);
    const cell = screen.getByRole('cell', { name: 'No people match' });
    expect(cell).toHaveAttribute('colspan', '3');
    expect(screen.queryByRole('rowheader')).toBeNull();
  });

  it('exposes density and alignment as data; className on the container, ref and the rest on the table', () => {
    const ref = createRef<HTMLTableElement>();
    render(<Example density="compact" className="mine" id="people" ref={ref} />);
    const table = screen.getByRole('table', { name: 'People' });
    expect(ref.current).toBe(table);
    expect(table).toHaveAttribute('id', 'people');
    expect(table).toHaveAttribute('data-density', 'compact');
    expect(table.parentElement).toHaveClass('container', 'mine');
    expect(screen.getAllByRole('columnheader')[2]).toHaveAttribute('data-align', 'end');
    expect(screen.getAllByRole('cell')[1]).toHaveAttribute('data-align', 'end');
  });

  it('has no accessibility violations, with rows and empty', async () => {
    const { container } = render(
      <div>
        <Example />
        <Example data={[]} captionHidden />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
