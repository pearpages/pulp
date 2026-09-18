import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from '../button';
import { DialogSystem } from '../dialog';
import { Sheet, type SheetPlacement } from './Sheet';

function Example({ placement, dragToDismiss }: { placement?: SheetPlacement; dragToDismiss?: boolean }) {
  return (
    <DialogSystem>
      <Sheet.Trigger target="filters">Open filters</Sheet.Trigger>
      <Sheet id="filters">
        <Sheet.Content placement={placement} dragToDismiss={dragToDismiss} className="mine">
          <Sheet.Header>
            <Sheet.Title>Filters</Sheet.Title>
            <Sheet.Description>Narrow the list.</Sheet.Description>
            <Sheet.Close aria-label="Close" />
          </Sheet.Header>
          <Sheet.Body>
            <p>Body</p>
          </Sheet.Body>
          <Sheet.Footer>
            <Sheet.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </Sheet.Close>
            <Button>Apply</Button>
          </Sheet.Footer>
        </Sheet.Content>
      </Sheet>
    </DialogSystem>
  );
}

const open = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Open filters' }));
  return screen.findByRole('dialog', { name: 'Filters' });
};

describe('Sheet', () => {
  it('docks to the end edge by default, in the portal DialogSystem owns', async () => {
    render(<Example />);
    expect(screen.queryByRole('dialog')).toBeNull();
    const sheet = await open();
    expect(sheet).toHaveAttribute('data-placement', 'end');
    expect(sheet).toHaveAccessibleDescription('Narrow the list.');
    expect(document.body.querySelector('[data-pulp-dialogs]')).toContainElement(sheet);
  });

  it.each(['start', 'end', 'top', 'bottom'] as const)('docks to the %s edge', async (placement) => {
    render(<Example placement={placement} />);
    expect(await open()).toHaveAttribute('data-placement', placement);
  });

  it('carries the class that maps the --sheet-* tokens, next to the caller\'s own', async () => {
    render(<Example />);
    const sheet = await open();
    expect(sheet.className).toMatch(/content/);
    expect(sheet).toHaveClass('mine');
  });

  it('is a Dialog: focus moves in and is trapped, Escape and Close dismiss it', async () => {
    render(<Example />);
    const sheet = await open();
    await waitFor(() => expect(sheet.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await open();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  describe('drag to dismiss', () => {
    const handleOf = (dialog: HTMLElement) => dialog.querySelector<HTMLElement>('[class*="handle"]');
    // Synthetic events fire within a millisecond of each other, which would make every drag a flick:
    // the clock the handle reads is stepped by hand, 200 ms per event (slow: 80 px is 200 px/s).
    let now = 0;
    beforeEach(() => {
      now = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => now);
    });
    afterEach(() => vi.restoreAllMocks());
    const step = (ms = 200) => {
      now += ms;
    };
    const dragBy = (handle: HTMLElement, distance: number, ms = 200) => {
      fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientY: 100 });
      step(ms);
      fireEvent.pointerMove(handle, { pointerId: 1, clientY: 100 + distance / 2 });
      step(ms);
      fireEvent.pointerMove(handle, { pointerId: 1, clientY: 100 + distance });
      step(ms);
      return { release: () => fireEvent.pointerUp(handle, { pointerId: 1, clientY: 100 + distance }) };
    };

    it('only a bottom sheet gets a handle, hidden from assistive technology and not focusable', async () => {
      render(<Example placement="bottom" />);
      const dialog = await open();
      const handle = handleOf(dialog)!;
      expect(handle).toHaveAttribute('aria-hidden', 'true');
      expect(handle).not.toHaveAttribute('tabindex');
      expect(dialog).toHaveAttribute('data-draggable');
    });

    it('no handle at the other edges, nor with dragToDismiss={false}', async () => {
      const { unmount } = render(<Example placement="end" />);
      expect(handleOf(await open())).toBeNull();
      unmount();
      render(<Example placement="bottom" dragToDismiss={false} />);
      const dialog = await open();
      expect(handleOf(dialog)).toBeNull();
      expect(dialog).not.toHaveAttribute('data-draggable');
    });

    it('follows the pointer while dragging, and never above its resting place', async () => {
      render(<Example placement="bottom" />);
      const dialog = await open();
      const handle = handleOf(dialog)!;
      fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientY: 100 });
      expect(dialog).toHaveAttribute('data-dragging');
      fireEvent.pointerMove(handle, { pointerId: 1, clientY: 140 });
      expect(dialog.style.getPropertyValue('--_drag')).toBe('40px');
      fireEvent.pointerMove(handle, { pointerId: 1, clientY: 60 });
      expect(dialog.style.getPropertyValue('--_drag')).toBe('0px');
    });

    it('a short drag snaps back and stays open', async () => {
      render(<Example placement="bottom" />);
      const dialog = await open();
      // jsdom has no layout: the height is 0, so the 120 px fallback applies.
      dragBy(handleOf(dialog)!, 80).release();
      expect(dialog).not.toHaveAttribute('data-dragging');
      expect(dialog.style.getPropertyValue('--_drag')).toBe('');
      expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
    });

    it('a long drag closes it, and focus goes back to the trigger', async () => {
      render(<Example placement="bottom" />);
      const dialog = await open();
      dragBy(handleOf(dialog)!, 200).release();
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await waitFor(() => expect(screen.getByRole('button', { name: 'Open filters' })).toHaveFocus());
    });

    it('a cancelled pointer never closes it', async () => {
      render(<Example placement="bottom" />);
      const dialog = await open();
      const handle = handleOf(dialog)!;
      fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientY: 100 });
      fireEvent.pointerMove(handle, { pointerId: 1, clientY: 400 });
      fireEvent.pointerCancel(handle, { pointerId: 1, clientY: 400 });
      expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
      expect(dialog.style.getPropertyValue('--_drag')).toBe('');
    });

    it('does nothing under prefers-reduced-motion', async () => {
      // jsdom has no matchMedia at all.
      window.matchMedia = ((query: string) => ({ matches: query.includes('reduce'), media: query })) as typeof window.matchMedia;
      render(<Example placement="bottom" />);
      const dialog = await open();
      dragBy(handleOf(dialog)!, 300).release();
      expect(dialog).not.toHaveAttribute('data-dragging');
      expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
      delete (window as { matchMedia?: unknown }).matchMedia;
    });

    it('a short, fast flick closes it', async () => {
      render(<Example placement="bottom" />);
      const dialog = await open();
      // 60 px in 60 ms: 1000 px/s, well past the 500 px/s threshold, though far short of the distance.
      dragBy(handleOf(dialog)!, 60, 20).release();
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });
  });

  it('has no accessibility violations while open', async () => {
    render(<Example placement="bottom" />);
    await open();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
