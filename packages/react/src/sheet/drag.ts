/**
 * When a dragged bottom sheet should close on release. Ported from bitepals'
 * `shouldDismiss()` with its thresholds and its test cases: past a quarter of
 * the sheet's height, or a flick faster than 500 px/s, downwards only.
 */
const DISMISS_DISTANCE_RATIO = 0.25;
const DISMISS_DISTANCE_FALLBACK_PX = 120;
const DISMISS_VELOCITY_PX_PER_S = 500;

export interface DismissInput {
  /** How far the sheet has been dragged down, in px. Zero or negative never dismisses. */
  offsetY: number;
  /** Downward speed at release, in px/s. */
  velocityY: number;
  /** The sheet's height in px; 0 when it cannot be measured, which falls back to a fixed distance. */
  panelHeight: number;
  distanceRatio?: number;
  distanceFallbackPx?: number;
  velocityThreshold?: number;
}

export function shouldDismiss({
  offsetY,
  velocityY,
  panelHeight,
  distanceRatio = DISMISS_DISTANCE_RATIO,
  distanceFallbackPx = DISMISS_DISTANCE_FALLBACK_PX,
  velocityThreshold = DISMISS_VELOCITY_PX_PER_S,
}: DismissInput): boolean {
  if (offsetY <= 0) return false;
  const distanceThreshold = panelHeight > 0 ? panelHeight * distanceRatio : distanceFallbackPx;
  return offsetY > distanceThreshold || velocityY > velocityThreshold;
}

/** Speed over the last ~100 ms of samples, in px/s: the release flick, not the average of the whole drag. */
export function releaseVelocity(samples: ReadonlyArray<{ time: number; y: number }>, windowMs = 100): number {
  const last = samples[samples.length - 1];
  if (!last) return 0;
  const first = samples.find((sample) => last.time - sample.time <= windowMs) ?? last;
  const elapsed = last.time - first.time;
  return elapsed > 0 ? ((last.y - first.y) / elapsed) * 1000 : 0;
}
