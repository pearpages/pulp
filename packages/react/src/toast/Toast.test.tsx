import { act, fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ToastProvider } from './Toast';
import { useToast, type ToastOptions } from './context';

function Trigger({ options }: { options: ToastOptions }) {
  const { toast, dismissAll } = useToast();
  return (
    <>
      <button type="button" onClick={() => toast(options)}>
        show
      </button>
      <button type="button" onClick={dismissAll}>
        clear
      </button>
    </>
  );
}

const setup = (options: ToastOptions, providerProps = {}) =>
  render(
    <ToastProvider {...providerProps}>
      <Trigger options={options} />
    </ToastProvider>,
  );

const show = () => fireEvent.click(screen.getByRole('button', { name: 'show' }));
const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('Toast', () => {
  // Events are fired synchronously and timers advanced by hand, so the tests
  // do not depend on how user-event integrates with fake timers.
  beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] }));
  afterEach(() => vi.useRealTimers());

  it('throws outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger options={{ title: 'x' }} />)).toThrow(/inside <ToastProvider>/);
    spy.mockRestore();
  });

  it('shows a toast in a polite region owned by the provider and auto-dismisses it', () => {
    setup({ title: 'Saved', description: 'All good.' });
    const region = screen.getByRole('region', { name: 'Notifications' });
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(document.body.querySelector('[data-pulp-toasts]')).toContainElement(region);
    show();
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('All good.')).toBeInTheDocument();
    tick(5999);
    expect(screen.getByText('Saved')).toBeInTheDocument();
    tick(1);
    expect(screen.queryByText('Saved')).toBeNull();
  });

  it('keeps error toasts until dismissed', () => {
    setup({ title: 'Failed', tone: 'error' });
    show();
    tick(60000);
    expect(screen.getByText('Failed')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Failed')).toBeNull();
  });

  it('pauses while hovered and while it holds focus', () => {
    setup({ title: 'Hover me', duration: 1000 });
    show();
    const region = screen.getByRole('region');
    fireEvent.mouseEnter(region);
    tick(5000);
    expect(screen.getByText('Hover me')).toBeInTheDocument();
    fireEvent.mouseLeave(region);
    tick(999);
    expect(screen.getByText('Hover me')).toBeInTheDocument();
    tick(1);
    expect(screen.queryByText('Hover me')).toBeNull();

    show();
    act(() => screen.getByRole('button', { name: 'Dismiss' }).focus());
    tick(5000);
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('caps the stack and dismisses the oldest', () => {
    setup({ title: 'T', duration: Infinity }, { max: 2 });
    show();
    show();
    show();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'clear' }));
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('runs the action and dismisses; Escape dismisses the focused toast', () => {
    const onClick = vi.fn();
    setup({ title: 'Undo?', duration: Infinity, action: { label: 'Undo', onClick } });
    show();
    show();
    fireEvent.click(screen.getAllByRole('button', { name: 'Undo' })[0]!);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    const dismiss = screen.getByRole('button', { name: 'Dismiss' });
    act(() => dismiss.focus());
    fireEvent.keyDown(dismiss, { key: 'Escape' });
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});

describe('Toast accessibility', () => {
  it('has no violations with toasts shown', async () => {
    setup({ title: 'Info', description: 'Body', duration: Infinity, action: { label: 'Open', onClick: () => {} } });
    show();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
