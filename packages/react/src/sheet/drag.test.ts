import { releaseVelocity, shouldDismiss } from './drag';

// The cases of bitepals' animated-bottom-sheet.test.tsx, where these thresholds were tuned on devices.
describe('shouldDismiss', () => {
  const panelHeight = 400;

  it('never dismisses on a drag up, whatever the speed', () => {
    expect(shouldDismiss({ offsetY: 0, velocityY: 0, panelHeight })).toBe(false);
    expect(shouldDismiss({ offsetY: -50, velocityY: 0, panelHeight })).toBe(false);
    expect(shouldDismiss({ offsetY: -50, velocityY: 9999, panelHeight })).toBe(false);
  });

  it('dismisses past a quarter of the sheet height', () => {
    expect(shouldDismiss({ offsetY: 101, velocityY: 0, panelHeight })).toBe(true);
    expect(shouldDismiss({ offsetY: 99, velocityY: 0, panelHeight })).toBe(false);
    expect(shouldDismiss({ offsetY: 99, velocityY: 499, panelHeight })).toBe(false);
  });

  it('dismisses on a flick faster than 500 px/s, strictly', () => {
    expect(shouldDismiss({ offsetY: 5, velocityY: 501, panelHeight })).toBe(true);
    expect(shouldDismiss({ offsetY: 5, velocityY: 500, panelHeight })).toBe(false);
  });

  it('falls back to 120 px when the height cannot be measured', () => {
    expect(shouldDismiss({ offsetY: 121, velocityY: 0, panelHeight: 0 })).toBe(true);
    expect(shouldDismiss({ offsetY: 120, velocityY: 0, panelHeight: 0 })).toBe(false);
  });

  it('honours custom thresholds', () => {
    expect(shouldDismiss({ offsetY: 30, velocityY: 0, panelHeight, distanceRatio: 0.05 })).toBe(true);
    expect(shouldDismiss({ offsetY: 5, velocityY: 100, panelHeight, velocityThreshold: 50 })).toBe(true);
    expect(shouldDismiss({ offsetY: 130, velocityY: 0, panelHeight: 0, distanceFallbackPx: 200 })).toBe(false);
  });
});

describe('releaseVelocity', () => {
  it('measures the last 100 ms, not the whole drag', () => {
    // A slow 1 s pull, then a 60 px flick in the last 100 ms: 600 px/s.
    const samples = [
      { time: 0, y: 0 },
      { time: 1000, y: 20 },
      { time: 1050, y: 50 },
      { time: 1100, y: 80 },
    ];
    expect(releaseVelocity(samples)).toBeCloseTo(600);
  });

  it('is zero for one sample, none, or no elapsed time', () => {
    expect(releaseVelocity([])).toBe(0);
    expect(releaseVelocity([{ time: 5, y: 10 }])).toBe(0);
    expect(releaseVelocity([{ time: 5, y: 10 }, { time: 5, y: 90 }])).toBe(0);
  });

  it('is negative for an upward release', () => {
    expect(releaseVelocity([{ time: 0, y: 100 }, { time: 50, y: 60 }])).toBeLessThan(0);
  });
});
