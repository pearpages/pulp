import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from '../button';
import { Dialog, DialogSystem } from './Dialog';

function Example() {
  return (
    <DialogSystem>
      <Dialog.Trigger target="settings">Open settings</Dialog.Trigger>
      <Dialog id="settings">
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Settings</Dialog.Title>
            <Dialog.Description>Change how the workspace behaves.</Dialog.Description>
            <Dialog.Close aria-label="Close" />
          </Dialog.Header>
          <Dialog.Body>
            <p>Body</p>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </Dialog.Close>
            <Button>Save</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </DialogSystem>
  );
}

describe('Dialog', () => {
  it('owns a portal element carrying the theming class', () => {
    const { unmount } = render(<Example />);
    const root = document.body.querySelector('[data-pulp-dialogs]');
    expect(root).not.toBeNull();
    expect(root?.className).toMatch(/root/);
    unmount();
    expect(document.body.querySelector('[data-pulp-dialogs]')).toBeNull();
  });

  it('opens from the trigger into the owned portal, traps focus, and closes on Escape', async () => {
    render(<Example />);
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Open settings' }));
    const dialog = await screen.findByRole('dialog', { name: 'Settings' });
    expect(dialog).toHaveAccessibleDescription('Change how the workspace behaves.');
    expect(document.body.querySelector('[data-pulp-dialogs]')).toContainElement(dialog);
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('closes from a Close wrapped around a pulp Button', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Open settings' }));
    await screen.findByRole('dialog');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('has no accessibility violations while open', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Open settings' }));
    await screen.findByRole('dialog');
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
