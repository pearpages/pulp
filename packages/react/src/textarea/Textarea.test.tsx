import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('is a labelled textarea with rows and Field wiring', () => {
    render(<Textarea label="Bio" description="Short." error="Too long." rows={5} />);
    const area = screen.getByLabelText('Bio');
    expect(area.tagName).toBe('TEXTAREA');
    expect(area).toHaveAttribute('rows', '5');
    expect(area).toHaveAccessibleDescription('Short. Too long.');
    expect(area).toHaveAttribute('aria-invalid', 'true');
  });

  it('reflects size, resize and autoGrow on the wrapper', () => {
    render(<Textarea label="A" size="lg" resize="none" autoGrow />);
    const wrapper = screen.getByLabelText('A').closest('div[data-size]');
    expect(wrapper).toHaveAttribute('data-size', 'lg');
    expect(wrapper).toHaveAttribute('data-resize', 'none');
    expect(wrapper).toHaveAttribute('data-auto-grow');
  });

  it('accepts typing and readOnly/disabled', async () => {
    render(
      <>
        <Textarea label="T" defaultValue="Hi" />
        <Textarea label="RO" readOnly defaultValue="fixed" />
        <Textarea label="D" disabled />
      </>,
    );
    const area = screen.getByLabelText('T');
    await userEvent.type(area, '!');
    expect(area).toHaveValue('Hi!');
    expect(screen.getByLabelText('RO')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('D')).toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Textarea label="Default" placeholder="Type" />
        <Textarea label="Invalid" error="No" />
        <Textarea label="Disabled" disabled />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
