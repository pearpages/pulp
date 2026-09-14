import { autoUpdate, flip, offset, shift, useFloating, type Placement } from '@floating-ui/react-dom';
import type { CSSProperties } from 'react';

export type FloatingPlacement = Extract<
  Placement,
  'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
>;

/**
 * Positions a floating element next to a reference: flips when there is no
 * room, shifts to stay in the viewport, updates on scroll and resize. The
 * gap is read from the floating element's `--_gap` custom property, so it is
 * a token, not a number in code. Returns the position as two custom
 * properties (`--_x`, `--_y`): the one per-instance inline value overlays
 * need, consumed by `inset-*` in the stylesheet.
 *
 * Positioning is delegated to @floating-ui/react-dom; CSS anchor positioning
 * replaces it once the browser floor includes it.
 */
export function useFloatingPosition({ open, placement = 'bottom-start' }: { open: boolean; placement?: FloatingPlacement }) {
  const { refs, x, y, placement: resolved, isPositioned } = useFloating({
    open,
    placement,
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(({ elements }) => parseFloat(getComputedStyle(elements.floating).getPropertyValue('--_gap')) || 0),
      flip(),
      shift({ padding: 8 }),
    ],
  });
  const positionStyle = { '--_x': `${Math.round(x)}px`, '--_y': `${Math.round(y)}px` } as CSSProperties;
  return { refs, positionStyle, placement: resolved, isPositioned };
}
