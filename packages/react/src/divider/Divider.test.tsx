import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Divider } from './Divider';

describe('Divider', () => {
  it('is a decorative horizontal line by default', () => {
    render(<Divider data-testid="line" />);
    const line = screen.getByTestId('line');
    expect(line).toHaveAttribute('role', 'none');
    expect(line).toHaveAttribute('data-orientation', 'horizontal');
    expect(line).toHaveAttribute('data-spacing', 'none');
    expect(screen.queryByRole('separator')).toBeNull();
  });

  it('is a separator when it carries meaning', () => {
    render(<Divider decorative={false} />);
    const line = screen.getByRole('separator');
    // Horizontal is the role's default orientation: nothing to say.
    expect(line).not.toHaveAttribute('aria-orientation');
  });

  it('announces a vertical separator as vertical', () => {
    render(<Divider decorative={false} orientation="vertical" spacing="md" />);
    const line = screen.getByRole('separator');
    expect(line).toHaveAttribute('aria-orientation', 'vertical');
    expect(line).toHaveAttribute('data-orientation', 'vertical');
    expect(line).toHaveAttribute('data-spacing', 'md');
  });

  it('keeps a decorative vertical line free of aria-orientation', () => {
    render(<Divider orientation="vertical" data-testid="line" />);
    expect(screen.getByTestId('line')).not.toHaveAttribute('aria-orientation');
  });

  it('forwards ref, className and DOM props', () => {
    let node: HTMLDivElement | null = null;
    render(<Divider ref={(el) => { node = el; }} className="mine" id="rule" />);
    expect(node).toBeInstanceOf(HTMLDivElement);
    expect(node).toHaveClass('mine');
    expect(node).toHaveAttribute('id', 'rule');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <p>Above</p>
        <Divider />
        <p>Between</p>
        <Divider decorative={false} />
        <div>
          <span>Left</span>
          <Divider decorative={false} orientation="vertical" />
          <span>Right</span>
        </div>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
