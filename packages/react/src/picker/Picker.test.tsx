import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Picker } from './Picker';

const items = [
  { id: 'eur', label: 'Euro', description: 'EUR' },
  { id: 'usd', label: 'US dollar', description: 'USD' },
  { id: 'gbp', label: 'Pound sterling', description: 'GBP', disabled: true },
];

describe('Picker', () => {
  it('is a labelled button that opens a listbox; arrows and Enter choose', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Picker label="Currency" description="Charged monthly" items={items} onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: /Currency/ });
    expect(trigger).toHaveTextContent('Select…');
    expect(trigger).toHaveAccessibleDescription('Charged monthly');
    trigger.focus();
    // Opened from the keyboard, the first option takes focus; from a pointer, the list itself would.
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await waitFor(() => expect(screen.getByRole('option', { name: /Euro/ })).toHaveFocus());
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('usd');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(trigger).toHaveTextContent('US dollar');
    expect(trigger).toHaveFocus();
  });

  it('carries the value in a hidden native select for forms and honours a default', () => {
    render(
      <form aria-label="form">
        <Picker label="Currency" items={items} name="currency" defaultValue="eur" />
      </form>,
    );
    expect(screen.getByRole('button', { name: /Currency/ })).toHaveTextContent('Euro');
    const form = screen.getByRole('form') as HTMLFormElement;
    expect(new FormData(form).get('currency')).toBe('eur');
  });

  it('error, required and disabled reach the trigger; the placeholder is on the DOM', () => {
    const { rerender } = render(<Picker label="Currency" items={items} error="Choose one" required />);
    const trigger = screen.getByRole('button', { name: /Currency/ });
    expect(trigger).toHaveAccessibleDescription('Choose one');
    expect(trigger.querySelector('[data-placeholder]')).not.toBeNull();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    rerender(<Picker label="Currency" items={items} disabled />);
    expect(screen.getByRole('button', { name: /Currency/ })).toBeDisabled();
  });

  it('is controlled by `value`, marks the selected option, skips disabled ones', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Picker label="Currency" items={items} value="usd" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /Currency/ }));
    expect(await screen.findByRole('option', { name: /US dollar/ })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('option', { name: /Pound/ }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has no accessibility violations closed and open', async () => {
    const user = userEvent.setup();
    const { container } = render(<Picker label="Currency" items={items} />);
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole('button', { name: /Currency/ }));
    await screen.findByRole('listbox');
    expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
