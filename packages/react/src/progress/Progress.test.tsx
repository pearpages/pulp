import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Progress } from './Progress';

describe('Progress', () => {
  it('is a labelled progressbar with value semantics', () => {
    render(<Progress label="Uploading" value={30} />);
    const bar = screen.getByRole('progressbar', { name: 'Uploading' });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '30');
    expect(bar).toHaveAttribute('aria-valuetext', '30%');
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('uses max and valueText', () => {
    render(<Progress label="Files" value={3} max={10} valueText="3 of 10 files" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemax', '10');
    expect(bar).toHaveAttribute('aria-valuetext', '3 of 10 files');
    expect(screen.getByText('3 of 10 files')).toBeInTheDocument();
  });

  it('is indeterminate without a value and can hide its label', () => {
    render(<Progress label="Working" hideLabel data-testid="p" />);
    const bar = screen.getByRole('progressbar', { name: 'Working' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(screen.getByTestId('p')).toHaveAttribute('data-indeterminate');
    expect(screen.queryByText('%')).toBeNull();
  });

  it('clamps and reflects tone and size', () => {
    render(<Progress label="Over" value={150} tone="error" size="sm" data-testid="p" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '100%');
    expect(screen.getByTestId('p')).toHaveAttribute('data-tone', 'error');
    expect(screen.getByTestId('p')).toHaveAttribute('data-size', 'sm');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Progress label="A" value={40} />
        <Progress label="B" />
        <Progress label="C" value={90} hideLabel tone="success" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
