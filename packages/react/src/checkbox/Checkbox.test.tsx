import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('is a native checkbox labelled by its label', async () => {
    render(<Checkbox label="Remember me" />);
    const box = screen.getByRole('checkbox', { name: 'Remember me' });
    expect(box).not.toBeChecked();
    await userEvent.click(box);
    expect(box).toBeChecked();
    expect(box.closest('div[data-size]')).toHaveAttribute('data-size', 'md');
  });

  it('wires description and error through Field', () => {
    render(<Checkbox label="Terms" description="Read them." error="You must accept." />);
    const box = screen.getByRole('checkbox', { name: 'Terms' });
    expect(box).toHaveAccessibleDescription('Read them. You must accept.');
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('You must accept.');
  });

  it('supports indeterminate as a property and as aria-checked="mixed"', () => {
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(<Checkbox label="All" indeterminate ref={ref} />);
    expect(ref.current?.indeterminate).toBe(true);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-indeterminate');
    rerender(<Checkbox label="All" ref={ref} />);
    expect(ref.current?.indeterminate).toBe(false);
    expect(screen.getByRole('checkbox')).not.toHaveAttribute('aria-checked');
  });

  it('works controlled', async () => {
    function Example() {
      const [checked, setChecked] = useState(false);
      return <Checkbox label="C" checked={checked} onChange={(event) => setChecked(event.target.checked)} />;
    }
    render(<Example />);
    const box = screen.getByRole('checkbox');
    await userEvent.click(box);
    expect(box).toBeChecked();
  });

  it('passes required and disabled through', () => {
    render(
      <>
        <Checkbox label="R" required />
        <Checkbox label="D" disabled />
      </>,
    );
    expect(screen.getByRole('checkbox', { name: /R/ })).toBeRequired();
    expect(screen.getByRole('checkbox', { name: 'D' })).toBeDisabled();
  });

  it('has no accessibility violations in any state', async () => {
    const { container } = render(
      <div>
        <Checkbox label="Default" />
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Mixed" indeterminate />
        <Checkbox label="Invalid" error="Nope" />
        <Checkbox label="Disabled" disabled />
        <Checkbox label="Small" size="sm" />
        <Checkbox label="Large" size="lg" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
