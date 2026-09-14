import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('keeps the text in the accessibility tree', () => {
    render(
      <button type="button">
        <svg aria-hidden="true" />
        <VisuallyHidden>Search</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByText('Search').tagName).toBe('SPAN');
  });

  it('renders a div when asked', () => {
    render(<VisuallyHidden as="div">Block</VisuallyHidden>);
    expect(screen.getByText('Block').tagName).toBe('DIV');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <button type="button">
        <VisuallyHidden>Close</VisuallyHidden>
      </button>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
