'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { ApexFallback, type ApexFallbackKind } from '@/components/media/ApexFallback';
import { variantLoader } from '@/components/media/variantLoader';
import { hasPublisherSizes, publisherImageLoader } from '@/lib/news/imageVariants';

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

/**
 * next/image with APEX fallback — missing/null src or load error shows the
 * wireframe surface instead of a broken icon or empty black box.
 *
 * Sizing: media-system images use their WebP `variants`; external news
 * images from publishers with a size scheme (lib/news/imageVariants.ts) get
 * a loader that asks the publisher's CDN for the width the layout needs, so
 * a 64 px thumbnail no longer downloads a 1200 px press photo. Other external
 * images stay unoptimised (never proxied or copied).
 *
 * While loading, the box shows a soft shimmer (`.apex-img-loading`, static
 * under reduced motion) instead of an empty dark rectangle.
 */
export function ApexImage({
  src,
  alt,
  kind = 'media',
  fallbackLabel,
  className = '',
  variants,
  priority,
  ...rest
}: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const usable = Boolean(src) && !failed;

  if (!usable) {
    return <ApexFallback kind={kind} label={fallbackLabel} className={className} />;
  }

  const isExternal = typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'));
  const loader =
    variants && variants.length > 1
      ? variantLoader(variants)
      : isExternal && hasPublisherSizes(src)
        ? publisherImageLoader
        : undefined;
  const { onLoad, ...imageProps } = rest;

  return (
    <Image
      {...imageProps}
      {...(priority ? { fetchPriority: 'high' as const, loading: 'eager' as const } : {})}
      src={src as string}
      alt={alt}
      loader={loader}
      unoptimized={loader ? false : (rest.unoptimized ?? isExternal)}
      className={loaded ? className : `${className} apex-img-loading`}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      onError={() => setFailed(true)}
    />
  );
}
