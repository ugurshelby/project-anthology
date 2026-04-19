import React from 'react';

/** One full `chip-circuit-flow` cycle is 3s; small buffer so the loop completes visibly. */
export const CHIP_CIRCUIT_LOADER_MIN_MS = 3100;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function lazyWithMinDisplay<T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  minDisplayMs: number
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    const started = performance.now();
    const mod = await importFn();
    const elapsed = performance.now() - started;
    if (elapsed < minDisplayMs) {
      await sleep(minDisplayMs - elapsed);
    }
    return mod;
  });
}
