import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Alert } from '../alert';
import { Button } from '../button';
import { classes } from '../internal/classes';
import { ToastContext, type ToastFunction, type ToastItem, type ToastOptions, type ToastUndoOptions } from './context';

/** An undo toast asks for a decision and a reach, so it outlasts the default. */
const UNDO_DURATION = 8000;
import styles from './Toast.module.css';

export type ToastPlacement = 'bottom-end' | 'top-end' | 'top-center';

export interface ToastProviderProps {
  /** @default 'bottom-end' */
  placement?: ToastPlacement;
  /** Most toasts shown at once; the oldest is dismissed first. @default 5 */
  max?: number;
  /** Default auto-dismiss time in milliseconds. @default 6000 */
  duration?: number;
  /** Accessible name of the region. @default 'Notifications' */
  label?: string;
  children: ReactNode;
}

interface Timer {
  remaining: number;
  startedAt: number;
  handle: ReturnType<typeof setTimeout> | undefined;
}

/**
 * Mount once near the app root. Owns a portal element with a polite live
 * region; `useToast()` adds notifications to it. Timers pause while the
 * region is hovered or holds focus, Escape dismisses the focused toast, and
 * error toasts stay until dismissed. Each toast is an Alert.
 * `toast.undo(message, onUndo)` is the shorthand for a reversible action.
 *
 * @status stable
 * @category Feedback
 * @accessibility Owns a `region` named "Notifications" with `aria-live="polite"`; each toast is an Alert with its live role off (the region announces). Timers pause while the region is hovered or holds focus; Escape dismisses the focused toast; error toasts stay until dismissed.
 * @do Mount it once near the app root.
 * Keep messages to one sentence; put detail behind an `action`.
 * @dont Use a toast for an error the user must fix in a form; show it at the field.
 * Stack more than a few; the cap drops the oldest.
 */
export function ToastProvider({ placement = 'bottom-end', max = 5, duration = 6000, label = 'Notifications', children }: ToastProviderProps) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [paused, setPaused] = useState(false);
  const timers = useRef(new Map<string, Timer>());
  const counter = useRef(0);

  const [container] = useState<HTMLDivElement | undefined>(() => {
    if (typeof document === 'undefined') return undefined;
    const element = document.createElement('div');
    element.dataset.pulpToasts = '';
    return element;
  });

  useEffect(() => {
    if (!container) return;
    document.body.append(container);
    return () => container.remove();
  }, [container]);

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer?.handle !== undefined) clearTimeout(timer.handle);
    timers.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    for (const timer of timers.current.values()) if (timer.handle !== undefined) clearTimeout(timer.handle);
    timers.current.clear();
    setItems([]);
  }, []);

  const start = useCallback(
    (id: string, remaining: number) => {
      if (!Number.isFinite(remaining)) return;
      timers.current.set(id, { remaining, startedAt: Date.now(), handle: setTimeout(() => dismiss(id), remaining) });
    },
    [dismiss],
  );

  const toast = useCallback(
    (options: ToastOptions) => {
      counter.current += 1;
      const id = `toast-${counter.current}`;
      const ttl = options.duration ?? (options.tone === 'error' ? Infinity : duration);
      setItems((current) => {
        const next = [...current, { ...options, id }];
        const overflow = next.length - max;
        if (overflow > 0) {
          for (const old of next.slice(0, overflow)) {
            const timer = timers.current.get(old.id);
            if (timer?.handle !== undefined) clearTimeout(timer.handle);
            timers.current.delete(old.id);
          }
          return next.slice(overflow);
        }
        return next;
      });
      if (!paused) start(id, ttl);
      else timers.current.set(id, { remaining: ttl, startedAt: Date.now(), handle: undefined });
      return id;
    },
    [duration, max, paused, start],
  );

  // Pause: freeze every timer with its remaining time. Resume: restart them.
  useEffect(() => {
    const map = timers.current;
    if (paused) {
      for (const [id, timer] of map) {
        if (timer.handle === undefined) continue;
        clearTimeout(timer.handle);
        map.set(id, { ...timer, remaining: Math.max(0, timer.remaining - (Date.now() - timer.startedAt)), handle: undefined });
      }
    } else {
      for (const [id, timer] of map) {
        if (timer.handle !== undefined || !Number.isFinite(timer.remaining)) continue;
        map.set(id, { ...timer, startedAt: Date.now(), handle: setTimeout(() => dismiss(id), timer.remaining) });
      }
    }
  }, [paused, dismiss]);

  useEffect(() => {
    const map = timers.current;
    return () => {
      for (const timer of map.values()) if (timer.handle !== undefined) clearTimeout(timer.handle);
    };
  }, []);

  const value = useMemo(() => {
    const undo = (message: ReactNode, onUndo: () => void, { label = 'Undo', duration: ttl = UNDO_DURATION, ...options }: ToastUndoOptions = {}) =>
      toast({ ...options, title: message, duration: ttl, action: { label, onClick: onUndo } });
    // `toast(options)` and `toast.undo(…)`: a function with a property. The rule sees callbacks that
    // touch refs being handed to a function; Object.assign only copies them, nothing runs during render.
    // eslint-disable-next-line react-hooks/refs -- composed, not called
    const api: ToastFunction = Object.assign((options: ToastOptions) => toast(options), { undo });
    return { toast: api, dismiss, dismissAll };
  }, [toast, dismiss, dismissAll]);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape') return;
    const item = (event.target as HTMLElement).closest<HTMLElement>('[data-toast-id]');
    if (item?.dataset.toastId) {
      event.preventDefault();
      dismiss(item.dataset.toastId);
    }
  };

  const region = (
    <section
      role="region"
      aria-label={label}
      aria-live="polite"
      className={classes(styles.region)}
      data-placement={placement}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      onKeyDown={onKeyDown}
    >
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item} data-toast-id={item.id} data-tone={item.tone ?? 'info'}>
            <Alert
              tone={item.tone}
              title={item.title}
              live="off"
              className={styles.toast}
              onDismiss={() => dismiss(item.id)}
              action={
                item.action && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      item.action?.onClick();
                      dismiss(item.id);
                    }}
                  >
                    {item.action.label}
                  </Button>
                )
              }
            >
              {item.description}
            </Alert>
          </li>
        ))}
      </ol>
    </section>
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {container ? createPortal(region, container) : null}
    </ToastContext.Provider>
  );
}

ToastProvider.displayName = 'ToastProvider';
