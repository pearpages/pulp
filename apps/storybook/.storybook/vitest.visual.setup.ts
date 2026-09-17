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
  /**
   * Before a story renders. Pins "today" (Calendar and DatePicker tint the current day from the real
   * clock) and, for a story that will be shot, switches animations and transitions off.
   */
  prepare(shot: boolean): () => void;
}

declare global {
  var __pulpVisual: VisualBridge | undefined;
}

// The addon registers this command; a pointer left over a control would paint its hover state.
const resetMouse = (commands as unknown as { resetMousePosition?: () => Promise<void> }).resetMousePosition;

const frame = () => new Promise<void>((done) => requestAnimationFrame(() => done()));

// A `play` that opens an overlay ends before React Aria has moved focus into it, so the trigger's
// focus ring was in some shots and not in others (DatePicker 1 in 5, Combobox now and then, each
// hidden by the retry). Wait until focus has stayed put for ten frames; give up after a second.
async function focusSettled() {
  let last = document.activeElement;
  for (let calm = 0, frames = 0; calm < 10 && frames < 60; frames += 1) {
    await frame();
    if (document.activeElement === last) calm += 1;
    else [calm, last] = [0, document.activeElement];
  }
}

if (import.meta.env.VITE_VISUAL) {
  globalThis.__pulpVisual = {
    async match(target, name) {
      await document.fonts.ready;
      await resetMouse?.();
      await focusSettled();
      // Bounded: expect.element retries a failing matcher, and unbounded it retried a *real* mismatch
      // until the test timed out — CI showed "timed out in 15000ms", no diff, and an "actual" shot
      // taken by the abandoned attempt during the next story. Now a mismatch fails with its message.
      await expect.element(target, { timeout: 4000 }).toMatchScreenshot(name);
    },
    prepare(shot) {
      // Date only: timers stay real, so toasts, tooltips and user-event behave as they do for a reader.
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-09-14T12:00:00'));
      // Off from before the first render, not paused afterwards: Chromium keeps text it rasterised
      // while its layer was animating, so a toast that slid in rendered one line differently from
      // run to run (3 of 5 on Linux x64). Only for stories that are shot: Combobox's interaction
      // story fails every time without its transitions.
      const still = shot ? document.createElement('style') : null;
      if (still) {
        still.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; }';
        document.head.append(still);
      }
      return () => {
        still?.remove();
        vi.useRealTimers();
      };
    },
  };
}
