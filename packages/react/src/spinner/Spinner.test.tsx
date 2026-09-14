import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('announces a status with a default label', () => {
    render(<Spinner />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading');
    expect(status).toHaveAttribute('data-size', 'md');
    expect(status).toHaveAttribute('data-tone', 'default');
  });

  it('takes a custom label, size and tone', () => {
    render(<Spinner label="Saving" size="inherit" tone="inherit" />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Saving');
    expect(status).toHaveAttribute('data-size', 'inherit');
    expect(status).toHaveAttribute('data-tone', 'inherit');
  });

  it('is hidden when decorative', () => {
    render(<Spinner decorative data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).not.toHaveAttribute('role');
    expect(el).not.toHaveTextContent('Loading');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Spinner />
        <Spinner size="sm" />
        <Spinner decorative />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
