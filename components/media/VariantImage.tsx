'use client';

import Image, { type ImageProps } from 'next/image';
import { variantLoader } from './variantLoader';

type VariantImageProps = Omit<ImageProps, 'loader' | 'unoptimized'> & {
  /** Stored widths of the asset; more than one gives the image a srcset through `variantLoader`. */
  variants: ReadonlyArray<{ w: number; src: string }>;
};

/**
 * `next/image` with the media variant loader, for Server Components: a loader is a
 * function and cannot cross the server/client boundary, so it is built here from the
 * serializable variant list. A single variant is served as is (`unoptimized`).
 */
export function VariantImage({ variants, alt, ...rest }: VariantImageProps) {
  return (
    <Image
      {...rest}
      alt={alt}
      {...(variants.length > 1 ? { loader: variantLoader(variants) } : { unoptimized: true })}
    />
  );
}
