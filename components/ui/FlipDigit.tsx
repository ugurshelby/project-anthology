'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';

interface FlipDigitProps {
  digit: string;
}

const FLIP_EASING = 'cubic-bezier(0.77, 0, 0.18, 1)';

function FlipDigitInner({ digit }: FlipDigitProps) {
  const reducedMotion = usePrefersReducedMotion();
  const mounted = useRef(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const [current, setCurrent] = useState(digit);
  const [previous, setPrevious] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setCurrent(digit);
      return;
    }

    if (digit === current) return;

    if (reducedMotion) {
      setCurrent(digit);
      setPrevious(null);
      setActive(false);
      return;
    }

    setPrevious(current);
    setCurrent(digit);
    setActive(false);
    if (containerRef.current) containerRef.current.style.willChange = 'transform';

    const frame = requestAnimationFrame(() => {
      setActive(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [digit, current, reducedMotion]);

  const handleTransitionEnd = () => {
    setPrevious(null);
    setActive(false);
    if (containerRef.current) containerRef.current.style.willChange = 'auto';
  };

  const transition = reducedMotion ? 'none' : `transform 300ms ${FLIP_EASING}`;

  return (
    <span
      ref={containerRef}
      className="relative inline-block overflow-hidden align-top"
      style={{ height: '1em', width: '0.55em' }}
    >
      {previous !== null ? (
        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transition,
            transform: active ? 'translateY(-100%)' : 'translateY(0)',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {previous}
        </span>
      ) : null}
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transition,
          transform: previous !== null ? (active ? 'translateY(0)' : 'translateY(100%)') : 'translateY(0)',
        }}
      >
        {current}
      </span>
    </span>
  );
}

export const FlipDigit = memo(FlipDigitInner);
