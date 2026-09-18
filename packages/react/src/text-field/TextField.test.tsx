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

  describe('search affordance', () => {
    it('type="search" is a searchbox with a decorative Search glyph; the plain field has no wrapper', () => {
      const { container, rerender } = render(<TextField label="Search places" type="search" />);
      expect(screen.getByRole('searchbox', { name: 'Search places' })).toBeInTheDocument();
      const glyph = container.querySelector('svg')!;
      expect(glyph.closest('[aria-hidden="true"]')).not.toBeNull();
      // Painted over the input, not under it: they share a grid cell, and the input has a background.
      // (pointer-events: none hides it from elementFromPoint, so document order is what can be pinned;
      // the matrix screenshot shows the rest.)
      expect(screen.getByRole('searchbox').compareDocumentPosition(glyph) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

      rerender(<TextField label="Search places" type="search" iconStart={null} />);
      expect(container.querySelector('svg')).toBeNull();

      rerender(<TextField label="Name" />);
      expect(screen.getByRole('textbox', { name: 'Name' }).parentElement).toHaveClass('field');
    });

    it('hideLabel keeps the label for assistive technology', () => {
      render(<TextField label="Search places" hideLabel type="search" />);
      expect(screen.getByRole('searchbox', { name: 'Search places' })).toBeInTheDocument();
      expect(screen.getByText('Search places')).toHaveClass('hiddenLabel');
    });

    it('uncontrolled: the clear button appears with a value, empties the input, reports, and leaves focus in it', async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      render(<TextField label="Search" type="search" onClear={onClear} />);
      const input = screen.getByRole('searchbox');
      expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();

      await user.type(input, 'tapas');
      await user.click(screen.getByRole('button', { name: 'Clear' }));
      expect(input).toHaveValue('');
      expect(onClear).toHaveBeenCalledOnce();
      expect(input).toHaveFocus();
      expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
    });

    it('controlled: the button follows the value prop and clearing is the caller’s', async () => {
      const user = userEvent.setup();
      function Example() {
        const [query, setQuery] = useState('wine');
        return <TextField label="Search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} onClear={() => setQuery('')} clearLabel="Borrar" />;
      }
      render(<Example />);
      await user.click(screen.getByRole('button', { name: 'Borrar' }));
      expect(screen.getByRole('searchbox')).toHaveValue('');
      expect(screen.queryByRole('button', { name: 'Borrar' })).toBeNull();
    });

    it('Escape clears when there is a value and keeps the event to itself; empty, it passes through', async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      const onOuterKeyDown = vi.fn();
      render(
        // Stands in for a dialog listening for Escape.
        <div onKeyDown={onOuterKeyDown}>
          <TextField label="Search" type="search" defaultValue="tapas" onClear={onClear} />
        </div>,
      );
      const input = screen.getByRole('searchbox');
      input.focus();
      await user.keyboard('{Escape}');
      expect(input).toHaveValue('');
      expect(onClear).toHaveBeenCalledOnce();
      expect(onOuterKeyDown).not.toHaveBeenCalled();

      await user.keyboard('{Escape}');
      expect(onClear).toHaveBeenCalledOnce();
      expect(onOuterKeyDown).toHaveBeenCalledOnce();
    });

    it('no clear button while disabled or read-only; the caller’s onChange and onKeyDown still run', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onKeyDown = vi.fn();
      const { rerender } = render(<TextField label="Search" defaultValue="x" onClear={() => {}} disabled />);
      expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
      rerender(<TextField label="Search" defaultValue="x" onClear={() => {}} readOnly />);
      expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
      rerender(<TextField label="Search" onClear={() => {}} onChange={onChange} onKeyDown={onKeyDown} />);
      await user.type(screen.getByRole('textbox'), 'a');
      expect(onChange).toHaveBeenCalled();
      expect(onKeyDown).toHaveBeenCalled();
    });

    it('forwards the ref alongside its own', () => {
      const ref = createRef<HTMLInputElement>();
      render(<TextField label="Search" type="search" onClear={() => {}} ref={ref} />);
      expect(ref.current).toBe(screen.getByRole('searchbox'));
    });
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
        <TextField label="Search places" hideLabel type="search" defaultValue="tapas" onClear={() => {}} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
