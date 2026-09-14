import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Select } from './Select';

const options = (
  <>
    <option value="cat">Cat</option>
    <option value="dog">Dog</option>
  </>
);

describe('Select', () => {
  it('is a labelled native select with Field wiring', async () => {
    render(
      <Select label="Pet" description="Pick one." error="Required." defaultValue="cat">
        {options}
      </Select>,
    );
    const select = screen.getByRole('combobox', { name: 'Pet' });
    expect(select.tagName).toBe('SELECT');
    expect(select).toHaveValue('cat');
    expect(select).toHaveAccessibleDescription('Pick one. Required.');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    await userEvent.selectOptions(select, 'dog');
    expect(select).toHaveValue('dog');
  });

  it('renders a placeholder option, disabled when required', () => {
    render(
      <Select label="Pet" placeholder="Choose…" required defaultValue="">
        {options}
      </Select>,
    );
    const placeholder = screen.getByRole('option', { name: 'Choose…' });
    expect(placeholder).toHaveValue('');
    expect(placeholder).toBeDisabled();
    expect(screen.getByRole('combobox')).toBeRequired();
  });

  it('works controlled', async () => {
    function Example() {
      const [value, setValue] = useState('cat');
      return (
        <Select label="Pet" value={value} onChange={(event) => setValue(event.target.value)}>
          {options}
        </Select>
      );
    }
    render(<Example />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'dog');
    expect(screen.getByRole('combobox')).toHaveValue('dog');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Select label="Default" placeholder="Choose…">
          {options}
        </Select>
        <Select label="Invalid" error="No" defaultValue="cat">
          {options}
        </Select>
        <Select label="Disabled" disabled defaultValue="dog">
          {options}
        </Select>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
