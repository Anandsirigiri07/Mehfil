/* eslint-disable @typescript-eslint/no-unused-vars */
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';

expect.extend(toHaveNoViolations);

interface CustomMatchers<R = unknown> {
  toHaveNoViolations(): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<
    R extends void | Promise<void> = void,
    T = unknown,
  > extends CustomMatchers<R> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
