import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from '../button';
import { DialogSystem } from '../dialog';
import { Sheet, type SheetPlacement } from './Sheet';

function Example({ placement }: { placement?: SheetPlacement }) {
  return (
    <DialogSystem>
      <Sheet.Trigger target="filters">Open filters</Sheet.Trigger>
      <Sheet id="filters">
        <Sheet.Content placement={placement} className="mine">
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

  it('has no accessibility violations while open', async () => {
    render(<Example placement="bottom" />);
    await open();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
