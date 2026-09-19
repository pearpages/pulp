import { createContext, useContext, type ReactNode } from 'react';
import type { AlertTone } from '../alert';

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  /** @default 'info' */
  tone?: AlertTone;
  /** Milliseconds before auto-dismiss; `Infinity` keeps it until dismissed. Errors default to `Infinity`. */
  duration?: number;
  /** One button inside the toast. Pressing it runs `onClick` and dismisses the toast. It never takes focus. */
  action?: { label: string; onClick: () => void };
}

export interface ToastUndoOptions extends Pick<ToastOptions, 'description' | 'tone'> {
  /** The button's label, for other languages. @default 'Undo' */
  label?: string;
  /** Longer than an ordinary toast by default (8 s): there is something to read, decide and reach. */
  duration?: number;
}

export interface ToastFunction {
  /** Shows a toast and returns its id. */
  (options: ToastOptions): string;
  /**
   * The named case for a reversible action: "Place removed" with an Undo
   * button. Pressing it runs `onUndo` and dismisses; letting it time out
   * does nothing, so do the work first and undo it on request.
   */
  undo: (message: ReactNode, onUndo: () => void, options?: ToastUndoOptions) => string;
}

export interface ToastItem extends ToastOptions {
  id: string;
}

export interface ToastContextValue {
  /** Shows a toast and returns its id. `toast.undo(message, onUndo)` is the reversible-action shorthand. */
  toast: ToastFunction;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

/** The toast API. Must be used inside `ToastProvider`. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
