import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Alert } from './Alert';

describe('Alert', () => {
  it('is a polite status by default with the tone glyph', () => {
    render(<Alert title="Saved">Your changes are live.</Alert>);
    const alert = screen.getByRole('status');
    expect(alert).toHaveAttribute('data-tone', 'info');
    expect(alert).toHaveTextContent('Saved');
    expect(alert.querySelector('svg')).not.toBeNull();
  });

  it('is an assertive alert for errors, and silent when live is off', () => {
    render(
      <>
        <Alert tone="error">Failed</Alert>
        <Alert live="off" data-testid="quiet">
          Quiet
        </Alert>
      </>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
    expect(screen.getByTestId('quiet')).not.toHaveAttribute('role');
  });

  it('hides the glyph with icon={null} and takes a custom one', () => {
    render(
      <>
        <Alert icon={null} data-testid="none">
          x
        </Alert>
        <Alert icon={<svg data-testid="custom" />}>y</Alert>
      </>,
    );
    expect(screen.getByTestId('none').querySelector('svg')).toBeNull();
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('renders action and dismiss', async () => {
    const onDismiss = vi.fn();
    render(
      <Alert title="Update" action={<button type="button">Retry</button>} onDismiss={onDismiss} dismissLabel="Close alert">
        Body
      </Alert>,
    );
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close alert' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations in any tone', async () => {
    const { container } = render(
      <div>
        {(['info', 'success', 'warning', 'error'] as const).map((tone) => (
          <Alert key={tone} tone={tone} title={tone} onDismiss={() => {}}>
            Body text for {tone}.
          </Alert>
        ))}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
