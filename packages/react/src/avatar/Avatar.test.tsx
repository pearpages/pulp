import { createRef, type ImgHTMLAttributes } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('shows the image, named by the person', () => {
    render(<Avatar name="Ana Ruiz" src="/ana.jpg" />);
    const image = screen.getByRole('img', { name: 'Ana Ruiz' });
    expect(image.tagName).toBe('IMG');
    expect(image).toHaveAttribute('src', '/ana.jpg');
    expect(image.parentElement).not.toHaveAttribute('data-fallback');
  });

  it('falls back to initials without an image: first and last word, by code point', () => {
    const { rerender } = render(<Avatar name="Ana María Ruiz" />);
    const avatar = screen.getByRole('img', { name: 'Ana María Ruiz' });
    expect(avatar).toHaveTextContent('AR');
    expect(avatar).toHaveAttribute('data-fallback');
    // The letters are not what a screen reader should say.
    expect(avatar.firstElementChild).toHaveAttribute('aria-hidden', 'true');

    rerender(<Avatar name="  élodie " />);
    expect(screen.getByRole('img', { name: 'élodie' })).toHaveTextContent('É');
  });

  it('falls back to initials when the image fails, and tries again with a new src', () => {
    const { rerender } = render(<Avatar name="Ana Ruiz" src="/gone.jpg" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img', { name: 'Ana Ruiz' })).toHaveTextContent('AR');
    expect(document.querySelector('img')).toBeNull();

    rerender(<Avatar name="Ana Ruiz" src="/ana.jpg" />);
    expect(document.querySelector('img')).toHaveAttribute('src', '/ana.jpg');
  });

  it('alt overrides the name, and alt="" makes it decorative', () => {
    const { rerender, container } = render(<Avatar name="Ana Ruiz" alt="Your profile" />);
    expect(screen.getByRole('img', { name: 'Your profile' })).toHaveTextContent('AR');

    rerender(<Avatar name="Ana Ruiz" alt="" />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');

    rerender(<Avatar name="Ana Ruiz" alt="" src="/ana.jpg" />);
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  it("styles and watches a framework's image component passed as the child", () => {
    const FrameworkImage = (props: ImgHTMLAttributes<HTMLImageElement>) => <img data-framework="" {...props} />;
    render(
      <Avatar name="Ana Ruiz">
        <FrameworkImage src="/ana.jpg" alt="ignored" width={40} height={40} className="theirs" />
      </Avatar>,
    );
    const image = screen.getByRole('img', { name: 'Ana Ruiz' });
    expect(image).toHaveAttribute('data-framework');
    expect(image).toHaveClass('theirs', 'image');
    fireEvent.error(image);
    expect(screen.getByRole('img', { name: 'Ana Ruiz' })).toHaveTextContent('AR');
  });

  it('exposes size as data, and passes className, ref and the rest to the root', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar name="Ana Ruiz" size="xl" className="mine" data-testid="avatar" ref={ref} />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveAttribute('data-size', 'xl');
    expect(avatar).toHaveClass('root', 'mine');
    expect(ref.current).toBe(avatar);
    expect(screen.getByRole('img')).toBe(avatar);
  });

  it('defaults to md', () => {
    render(<Avatar name="Ana Ruiz" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-size', 'md');
  });

  it('has no accessibility violations as image, initials, decorative and nameless', async () => {
    const { container } = render(
      <div>
        <Avatar name="Ana Ruiz" src="/ana.jpg" />
        <Avatar name="Ana Ruiz" />
        <Avatar name="Ana Ruiz" alt="" />
        <Avatar />
        <Avatar name="Ana Ruiz" size="sm" />
        <Avatar name="Ana Ruiz" size="xl" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
