import { useEffect, useRef } from 'react';

interface DismissOptions {
  open: boolean;
  onDismiss: () => void;
  /** Elements that count as "inside": a pointer down within them does not dismiss. */
  inside: () => Array<Element | null | undefined>;
}

/** Closes an overlay on Escape or on a pointer down outside its elements. */
export function useDismiss({ open, onDismiss, inside }: DismissOptions) {
  const latest = useRef({ onDismiss, inside });
  useEffect(() => {
    latest.current = { onDismiss, inside };
  });

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (latest.current.inside().some((element) => element?.contains(target))) return;
      latest.current.onDismiss();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      latest.current.onDismiss();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);
}
