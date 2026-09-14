import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Calendar } from './Calendar';

// The vendor also renders visually hidden previous/next buttons for screen readers; the visible ones carry a slot.
const nav = (slot: 'previous' | 'next') => document.querySelector<HTMLButtonElement>(`[slot="${slot}"]`)!;

describe('Calendar', () => {
  it('is a grid named by a hidden level-2 heading, with the selected day marked on the DOM', () => {
    render(<Calendar defaultValue="2026-09-14" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('September 2026');
    expect(screen.getByRole('grid', { name: /September 2026/ })).toBeInTheDocument();
    expect(screen.getByRole('gridcell', { selected: true })).toHaveTextContent('14');
    const day = screen.getByRole('button', { name: /September 14, 2026/ });
    expect(day).toHaveAttribute('data-selected');
    expect(day).toHaveAttribute('data-today');
    expect(nav('previous')).toBeInTheDocument();
    expect(nav('next')).toBeInTheDocument();
  });

  it('keyboard: arrows move by day and week, Enter selects, onChange gets YYYY-MM-DD', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Calendar defaultValue="2026-09-14" onChange={onChange} />);
    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: /14/ })).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('2026-09-22');
  });

  it('navigates months, honours min and max, and marks unavailable dates', async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue="2026-09-14" min="2026-09-02" max="2026-10-31" isDateUnavailable={(date) => date === '2026-09-20'} />);
    expect(nav('previous')).toBeDisabled();
    await user.click(nav('next'));
    expect(screen.getByRole('heading')).toHaveTextContent('October 2026');
    expect(nav('next')).toBeDisabled();
    await user.click(nav('previous'));
    expect(screen.getByRole('button', { name: /September 20, 2026/ })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: /September 20, 2026/ })).toHaveAttribute('data-unavailable');
  });

  it('is controlled by `value` and shows the month of a value set from outside', () => {
    const { rerender } = render(<Calendar value="2026-03-01" locale="en-US" />);
    expect(screen.getByRole('heading')).toHaveTextContent('March 2026');
    rerender(<Calendar value="2026-06-15" locale="en-US" />);
    expect(screen.getByRole('heading')).toHaveTextContent('June 2026');
    expect(screen.getByRole('gridcell', { selected: true })).toHaveTextContent('15');
  });

  it('`locale` changes the language and the first day of the week', () => {
    const { container, unmount } = render(<Calendar value="2026-03-01" locale="es-ES" />);
    expect(screen.getByRole('heading')).toHaveTextContent(/marzo/);
    expect(container.querySelector('th')).toHaveTextContent(/lu/i);
    unmount();
    const second = render(<Calendar value="2026-03-01" locale="en-US" />);
    expect(screen.getByRole('heading')).toHaveTextContent('March 2026');
    expect(second.container.querySelector('th')).toHaveTextContent(/Su/);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Calendar defaultValue="2026-09-14" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
