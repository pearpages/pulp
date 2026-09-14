import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Inline } from './Inline';

describe('Inline', () => {
  it('wraps by default with gap 3', () => {
    render(<Inline data-testid="i">x</Inline>);
    const el = screen.getByTestId('i');
    expect(el).toHaveAttribute('data-gap', '3');
    expect(el).toHaveAttribute('data-wrap');
  });

  it('can refuse to wrap and align its items', () => {
    render(
      <Inline wrap={false} gap={1} align="center" data-testid="i">
        x
      </Inline>,
    );
    const el = screen.getByTestId('i');
    expect(el).not.toHaveAttribute('data-wrap');
    expect(el).toHaveAttribute('data-gap', '1');
    expect(el).toHaveAttribute('data-align', 'center');
  });

  it('keeps list semantics as ol', () => {
    render(
      <Inline as="ol">
        <li>a</li>
      </Inline>,
    );
    expect(screen.getByRole('list')).toHaveAttribute('role', 'list');
  });

  it('has no accessibility violations as a nav', async () => {
    const { container } = render(
      <Inline as="nav" aria-label="Links">
        <a href="/a">A</a>
        <a href="/b">B</a>
      </Inline>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
