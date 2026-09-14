import '@testing-library/jest-dom/vitest';
import * as axeMatchers from 'vitest-axe/matchers';
import type { AxeMatchers } from 'vitest-axe/matchers';
import { expect } from 'vitest';

expect.extend(axeMatchers);

// vitest-axe ships its augmentation for the legacy `Vi` namespace; vitest 4
// reads matchers from the `vitest` module, so declare it here.
declare module 'vitest' {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
