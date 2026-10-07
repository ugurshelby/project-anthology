'use client';

import Image, { type ImageLoader, type ImageProps } from 'next/image';
import { useState } from 'react';
import { ApexFallback, type ApexFallbackKind } from '@/components/media/ApexFallback';

type Props = Omit<ImageProps, 'src' | 'alt'> & {
  src?: string | null;
  alt: string;
  kind?: ApexFallbackKind;
  fallbackLabel?: string;
  /**
   * Pre-sized copies of `src` (the media system's WebP variants). When given,
   * the browser picks the smallest one that fits `sizes` instead of always
   * downloading the largest file.
   */
  variants?: ReadonlyArray<{ w: number; src: string }>;
};

/** Smallest variant at least `width` wide (else the largest): a fixed-size loader. */
function variantLoader(variants: ReadonlyArray<{ w: number; src: string }>): ImageLoader {
  const sorted = [...variants].sort((a, b) => a.w - b.w);
  return ({ width }) => (sorted.find((v) => v.w >= width) ?? sorted[sorted.length - 1]).src;
}

/**
 * next/image with APEX fallback — missing/null src or load error shows the
 * wireframe surface instead of a broken icon or empty black box.
 */
export function ApexImage({
  src,
  alt,
  kind = 'media',
  fallbackLabel,
  className = '',
  variants,
  ...rest
}: Props) {
  const [failed, setFailed] = useState(false);
  const usable = Boolean(src) && !failed;

  if (!usable) {
    return <ApexFallback kind={kind} label={fallbackLabel} className={className} />;
  }

  const isExternal = typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'));
  const loader = variants && variants.length > 1 ? variantLoader(variants) : undefined;

  return (
    <Image
      {...rest}
      src={src as string}
      alt={alt}
      loader={loader}
      unoptimized={loader ? false : (rest.unoptimized ?? isExternal)}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
