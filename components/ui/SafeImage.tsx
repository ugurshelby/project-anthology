'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

const PLACEHOLDER = '/placeholder.svg';

type SafeImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src: string;
  alt: string;
};

export function SafeImage({ src, alt, onError, ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
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
