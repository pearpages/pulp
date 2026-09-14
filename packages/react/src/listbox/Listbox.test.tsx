import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Listbox } from './Listbox';

const items = [
  { id: 'apple', label: 'Apple', description: 'Crisp' },
  { id: 'banana', label: 'Banana' },
  { id: 'cherry', label: 'Cherry', disabled: true },
  { id: 'date', label: 'Date' },
];

describe('Listbox', () => {
  it('renders a listbox of options with descriptions and disabled state on the DOM', () => {
    render(<Listbox aria-label="Fruit" items={items} />);
    const list = screen.getByRole('listbox', { name: 'Fruit' });
    expect(list).toHaveAttribute('data-selection-mode', 'single');
    expect(screen.getAllByRole('option')).toHaveLength(4);
    expect(screen.getByRole('option', { name: /Apple/ })).toHaveAccessibleDescription('Crisp');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('single selection: arrows move, Enter selects, reports an array of ids', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Listbox aria-label="Fruit" items={items} onChange={onChange} />);
    await user.tab();
    expect(screen.getByRole('option', { name: /Apple/ })).toHaveFocus();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['banana']);
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('data-selected', 'true');
  });

  it('multiple selection: Space toggles, select-all resolves to every enabled id', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Listbox aria-label="Fruit" items={items} selectionMode="multiple" defaultValue={['apple']} onChange={onChange} />);
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onChange).toHaveBeenLastCalledWith(['apple', 'banana']);
    await user.keyboard('{Control>}a{/Control}');
    expect(onChange).toHaveBeenLastCalledWith(['apple', 'banana', 'date']);
  });

  it('is controlled by `value` and skips disabled options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Listbox aria-label="Fruit" items={items} value={['date']} onChange={onChange} />);
    expect(screen.getByRole('option', { name: 'Date' })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the empty message, and disables every option when disabled', () => {
    const { rerender } = render(<Listbox aria-label="Fruit" items={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    rerender(<Listbox aria-label="Fruit" items={items} disabled />);
    expect(screen.getByRole('listbox')).toHaveAttribute('data-disabled');
    for (const option of screen.getAllByRole('option')) expect(option).toHaveAttribute('aria-disabled', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Listbox aria-label="Fruit" items={items} selectionMode="multiple" defaultValue={['apple']} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
