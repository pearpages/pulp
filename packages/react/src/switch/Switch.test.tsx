import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Switch } from './Switch';

describe('Switch', () => {
  it('is a switch labelled by its label and toggles', async () => {
    render(<Switch label="Dark mode" />);
    const toggle = screen.getByRole('switch', { name: 'Dark mode' });
    expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
  });

  it('wires description and error through Field', () => {
    render(<Switch label="Sync" description="Every hour." error="Sync is unavailable." />);
    const toggle = screen.getByRole('switch', { name: 'Sync' });
    expect(toggle).toHaveAccessibleDescription('Every hour. Sync is unavailable.');
    expect(toggle).toHaveAttribute('aria-invalid', 'true');
  });

  it('works controlled and respects disabled', async () => {
    function Example() {
      const [on, setOn] = useState(true);
      return <Switch label="S" checked={on} onChange={(event) => setOn(event.target.checked)} />;
    }
    render(
      <>
        <Example />
        <Switch label="Off" disabled />
      </>,
    );
    const toggle = screen.getByRole('switch', { name: 'S' });
    expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    expect(toggle).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Off' })).toBeDisabled();
  });

  it('has no accessibility violations in any state', async () => {
    const { container } = render(
      <div>
        <Switch label="Off" />
        <Switch label="On" defaultChecked />
        <Switch label="Invalid" error="No" />
        <Switch label="Disabled" disabled />
        <Switch label="Small" size="sm" />
        <Switch label="Large" size="lg" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
