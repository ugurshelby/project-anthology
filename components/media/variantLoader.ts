import type { ImageLoader } from 'next/image';

/** Smallest variant at least `width` wide (else the largest): a fixed-size loader. */
export function variantLoader(variants: ReadonlyArray<{ w: number; src: string }>): ImageLoader {
  const sorted = [...variants].sort((a, b) => a.w - b.w);
  return ({ width }) => (sorted.find((v) => v.w >= width) ?? sorted[sorted.length - 1]).src;
}
