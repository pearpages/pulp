import { createRef, useState, type AnchorHTMLAttributes } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { SegmentedControl } from './SegmentedControl';

type View = 'list' | 'map' | 'grid';
const options = [
  { value: 'list', label: 'List' },
  { value: 'map', label: 'Map' },
  { value: 'grid', label: 'Grid' },
] as const;

describe('SegmentedControl', () => {
  it('is a named radiogroup of native radios, the default one checked', () => {
    render(<SegmentedControl<View> label="View" options={options} defaultValue="map" />);
    const group = screen.getByRole('radiogroup', { name: 'View' });
    const radios = within(group).getAllByRole('radio');
    expect(radios.map((radio) => (radio as HTMLInputElement).value)).toEqual(['list', 'map', 'grid']);
    expect(screen.getByRole('radio', { name: 'Map' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Map' }).closest('label')).toHaveAttribute('data-selected');
    expect(new Set(radios.map((radio) => radio.getAttribute('name'))).size).toBe(1);
  });

  it('uncontrolled: click and the arrow keys select, and report the typed value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: View) => void>();
    render(<SegmentedControl<View> label="View" options={options} defaultValue="list" onValueChange={onValueChange} />);

    await user.click(screen.getByRole('radio', { name: 'Grid' }));
    expect(screen.getByRole('radio', { name: 'Grid' })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith('grid');

    // The keyboard is the browser's: arrows move and select, wrapping at the ends.
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'List' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'List' })).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith('list');
    await user.keyboard('{ArrowLeft}');
    expect(onValueChange).toHaveBeenLastCalledWith('grid');
  });

  it('controlled: reports the change and waits for the prop', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<SegmentedControl label="View" options={options} value="list" onValueChange={onValueChange} />);
    await user.click(screen.getByRole('radio', { name: 'Map' }));
    expect(onValueChange).toHaveBeenCalledWith('map');
    expect(screen.getByRole('radio', { name: 'List' })).toBeChecked();
    rerender(<SegmentedControl label="View" options={options} value="map" onValueChange={onValueChange} />);
    expect(screen.getByRole('radio', { name: 'Map' })).toBeChecked();
  });

  it('is one tab stop, on the checked radio', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>before</button>
        <SegmentedControl label="View" options={options} defaultValue="map" />
        <button>after</button>
      </>,
    );
    await user.tab();
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Map' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'after' })).toHaveFocus();
  });

  it('takes part in a form under its name', async () => {
    const user = userEvent.setup();
    let data: FormData | undefined;
    render(
      <form onSubmit={(event) => { event.preventDefault(); data = new FormData(event.currentTarget); }}>
        <SegmentedControl label="View" name="view" options={options} defaultValue="list" />
        <button type="submit">Save</button>
      </form>,
    );
    await user.click(screen.getByRole('radio', { name: 'Grid' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(data?.get('view')).toBe('grid');
  });

  it('disabled: the whole group, or one option that the arrows skip', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<SegmentedControl label="View" options={options} defaultValue="list" disabled onValueChange={onValueChange} />);
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true');

    rerender(
      <SegmentedControl
        label="View"
        options={[options[0], { ...options[1], disabled: true }, options[2]]}
        defaultValue="list"
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Map' })).toBeDisabled();
    screen.getByRole('radio', { name: 'List' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenLastCalledWith('grid');
  });

  it('icons are decorative; look, size and fullWidth are data; className, ref and the rest reach the root', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <SegmentedControl
        aria-labelledby="heading"
        options={[{ value: 'list', label: 'List', icon: <svg data-testid="glyph" /> }]}
        look="chips"
        size="sm"
        fullWidth
        className="mine"
        data-testid="control"
        ref={ref}
      />,
    );
    const root = screen.getByTestId('control');
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('root', 'mine');
    expect(root).toHaveAttribute('data-look', 'chips');
    expect(root).toHaveAttribute('data-size', 'sm');
    expect(root).toHaveAttribute('data-full-width');
    expect(root).toHaveAttribute('aria-labelledby', 'heading');
    expect(screen.getByTestId('glyph').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('radio', { name: 'List' })).toBeInTheDocument();
  });

  it('follows a caller that keeps the value in state', async () => {
    const user = userEvent.setup();
    function Example() {
      const [view, setView] = useState<View>('list');
      return (
        <>
          <SegmentedControl<View> label="View" options={options} value={view} onValueChange={setView} />
          <p>showing {view}</p>
        </>
      );
    }
    render(<Example />);
    await user.click(screen.getByRole('radio', { name: 'Map' }));
    expect(screen.getByText('showing map')).toBeInTheDocument();
  });

  describe('Nav', () => {
    it('is a labelled nav with a list of links, the current one marked, and no radio or tab roles', () => {
      render(
        <SegmentedControl.Nav label="Feed view">
          <SegmentedControl.NavItem href="/feed" current>Feed</SegmentedControl.NavItem>
          <SegmentedControl.NavItem href="/map">Map</SegmentedControl.NavItem>
        </SegmentedControl.Nav>,
      );
      const nav = screen.getByRole('navigation', { name: 'Feed view' });
      expect(within(nav).getAllByRole('listitem')).toHaveLength(2);
      expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('link', { name: 'Map' })).not.toHaveAttribute('aria-current');
      expect(screen.getByRole('link', { name: 'Feed' }).parentElement).toHaveAttribute('data-selected');
      expect(screen.queryByRole('radio')).toBeNull();
      expect(screen.queryByRole('tab')).toBeNull();
    });

    it("asChild hands the styles, aria-current and the ref to a router's link", () => {
      const RouterLink = ({ to, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => <a data-router="" href={to} {...props} />;
      const ref = createRef<HTMLAnchorElement>();
      render(
        <SegmentedControl.Nav label="Feed view" look="chips" size="sm">
          <SegmentedControl.NavItem asChild current ref={ref}>
            <RouterLink to="/feed" className="theirs">Feed</RouterLink>
          </SegmentedControl.NavItem>
        </SegmentedControl.Nav>,
      );
      const link = screen.getByRole('link', { name: 'Feed' });
      expect(link).toHaveAttribute('data-router');
      expect(link).toHaveAttribute('href', '/feed');
      expect(link).toHaveAttribute('aria-current', 'page');
      expect(link).toHaveClass('theirs', 'segment');
      expect(screen.getByRole('navigation')).toHaveAttribute('data-look', 'chips');
    });
  });

  it('has no accessibility violations in both looks, disabled, and as nav', async () => {
    const { container } = render(
      <div>
        <SegmentedControl label="View" options={options} defaultValue="list" />
        <SegmentedControl label="View as chips" look="chips" size="sm" options={options} defaultValue="map" />
        <SegmentedControl label="Disabled view" options={options} defaultValue="list" disabled />
        <SegmentedControl.Nav label="Feed view">
          <SegmentedControl.NavItem href="/feed" current>Feed</SegmentedControl.NavItem>
          <SegmentedControl.NavItem href="/map">Map</SegmentedControl.NavItem>
        </SegmentedControl.Nav>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
