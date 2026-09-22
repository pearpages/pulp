import { act, type ReactNode } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { Dialog, DialogSystem } from '../dialog';
import { Menu } from '../menu';
import { Popover } from '../popover';
import { ToastProvider, useToast } from '../toast';

// Every other test mounts on the client, so none of them can see a first
// client render that differs from the server's. Here the server pass runs with
// `document` hidden, as it is under Next.js, so the components take their
// server branch; the HTML is then hydrated and React's recoverable errors
// (where "Hydration failed…" lands) are collected.
function serverRender(tree: ReactNode) {
  vi.stubGlobal('document', undefined);
  try {
    return renderToString(tree);
  } finally {
    vi.unstubAllGlobals();
  }
}

const roots: Root[] = [];

async function hydrate(tree: ReactNode) {
  const html = serverRender(tree);
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  const errors: unknown[] = [];
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  await act(async () => {
    roots.push(hydrateRoot(host, tree, { onRecoverableError: (error) => errors.push(error) }));
  });
  spy.mockRestore();
  return { host, errors };
}

afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()));
  document.body.replaceChildren();
});

function Fire() {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast({ title: 'Saved' })}>
      fire
    </button>
  );
}

describe('hydration', () => {
  it('ToastProvider hydrates without a mismatch and mounts its region after', async () => {
    const { errors } = await hydrate(
      <ToastProvider>
        <p>page</p>
      </ToastProvider>,
    );
    expect(errors).toEqual([]);
    const region = document.querySelector('[data-pulp-toasts] [role="region"]');
    expect(region).toHaveAccessibleName('Notifications');
    expect(region?.closest('[data-pulp-toasts]')?.parentElement).toBe(document.body);
  });

  it('a toast fired after hydration shows', async () => {
    const { host, errors } = await hydrate(
      <ToastProvider>
        <Fire />
      </ToastProvider>,
    );
    expect(errors).toEqual([]);
    act(() => host.querySelector('button')!.click());
    expect(document.querySelector('[data-pulp-toasts]')).toHaveTextContent('Saved');
  });

  const dialog = (open: boolean) => (
    <DialogSystem>
      <Dialog id="hydrated" open={open} onOpenChange={() => {}}>
        <Dialog.Content>
          <Dialog.Title>Hydrated</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    </DialogSystem>
  );

  it('DialogSystem with no dialog open hydrates without a mismatch', async () => {
    const { errors } = await hydrate(dialog(false));
    expect(errors).toEqual([]);
  });

  // The vendor renders nothing until its own mount effect, so a dialog open on
  // the first render cannot mismatch either; this pins that down, and that the
  // dialog still lands in pulp's themed container rather than on <body>.
  it('DialogSystem with a dialog open on first render hydrates into its container', async () => {
    const { errors } = await hydrate(dialog(true));
    expect(errors).toEqual([]);
    const node = await vi.waitFor(() => {
      const found = document.querySelector('[role="dialog"]');
      if (!found) throw new Error('no dialog yet');
      return found;
    });
    expect(node.closest('[data-pulp-dialogs]')).not.toBeNull();
  });
});

// A Menu or Popover open on the first render used to read `document.body`
// during the server render and throw. It now renders closed on the server and
// opens one commit after hydration, moving focus in as it does on a click.
describe('overlays open on first render', () => {
  const menu = (props: { defaultOpen?: boolean; open?: boolean }) => (
    <Menu {...props}>
      <Menu.Trigger>More</Menu.Trigger>
      <Menu.Content>
        <Menu.Item>One</Menu.Item>
      </Menu.Content>
    </Menu>
  );
  const popover = (
    <Popover defaultOpen>
      <Popover.Trigger>Info</Popover.Trigger>
      <Popover.Content title="Details">
        <button type="button">Inside</button>
      </Popover.Content>
    </Popover>
  );

  it.each([
    ['Menu, defaultOpen', menu({ defaultOpen: true }), 'One'],
    ['Menu, controlled open', menu({ open: true }), 'One'],
    ['Popover, defaultOpen', popover, 'Inside'],
  ])('%s hydrates without a mismatch and opens after', async (_, tree, focused) => {
    const { errors } = await hydrate(tree);
    expect(errors).toEqual([]);
    const content = document.querySelector('[role="menu"], [role="dialog"]');
    expect(content?.parentElement).toBe(document.body);
    expect(content).toContainElement(document.activeElement as HTMLElement);
    expect(document.activeElement).toHaveAccessibleName(focused);
  });
});
