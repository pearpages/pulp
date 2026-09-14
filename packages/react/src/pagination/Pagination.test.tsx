import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Pagination } from './Pagination';
import { paginationRange } from './range';

describe('paginationRange', () => {
  it('collapses distant pages into ellipses and keeps boundaries and siblings', () => {
    expect(paginationRange(1, 5, 1, 1)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange(1, 10, 1, 1)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 10]);
    expect(paginationRange(5, 10, 1, 1)).toEqual([1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10]);
    expect(paginationRange(10, 10, 1, 1)).toEqual([1, 'start-ellipsis', 6, 7, 8, 9, 10]);
    expect(paginationRange(50, 100, 2, 2)).toEqual([1, 2, 'start-ellipsis', 48, 49, 50, 51, 52, 'end-ellipsis', 99, 100]);
  });
});

describe('Pagination', () => {
  it('is a navigation landmark with the current page marked and the ends disabled', () => {
    render(<Pagination page={1} count={3} />);
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('data-variant', 'primary');
    expect(screen.getByRole('button', { name: 'Page 2' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
  });

  it('reports page changes from numbers, previous and next', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={5} count={10} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Page 6' }));
    expect(onPageChange).toHaveBeenLastCalledWith(6);
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(6);
    expect(screen.getAllByText('…')).toHaveLength(2);
    expect(screen.getAllByText('…')[0]).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders links with getHref, without a link for the disabled end', () => {
    render(<Pagination page={1} count={4} getHref={(page) => `/items?page=${page}`} />);
    expect(screen.getByRole('link', { name: 'Page 2' })).toHaveAttribute('href', '/items?page=2');
    expect(screen.getByRole('link', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Next page' })).toHaveAttribute('href', '/items?page=2');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });

  it('supports custom labels and size on the DOM', () => {
    render(<Pagination page={2} count={3} size="sm" aria-label="Pàgines" previousLabel="Anterior" nextLabel="Següent" pageLabel={(n) => `Pàgina ${n}`} />);
    expect(screen.getByRole('navigation', { name: 'Pàgines' })).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pàgina 2' })).toHaveAttribute('aria-current', 'page');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Pagination page={5} count={10} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
