import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('is decorative and a text line by default', () => {
    render(<Skeleton data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveAttribute('data-shape', 'text');
  });

  it('renders several lines with a shorter last line', () => {
    render(<Skeleton lines={3} data-testid="s" />);
    const lines = screen.getByTestId('s').querySelectorAll('[data-shape="text"]');
    expect(lines).toHaveLength(3);
    expect(lines[2]).toHaveAttribute('data-last');
    expect(lines[0]).not.toHaveAttribute('data-last');
  });

  it('renders rect and circle with a size', () => {
    render(
      <>
        <Skeleton shape="rect" data-testid="r" />
        <Skeleton shape="circle" size="lg" data-testid="c" />
      </>,
    );
    expect(screen.getByTestId('r')).toHaveAttribute('data-shape', 'rect');
    expect(screen.getByTestId('c')).toHaveAttribute('data-shape', 'circle');
    expect(screen.getByTestId('c')).toHaveAttribute('data-size', 'lg');
  });

  it('has no accessibility violations inside a busy container', async () => {
    const { container } = render(
      <div aria-busy="true">
        <Skeleton shape="circle" />
        <Skeleton lines={2} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
