import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders a neutral subtle badge by default', () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText('New');
    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveAttribute('data-tone', 'neutral');
    expect(badge).toHaveAttribute('data-variant', 'subtle');
    expect(badge).toHaveAttribute('data-size', 'md');
  });

  it('exposes tone, variant, size and a decorative icon', () => {
    render(
      <Badge tone="error" variant="solid" size="sm" icon={<svg data-testid="glyph" />}>
        Failed
      </Badge>,
    );
    const badge = screen.getByText('Failed');
    expect(badge).toHaveAttribute('data-tone', 'error');
    expect(badge).toHaveAttribute('data-variant', 'solid');
    expect(badge).toHaveAttribute('data-size', 'sm');
    expect(screen.getByTestId('glyph').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        {(['neutral', 'info', 'success', 'warning', 'error'] as const).map((tone) => (
          <span key={tone}>
            <Badge tone={tone}>{tone}</Badge>
            <Badge tone={tone} variant="solid">
              {tone}
            </Badge>
          </span>
        ))}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
