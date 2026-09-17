// Loaded by the Vitest run only (vitest.config.ts `setupFiles`), never by Storybook itself, so it
// may import from `vitest`. It hands the preview's visual-regression hook what it needs through
// one global, and only when VITE_VISUAL is set: CI sets it, because CI owns the baselines. Text
// rasterises differently on macOS and on Linux (and on arm64 and x64), so a baseline made on a
// laptop never matches the runner; locally the hook stays inert and the stories run as before.
import { expect, vi } from 'vitest';
import { commands } from 'vitest/browser';

export interface VisualBridge {
  /** Compare the element with `visual-baselines/<Component>/<name>.png`. */
  match(target: Element, name: string): Promise<void>;
  /** Pin "today": Calendar and DatePicker tint the current day from the real clock. */
  freezeDate(): () => void;
}

declare global {
  var __pulpVisual: VisualBridge | undefined;
}

// The addon registers this command; a pointer left over a control would paint its hover state.
const resetMouse = (commands as unknown as { resetMousePosition?: () => Promise<void> }).resetMousePosition;

if (import.meta.env.VITE_VISUAL) {
  globalThis.__pulpVisual = {
    async match(target, name) {
      await document.fonts.ready;
      await resetMouse?.();
      await expect.element(target).toMatchScreenshot(name);
    },
    freezeDate() {
      // Date only: timers stay real, so toasts, tooltips and user-event behave as they do for a reader.
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-09-14T12:00:00'));
      return () => vi.useRealTimers();
    },
  };
}
