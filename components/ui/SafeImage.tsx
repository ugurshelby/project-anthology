'use client';

import Image, { type ImageProps } from 'next/image';
import { useState, type ReactNode } from 'react';

const PLACEHOLDER = '/placeholder.svg';

type SafeImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src: string;
  alt: string;
  /**
   * Rendered instead of the generic placeholder when the image fails to load
   * (e.g. a historical driver/team SVG that 404s). Lets callers degrade to a
   * branded fallback chip rather than the favicon placeholder.
   */
  fallbackNode?: ReactNode;
};

export function SafeImage({ src, alt, onError, fallbackNode, ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if ((failed || !src) && fallbackNode !== undefined) {
    return <>{fallbackNode}</>;
  }

  const resolved = failed || !src ? PLACEHOLDER : src;

  return (
    <Image
      {...props}
      src={resolved}
      alt={alt}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
    />
  );
}
