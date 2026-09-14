import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { TextField } from './TextField';

describe('TextField', () => {
  it('associates the label with the input', () => {
    render(<TextField label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input.tagName).toBe('INPUT');
    expect(input.closest('div')).toHaveAttribute('data-size', 'md');
  });

  it('exposes description and error as the accessible description', () => {
    render(<TextField label="Email" description="We never share it." error="Enter a valid address." />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAccessibleDescription('We never share it. Enter a valid address.');
  });

  it('keeps a consumer aria-describedby and adds its own', () => {
    render(
      <>
        <p id="hint">Hint</p>
        <TextField label="Email" description="Desc" aria-describedby="hint" />
      </>,
    );
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Hint Desc');
  });

  it('marks the input invalid and announces the error', () => {
    render(<TextField label="Email" error="Required" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.closest('div')).toHaveAttribute('data-invalid');
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('is not invalid without an error', () => {
    render(<TextField label="Email" />);
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('marks required fields', () => {
    render(<TextField label="Email" required />);
    expect(screen.getByLabelText(/Email/)).toBeRequired();
  });

  it('works controlled', async () => {
    function Form() {
      const [value, setValue] = useState('');
      return <TextField label="Name" value={value} onChange={(event) => setValue(event.target.value.toUpperCase())} />;
    }
    render(<Form />);
    const input = screen.getByLabelText('Name');
    await userEvent.type(input, 'ab');
    expect(input).toHaveValue('AB');
  });

  it('works uncontrolled', async () => {
    render(<TextField label="Name" defaultValue="Pere" />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveValue('Pere');
    await userEvent.type(input, '!');
    expect(input).toHaveValue('Pere!');
  });

  it('passes disabled and readOnly through and reflects them on the wrapper', () => {
    render(
      <>
        <TextField label="A" disabled />
        <TextField label="B" readOnly />
      </>,
    );
    expect(screen.getByLabelText('A')).toBeDisabled();
    expect(screen.getByLabelText('A').closest('div')).toHaveAttribute('data-disabled');
    expect(screen.getByLabelText('B')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('B').closest('div')).toHaveAttribute('data-readonly');
  });

  it('forwards the ref to the input and honours a given id', () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextField label="Email" id="email" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveAttribute('id', 'email');
  });

  it('has no accessibility violations in any state', async () => {
    const { container } = render(
      <div>
        <TextField label="Default" placeholder="Type here" />
        <TextField label="Described" description="Help text" />
        <TextField label="Invalid" error="Something is wrong" />
        <TextField label="Required" required />
        <TextField label="Disabled" disabled />
        <TextField label="Read only" readOnly defaultValue="fixed" />
        <TextField label="Small" size="sm" />
        <TextField label="Large" size="lg" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
