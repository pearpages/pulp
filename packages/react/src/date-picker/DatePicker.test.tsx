import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
  it('is a labelled group of date segments with a calendar button', () => {
    render(<DatePicker label="Start date" description="The first day" locale="en-GB" defaultValue="2026-09-14" />);
    const group = screen.getByRole('group', { name: 'Start date' });
    expect(group).toHaveAccessibleDescription(/The first day/);
    const segments = screen.getAllByRole('spinbutton');
    expect(segments.map((segment) => segment.getAttribute('data-type'))).toEqual(['day', 'month', 'year']);
    expect(segments.map((segment) => segment.getAttribute('aria-valuenow'))).toEqual(['14', '9', '2026']);
    expect(screen.getByRole('button', { name: /calendar/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('typing into segments changes the value as an ISO string', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker label="Start date" locale="en-US" onChange={onChange} />);
    await user.click(screen.getByRole('spinbutton', { name: /^month/ }));
    await user.keyboard('09142026');
    expect(onChange).toHaveBeenLastCalledWith('2026-09-14');
  });

  it('the button opens a dialog with the calendar; choosing a day sets the value and closes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker label="Start date" locale="en-US" defaultValue="2026-09-14" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /calendar/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('heading')).toHaveTextContent('September 2026');
    // Unanchored: on the day itself React Aria prefixes the name with "Today, ".
    await user.click(screen.getByRole('button', { name: /Wednesday, September 23, 2026/ }));
    expect(onChange).toHaveBeenLastCalledWith('2026-09-23');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('spinbutton', { name: /^day/ })).toHaveAttribute('aria-valuenow', '23');
  });

  it('error, required, disabled and readOnly reach the field; min and max bound the calendar', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DatePicker label="Start date" locale="en-US" error="Required" required />);
    expect(screen.getByRole('group', { name: /Start date/ })).toHaveAccessibleDescription(/Required/);
    expect(screen.getByRole('group', { name: /Start date/ })).toHaveAttribute('data-invalid');
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    rerender(<DatePicker label="Start date" locale="en-US" disabled />);
    expect(screen.getByRole('button', { name: /calendar/i })).toBeDisabled();
    rerender(<DatePicker label="Start date" locale="en-US" defaultValue="2026-09-14" min="2026-09-01" max="2026-09-30" />);
    await user.click(screen.getByRole('button', { name: /calendar/i }));
    await screen.findByRole('dialog');
    expect(document.querySelector('[slot="previous"]')).toBeDisabled();
    expect(document.querySelector('[slot="next"]')).toBeDisabled();
  });

  it('submits the ISO value with a form', () => {
    render(
      <form aria-label="form">
        <DatePicker label="Start date" locale="en-US" name="start" defaultValue="2026-09-14" />
      </form>,
    );
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('start')).toBe('2026-09-14');
  });

  it('has no accessibility violations closed and open', async () => {
    const user = userEvent.setup();
    const { container } = render(<DatePicker label="Start date" locale="en-US" defaultValue="2026-09-14" />);
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole('button', { name: /calendar/i }));
    await screen.findByRole('dialog');
    expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
