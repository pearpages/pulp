import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Radio, RadioGroup } from './Radio';

function Example(props: Partial<React.ComponentProps<typeof RadioGroup>>) {
  return (
    <RadioGroup label="Plan" {...props}>
      <Radio value="free" label="Free" />
      <Radio value="team" label="Team" />
      <Radio value="enterprise" label="Enterprise" disabled />
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('is a radiogroup labelled by reference, with named radios sharing a name', () => {
    render(<Example />);
    const group = screen.getByRole('radiogroup', { name: 'Plan' });
    expect(group).toHaveAttribute('aria-labelledby');
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(new Set(radios.map((r) => r.getAttribute('name'))).size).toBe(1);
    expect(screen.getByRole('radio', { name: 'Enterprise' })).toBeDisabled();
    expect(radios.every((r) => !(r as HTMLInputElement).checked)).toBe(true);
  });

  it('selects on click, uncontrolled with a default', async () => {
    const onValueChange = vi.fn();
    render(<Example defaultValue="free" onValueChange={onValueChange} />);
    expect(screen.getByRole('radio', { name: 'Free' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Team' }));
    expect(screen.getByRole('radio', { name: 'Team' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Free' })).not.toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith('team');
  });

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('free');
      return <Example value={value} onValueChange={(next) => next !== 'team' && setValue(next)} />;
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('radio', { name: 'Team' }));
    expect(screen.getByRole('radio', { name: 'Free' })).toBeChecked();
  });

  it('wires description and error to the group, and disabled/required to every radio', () => {
    render(<Example description="Billed yearly." error="Pick a plan." disabled required />);
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAccessibleDescription('Billed yearly. Pick a plan.');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-required', 'true');
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
      expect(radio).toBeRequired();
    }
  });

  it('throws when Radio is used outside RadioGroup', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Radio value="x" label="x" />)).toThrow(/inside <(RadioGroup|Field)>/);
    spy.mockRestore();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Example defaultValue="team" />
        <Example orientation="horizontal" error="Required" size="lg" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
