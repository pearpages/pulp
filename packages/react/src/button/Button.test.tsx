import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from './Button';

describe('Button', () => {
  it('renders a real button with type="button" by default', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button).toHaveAttribute('data-size', 'md');
  });

  it('keeps an explicit type', () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('exposes variant and size on the DOM', () => {
    render(
      <Button variant="ghost" size="lg">
        More
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button).toHaveAttribute('data-size', 'lg');
  });

  it('calls onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is busy and inert while loading, but stays focusable and keeps its label', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Saving
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('data-loading');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    button.focus();
    expect(button).toHaveFocus();
  });

  it('uses the native disabled attribute only for disabled', () => {
    render(<Button disabled>Off</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute('aria-disabled');
  });

  it('warns in development when an icon-only button has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Button iconStart={<svg />}>{null}</Button>);
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/accessible name/));
    warn.mockClear();
    render(
      <Button iconStart={<svg />} aria-label="Next">
        {null}
      </Button>,
    );
    render(
      <Button>
        <span>Nested text</span>
      </Button>,
    );
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('hides icons from assistive technology', () => {
    render(
      <Button iconStart={<svg data-testid="start" />} iconEnd={<svg data-testid="end" />}>
        Next
      </Button>,
    );
    expect(screen.getByTestId('start').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('end').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button')).toHaveAccessibleName('Next');
  });

  it('forwards the ref to the element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  describe('asChild', () => {
    it('renders the child element with the button styling and props merged', () => {
      render(
        <Button asChild variant="secondary" className="extra">
          <a href="/docs" className="mine">
            Docs
          </a>
        </Button>,
      );
      const link = screen.getByRole('link', { name: 'Docs' });
      expect(link).toHaveAttribute('href', '/docs');
      expect(link).toHaveAttribute('data-variant', 'secondary');
      expect(link).not.toHaveAttribute('type');
      expect(link.className.split(' ')).toEqual(expect.arrayContaining(['mine', 'button', 'extra']));
    });

    it('uses aria-disabled, blocks activation, and skips the child handler when disabled', async () => {
      const onClick = vi.fn();
      render(
        <Button asChild disabled>
          <a href="/docs" onClick={onClick}>
            Docs
          </a>
        </Button>,
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).not.toHaveAttribute('disabled');
      await userEvent.click(link);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('composes the child handler when active', async () => {
      const theirs = vi.fn();
      const ours = vi.fn();
      render(
        <Button asChild onClick={ours}>
          <a href="/docs" onClick={theirs}>
            Docs
          </a>
        </Button>,
      );
      await userEvent.click(screen.getByRole('link'));
      expect(theirs).toHaveBeenCalledTimes(1);
      expect(ours).toHaveBeenCalledTimes(1);
    });

    it('types the ref as the child element', () => {
      const ref = createRef<HTMLAnchorElement>();
      render(
        <Button<HTMLAnchorElement> asChild ref={ref}>
          <a href="/docs">Docs</a>
        </Button>,
      );
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });

    it('throws when the child is not a single element', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<Button asChild>plain text</Button>)).toThrow(/asChild requires/);
      spy.mockRestore();
    });
  });

  it('has no accessibility violations in any variant or state', async () => {
    const { container } = render(
      <div>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button iconStart={<svg />}>Icon</Button>
        <Button asChild>
          <a href="/x">Link</a>
        </Button>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
