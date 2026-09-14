import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Combobox } from './Combobox';

const items = [
  { id: 'es', label: 'Spain', description: 'Europe' },
  { id: 'se', label: 'Sweden' },
  { id: 'ch', label: 'Switzerland' },
  { id: 'jp', label: 'Japan', disabled: true },
];

describe('Combobox', () => {
  it('is a labelled combobox that filters as the user types and selects with Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox label="Country" description="Where you live" items={items} onChange={onChange} />);
    const input = screen.getByRole('combobox', { name: 'Country' });
    expect(input).toHaveAccessibleDescription('Where you live');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    await user.type(input, 'sw');
    const list = await screen.findByRole('listbox');
    expect(input).toHaveAttribute('aria-controls', list.id);
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Sweden', 'Switzerland']);
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Sweden' }).id);
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('se');
    expect(input).toHaveValue('Sweden');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  });

  it('opens from the button, marks the selected option, Escape closes', async () => {
    const user = userEvent.setup();
    render(<Combobox label="Country" items={items} defaultValue="es" />);
    const input = screen.getByRole('combobox', { name: 'Country' });
    expect(input).toHaveValue('Spain');
    await user.click(screen.getByRole('button', { name: /suggestions/i }));
    await screen.findByRole('listbox');
    expect(screen.getByRole('option', { name: /Spain/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Japan' })).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  });

  it('async: controlled input text, items as given, loading state keeps the list open', async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    const { rerender } = render(<Combobox label="City" items={[]} filter="none" loading inputValue="" onInputChange={onInputChange} />);
    const input = screen.getByRole('combobox', { name: 'City' });
    await user.type(input, 'b');
    expect(onInputChange).toHaveBeenLastCalledWith('b');
    rerender(<Combobox label="City" items={[]} filter="none" loading inputValue="b" onInputChange={onInputChange} />);
    // Typing opened the list; while loading it stays open with the message instead of closing on an empty collection.
    expect(await screen.findByText('Loading…')).toBeInTheDocument();
    rerender(<Combobox label="City" items={[{ id: 'bcn', label: 'Barcelona' }]} filter="none" inputValue="b" onInputChange={onInputChange} />);
    expect(await screen.findByRole('option', { name: 'Barcelona' })).toBeInTheDocument();
  });

  it('error: invalid state, message announced; required marks the label; disabled and readOnly pass through', () => {
    const { rerender } = render(<Combobox label="Country" items={items} error="Pick one" required />);
    const input = screen.getByRole('combobox', { name: /Country/ });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription('Pick one');
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    rerender(<Combobox label="Country" items={items} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    rerender(<Combobox label="Country" items={items} readOnly />);
    expect(screen.getByRole('combobox')).toHaveAttribute('readonly');
  });

  it('reaches the input through ref and puts size and loading on the DOM', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Combobox label="Country" items={items} ref={ref} size="sm" loading />);
    expect(ref.current).toBe(screen.getByRole('combobox'));
    const root = screen.getByRole('combobox').closest('[data-size]');
    expect(root).toHaveAttribute('data-size', 'sm');
    expect(root).toHaveAttribute('data-loading');
  });

  it('has no accessibility violations closed and open', async () => {
    const user = userEvent.setup();
    const { container } = render(<Combobox label="Country" items={items} description="Where you live" />);
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole('button', { name: /suggestions/i }));
    await screen.findByRole('listbox');
    expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
