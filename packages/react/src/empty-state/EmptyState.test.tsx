import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from '../button';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title as a heading at level 3 by default, and the description', () => {
    render(<EmptyState title="No saved places" description="Places you save show up here." />);
    expect(screen.getByRole('heading', { level: 3, name: 'No saved places' })).toBeInTheDocument();
    expect(screen.getByText('Places you save show up here.')).toBeInTheDocument();
  });

  it('takes the heading level from the page', () => {
    render(<EmptyState title="No results" headingLevel={2} />);
    expect(screen.getByRole('heading', { level: 2, name: 'No results' })).toBeInTheDocument();
  });

  it('hides the icon from assistive technology', () => {
    render(<EmptyState title="No results" icon={<svg data-testid="glyph" />} />);
    expect(screen.getByTestId('glyph').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders no icon disc and no description when they are not given', () => {
    const { container } = render(<EmptyState title="No results" />);
    expect(container.querySelector('[aria-hidden]')).toBeNull();
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });

  it('renders the action, which keeps its own behaviour', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<EmptyState tone="error" title="Could not load your feed" action={<Button onClick={onRetry}>Try again</Button>} />);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('announces nothing by itself; a role is the caller’s decision', () => {
    const { rerender, container } = render(<EmptyState tone="error" title="Could not load" />);
    expect(container.firstElementChild).not.toHaveAttribute('role');
    expect(screen.queryByRole('alert')).toBeNull();
    rerender(<EmptyState tone="error" title="Could not load" role="alert" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load');
  });

  it('exposes tone as data and passes className, ref and the rest to the root', () => {
    const ref = createRef<HTMLDivElement>();
    render(<EmptyState title="Empty" tone="error" className="mine" data-testid="empty" ref={ref} />);
    const root = screen.getByTestId('empty');
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('root', 'mine');
    expect(root).toHaveAttribute('data-tone', 'error');
  });

  it('has no accessibility violations, neutral and error, with and without parts', async () => {
    const { container } = render(
      <main>
        <h1>Places</h1>
        <h2>Saved</h2>
        <EmptyState title="No saved places" description="Places you save show up here." icon={<svg />} action={<Button>Explore</Button>} />
        <EmptyState tone="error" title="Could not load" description="Check your connection." icon={<svg />} action={<Button>Try again</Button>} />
        <EmptyState title="Nothing here" />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
