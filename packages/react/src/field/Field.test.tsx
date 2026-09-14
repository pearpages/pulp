import { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Field, useField } from './Field';

describe('Field', () => {
  it('wires label, control, description and error', () => {
    render(
      <Field invalid required>
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <input />
        </Field.Control>
        <Field.Description>We never share it.</Field.Description>
        <Field.Error>Required.</Field.Error>
      </Field>,
    );
    const input = screen.getByLabelText(/Email/);
    expect(input).toHaveAccessibleDescription('We never share it. Required.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
    expect(screen.getByRole('alert')).toHaveTextContent('Required.');
    expect(input.closest('div')).toHaveAttribute('data-invalid');
    expect(input.closest('div')).toHaveAttribute('data-required');
  });

  it('only describes by parts that are mounted, and drops them when they unmount', async () => {
    function Example() {
      const [showError, setShowError] = useState(true);
      return (
        <>
          <Field invalid={showError}>
            <Field.Label>Name</Field.Label>
            <Field.Control>
              <input />
            </Field.Control>
            {showError && <Field.Error>Bad.</Field.Error>}
          </Field>
          <button type="button" onClick={() => setShowError(false)}>
            fix
          </button>
        </>
      );
    }
    render(<Example />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAccessibleDescription('Bad.');
    await userEvent.click(screen.getByRole('button', { name: 'fix' }));
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('keeps a consumer aria-describedby on the control and honours a given id', () => {
    render(
      <>
        <p id="hint">Hint</p>
        <Field id="email">
          <Field.Label>Email</Field.Label>
          <Field.Control aria-describedby="hint">
            <input />
          </Field.Control>
          <Field.Description>Desc</Field.Description>
        </Field>
      </>,
    );
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('id', 'email');
    expect(input).toHaveAccessibleDescription('Hint Desc');
  });

  it('passes disabled to the control', () => {
    render(
      <Field disabled>
        <Field.Label>Off</Field.Label>
        <Field.Control>
          <input />
        </Field.Control>
      </Field>,
    );
    expect(screen.getByLabelText('Off')).toBeDisabled();
  });

  it('exposes the wiring through useField for custom controls', () => {
    function Custom() {
      const field = useField();
      return <div role="group" aria-labelledby={`${field.id}-legend`} id={field.id} aria-describedby={field.describedBy} />;
    }
    render(
      <Field>
        <Custom />
        <Field.Description>Group help</Field.Description>
      </Field>,
    );
    expect(screen.getByRole('group')).toHaveAttribute('aria-describedby', expect.stringMatching(/-description$/));
  });

  it('warns in development when a part is mounted twice', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Field>
        <Field.Label>Twice</Field.Label>
        <Field.Control>
          <input />
        </Field.Control>
        <Field.Description>One</Field.Description>
        <Field.Description>Two</Field.Description>
      </Field>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/more than one Field.Description/));
    warn.mockRestore();
  });

  it('documents the known gap: server-rendered HTML has no aria-describedby until hydration', () => {
    const html = renderToString(
      <Field>
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <input />
        </Field.Control>
        <Field.Description>Desc</Field.Description>
      </Field>,
    );
    expect(html).toMatch(/<label for="/);
    expect(html).toMatch(/id="[^"]+-description"/);
    // When this starts failing, the limitation in Field's JSDoc can be removed.
    expect(html).not.toMatch(/aria-describedby/);
  });

  it('throws when a part is used outside Field', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Field.Label>x</Field.Label>)).toThrow(/inside <Field>/);
    spy.mockRestore();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Field invalid>
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <input />
        </Field.Control>
        <Field.Description>Help</Field.Description>
        <Field.Error>Wrong</Field.Error>
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
