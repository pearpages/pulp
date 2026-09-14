import { useCallback, type KeyboardEvent } from 'react';

export interface RovingFocusOptions {
  /** Which arrow keys move: horizontal uses Left/Right, vertical Up/Down, both uses all four. */
  orientation?: 'horizontal' | 'vertical' | 'both';
  /** Selector for the items inside the container. Disabled items are skipped. */
  selector: string;
  /** Called with the item that received focus. */
  onFocusItem?: (item: HTMLElement) => void;
}

const isDisabled = (el: HTMLElement) =>
  el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';

/**
 * Keyboard navigation for a set of siblings that share one tab stop (tabs,
 * radio groups, menus): arrows move focus with wraparound, Home and End jump
 * to the ends, disabled items are skipped. Returns the keydown handler for the
 * container; the container decides which item carries `tabIndex={0}`.
 */
export function useRovingFocus({ orientation = 'horizontal', selector, onFocusItem }: RovingFocusOptions) {
  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(selector)).filter(
        (item) => !isDisabled(item),
      );
      if (items.length === 0) return;
      const current = items.indexOf(document.activeElement as HTMLElement);

      const next = (delta: number) => (current === -1 ? 0 : (current + delta + items.length) % items.length);
      const horizontal = orientation !== 'vertical';
      const vertical = orientation !== 'horizontal';

      let target: number | undefined;
      switch (event.key) {
        case 'ArrowRight':
          if (horizontal) target = next(1);
          break;
        case 'ArrowLeft':
          if (horizontal) target = next(-1);
          break;
        case 'ArrowDown':
          if (vertical) target = next(1);
          break;
        case 'ArrowUp':
          if (vertical) target = next(-1);
          break;
        case 'Home':
          target = 0;
          break;
        case 'End':
          target = items.length - 1;
          break;
      }
      if (target === undefined) return;

      event.preventDefault();
      const item = items[target];
      if (!item) return;
      item.focus();
      onFocusItem?.(item);
    },
    [orientation, selector, onFocusItem],
  );
}
