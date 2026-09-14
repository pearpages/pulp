import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { IconButton } from './IconButton';

const Glyph = () => <svg data-testid="glyph" />;

describe('IconButton', () => {
  it('is named by its label and marked icon-only', () => {
    render(<IconButton label="Close" icon={<Glyph />} />);
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button).toHaveAttribute('data-icon-only');
    expect(button).toHaveAttribute('title', 'Close');
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(screen.getByTestId('glyph').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('keeps Button behaviour: variants, sizes, click, disabled', async () => {
    const onClick = vi.fn();
    render(<IconButton label="Add" icon={<Glyph />} variant="ghost" size="sm" onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button).toHaveAttribute('data-size', 'sm');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger the icon-only warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<IconButton label="Search" icon={<Glyph />} />);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('renders as a link with asChild', () => {
    render(
      <IconButton<HTMLAnchorElement> asChild label="Docs" icon={<Glyph />}>
        <a href="/docs" />
      </IconButton>,
    );
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('data-icon-only');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <IconButton label="Primary" icon={<Glyph />} />
        <IconButton label="Secondary" icon={<Glyph />} variant="secondary" />
        <IconButton label="Ghost" icon={<Glyph />} variant="ghost" />
        <IconButton label="Loading" icon={<Glyph />} loading />
        <IconButton label="Disabled" icon={<Glyph />} disabled />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
