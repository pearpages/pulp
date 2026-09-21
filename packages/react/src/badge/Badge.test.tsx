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

  it('dot: no visible text, the label rendered for assistive technology, and the tone as data', () => {
    render(<Badge variant="dot" tone="error" label="Unread messages" data-testid="dot" />);
    const dot = screen.getByTestId('dot');
    expect(dot).toHaveAttribute('data-variant', 'dot');
    expect(dot).toHaveAttribute('data-tone', 'error');
    expect(dot).toHaveTextContent('Unread messages');
    expect(screen.getByText('Unread messages')).toHaveClass('root');
    expect(dot).not.toHaveAttribute('role');
  });

  it('dot ignores children and icon, and warns in development without a label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Badge variant="dot" icon={<svg data-testid="glyph" />} data-testid="dot">ignored</Badge>);
    expect(screen.getByTestId('dot')).toBeEmptyDOMElement();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs a `label`'));
    warn.mockRestore();
  });

  it('count: shown as is up to max, clamped above it, and nothing at zero or below', () => {
    const { rerender, container } = render(<Badge count={7} />);
    expect(container).toHaveTextContent('7');
    rerender(<Badge count={99} />);
    expect(container).toHaveTextContent('99');
    rerender(<Badge count={100} />);
    expect(container).toHaveTextContent('99+');
    rerender(<Badge count={12} max={9} />);
    expect(container).toHaveTextContent('9+');
    rerender(<Badge count={0} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<Badge count={-3} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('count with a label reads as "3 unread"; the label is not visible', () => {
    render(<Badge count={3} label="unread" data-testid="count" />);
    expect(screen.getByTestId('count').textContent).toBe('3 unread');
    expect(screen.getByText('unread')).toHaveClass('root');
  });

  it('a label without dot or count is not rendered: the children are the text', () => {
    render(<Badge label="hidden" data-testid="badge">Beta</Badge>);
    expect(screen.getByTestId('badge').textContent).toBe('Beta');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        {(['neutral', 'info', 'success', 'warning', 'error', 'action'] as const).map((tone) => (
          <span key={tone}>
            <Badge tone={tone}>{tone}</Badge>
            <Badge tone={tone} variant="solid">
              {tone}
            </Badge>
          </span>
        ))}
        <Badge variant="dot" tone="error" label="Unread messages" />
        <Badge count={120} tone="error" variant="solid" label="unread" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
