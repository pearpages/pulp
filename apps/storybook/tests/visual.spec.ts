import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { expect, test } from '@playwright/test';

type Entry = { id: string; type: string; name: string; importPath: string };
const index = JSON.parse(readFileSync(resolve(import.meta.dirname, '../storybook-static/index.json'), 'utf8')) as { entries: Record<string, Entry> };
// Only the matrix stories are shot: they are the brand × scheme surface of every component.
const shots = Object.values(index.entries).filter((entry) => entry.type === 'story' && entry.name.startsWith('Matrix'));

test.skip(!process.env.PULP_VISUAL, 'CI owns the baselines: set PULP_VISUAL=1 to compare (on Linux) or update them.');

for (const story of shots) {
  const component = basename(story.importPath).replace(/\.stories\.tsx$/, '');
  test(`${component}: ${story.name}`, async ({ page }) => {
    // Calendar and DatePicker tint "today" from the real clock. Date only; timers stay real.
    await page.clock.setFixedTime(new Date('2026-09-14T12:00:00'));
    // Off from before the first render, not paused afterwards: Chromium keeps text it rasterised
    // while its layer was animating, so a toast that slid in differed from run to run.
    await page.addInitScript(() => {
      const still = document.createElement('style');
      still.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; }';
      document.addEventListener('DOMContentLoaded', () => document.head.append(still));
    });
    await page.goto(`/iframe.html?viewMode=story&id=${story.id}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.body.classList.contains('sb-show-main') && (document.querySelector('#storybook-root')?.childElementCount ?? 0) > 0);

    const state = await page.evaluate(async () => {
      await document.fonts.ready;
      // A `play` that opens an overlay ends before React Aria has moved focus into it: wait until
      // focus has stayed put for ten frames, give up after a second.
      const frame = () => new Promise<void>((done) => requestAnimationFrame(() => done()));
      let last = document.activeElement;
      for (let calm = 0, frames = 0; calm < 10 && frames < 60; frames += 1) {
        await frame();
        if (document.activeElement === last) calm += 1;
        else [calm, last] = [0, document.activeElement];
      }
      const preview = (window as unknown as { __STORYBOOK_PREVIEW__?: { currentRender?: { story?: { parameters?: { a11y?: { context?: string } } } } } }).__STORYBOOK_PREVIEW__;
      const { brand, scheme } = document.documentElement.dataset;
      return { brand, scheme, portals: preview?.currentRender?.story?.parameters?.a11y?.context === 'body' };
    });
    expect(state.brand, 'the story sets a brand on <html>').toBeTruthy();

    // A pointer left over a control would paint its hover state.
    await page.mouse.move(0, 0);
    // Overlays portal out of the canvas. Those components already say so for axe.
    const target = state.portals ? page.locator('body') : page.locator('#storybook-root');
    await expect(target).toHaveScreenshot([component, `${state.brand}-${state.scheme}.png`]);
  });
}
