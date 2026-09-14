import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Icon } from './Icon';

const Glyph = () => (
  <svg viewBox="0 0 24 24" data-testid="glyph">
    <path d="M5 12h14" />
  </svg>
);

describe('Icon', () => {
  it('is decorative by default', () => {
    render(
      <Icon>
        <Glyph />
      </Icon>,
    );
    const wrapper = screen.getByTestId('glyph').parentElement;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    expect(wrapper).not.toHaveAttribute('role');
    expect(wrapper).toHaveAttribute('data-size', 'md');
  });

  it('becomes a named image with a label', () => {
    render(
      <Icon label="Search" size="lg">
        <Glyph />
      </Icon>,
    );
    const img = screen.getByRole('img', { name: 'Search' });
    expect(img).not.toHaveAttribute('aria-hidden');
    expect(img).toHaveAttribute('data-size', 'lg');
  });

  it('can inherit the surrounding font size', () => {
    render(
      <Icon size="inherit">
        <Glyph />
      </Icon>,
    );
    expect(screen.getByTestId('glyph').parentElement).toHaveAttribute('data-size', 'inherit');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Icon>
          <Glyph />
        </Icon>
        <Icon label="Named">
          <Glyph />
        </Icon>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
