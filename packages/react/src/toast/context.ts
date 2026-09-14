import { createContext, useContext, type ReactNode } from 'react';
import type { AlertTone } from '../alert';

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  /** @default 'info' */
  tone?: AlertTone;
  /** Milliseconds before auto-dismiss; `Infinity` keeps it until dismissed. Errors default to `Infinity`. */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

export interface ToastItem extends ToastOptions {
  id: string;
}

export interface ToastContextValue {
  /** Shows a toast and returns its id. */
  toast: (options: ToastOptions) => string;
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
