import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Heading } from './Heading';

describe('Heading', () => {
  it('renders the level as the element and defaults the size from it', () => {
    render(
      <>
        <Heading level={1}>One</Heading>
        <Heading level={3}>Three</Heading>
        <Heading level={6}>Six</Heading>
      </>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('data-size', '2xl');
    expect(screen.getByRole('heading', { level: 3 })).toHaveAttribute('data-size', 'lg');
    expect(screen.getByRole('heading', { level: 6 })).toHaveAttribute('data-size', 'sm');
  });

  it('decouples size from level', () => {
    render(
      <Heading level={2} size="sm" tone="muted">
        Small two
      </Heading>,
    );
    const h = screen.getByRole('heading', { level: 2 });
    expect(h).toHaveAttribute('data-size', 'sm');
    expect(h).toHaveAttribute('data-tone', 'muted');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Heading level={1}>Title</Heading>
        <Heading level={2}>Section</Heading>
        <Heading level={3} tone="muted">
          Sub
        </Heading>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
