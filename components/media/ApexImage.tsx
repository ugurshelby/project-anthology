'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { ApexFallback, type ApexFallbackKind } from '@/components/media/ApexFallback';

type Props = Omit<ImageProps, 'src' | 'alt'> & {
  src?: string | null;
  alt: string;
  kind?: ApexFallbackKind;
  fallbackLabel?: string;
};

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
  ...rest
}: Props) {
  const [failed, setFailed] = useState(false);
  const usable = Boolean(src) && !failed;

  if (!usable) {
    return <ApexFallback kind={kind} label={fallbackLabel} className={className} />;
  }

  return (
    <Image
      {...rest}
      src={src as string}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
