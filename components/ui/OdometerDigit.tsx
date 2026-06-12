'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

const SIZE_HEIGHT: Record<'sm' | 'md' | 'lg', string> = {
  sm: '1.5rem',
  md: '2.5rem',
  lg: '3.5rem',
};

const ODOMETER_EASING = 'cubic-bezier(0.15, 0.85, 0.35, 1.1)';
const FLASH_MS = 80;

export interface OdometerDigitProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  background?: 'transparent' | 'dark';
  'aria-live'?: 'polite' | 'off';
}

function clampDigit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(9, Math.max(0, Math.floor(value)));
}

function OdometerDigitInner({
  value,
  size = 'md',
  background = 'dark',
  'aria-live': ariaLive = 'off',
}: OdometerDigitProps) {
  const reducedMotion = usePrefersReducedMotion();
  const mounted = useRef(false);
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const digit = clampDigit(value);
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [flashing, setFlashing] = useState(false);
  const [skipTransition, setSkipTransition] = useState(true);

  const height = SIZE_HEIGHT[size];
  const bgColor = background === 'dark' ? '#0a0a0a' : 'transparent';

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setDisplayDigit(digit);
      return;
    }

    if (digit === displayDigit) return;

    if (reducedMotion) {
      setDisplayDigit(digit);
      return;
    }

    setSkipTransition(false);
    setDisplayDigit(digit);
  }, [digit, displayDigit, reducedMotion]);

  useEffect(() => {
    return () => {
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
    };
  }, []);

  const handleTransitionEnd = () => {
    if (reducedMotion || skipTransition) return;

    setFlashing(true);
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    flashTimeout.current = setTimeout(() => {
      setFlashing(false);
      flashTimeout.current = null;
    }, FLASH_MS);
  };

  const transition = reducedMotion || skipTransition
    ? 'none'
    : `transform 180ms ${ODOMETER_EASING}`;

  return (
    <span
      className="relative inline-block overflow-hidden align-top font-mono tabular-nums"
      style={{
        height,
        width: `calc(${height} * 0.62)`,
        border: '1px solid var(--border)',
        borderRadius: 0,
        backgroundColor: bgColor,
        color: flashing ? 'var(--accent)' : 'var(--paper)',
        fontVariantNumeric: 'tabular-nums',
      }}
      aria-live={ariaLive}
    >
      <span className="sr-only">{displayDigit}</span>
      <span
        aria-hidden
        className="block w-full"
        style={{
          height: '1000%',
          transition,
          transform: `translateY(-${displayDigit * 10}%)`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {DIGITS.map((d) => (
          <span
            key={d}
            className="flex items-center justify-center"
            style={{ height: '10%', lineHeight: 1, fontSize: height }}
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

export const OdometerDigit = memo(OdometerDigitInner);
