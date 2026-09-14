import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Stack } from './Stack';

describe('Stack', () => {
  it('renders a div with gap 3 by default', () => {
    render(<Stack data-testid="s">x</Stack>);
    const el = screen.getByTestId('s');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveAttribute('data-gap', '3');
  });

  it('renders the requested element and variants', () => {
    render(
      <Stack as="ul" gap={6} align="center" justify="between" data-testid="s">
        <li>a</li>
      </Stack>,
    );
    const el = screen.getByTestId('s');
    expect(el.tagName).toBe('UL');
    expect(el).toHaveAttribute('data-gap', '6');
    expect(el).toHaveAttribute('data-align', 'center');
    expect(el).toHaveAttribute('data-justify', 'between');
  });

  it('keeps list semantics as ul/ol and does not add a role otherwise', () => {
    render(
      <>
        <Stack as="ul" data-testid="list">
          <li>a</li>
        </Stack>
        <Stack data-testid="plain">x</Stack>
      </>,
    );
    expect(screen.getByTestId('list')).toHaveAttribute('role', 'list');
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByTestId('plain')).not.toHaveAttribute('role');
  });

  it('has no accessibility violations as a list', async () => {
    const { container } = render(
      <Stack as="ul">
        <li>one</li>
        <li>two</li>
      </Stack>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
