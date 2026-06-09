'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useInViewOnce } from '@/components/ui/useInViewOnce';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';

interface AnimatedBarGroupProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedBarGroup({ children, className = '' }: AnimatedBarGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const inView = useInViewOnce(ref, { threshold: 0.3 });
  const active = inView || reducedMotion;

  return (
    <div
      ref={ref}
      className={`${className}${active ? ' standings-bars-active' : ''}${reducedMotion ? ' standings-bars-reduced' : ''}`.trim()}
    >
      {children}
    </div>
  );
}

interface AnimatedBarProps {
  barSize: string;
  color: string;
  index: number;
  axis?: 'horizontal' | 'vertical';
  trackClassName?: string;
}

export function AnimatedBar({
  barSize,
  color,
  index,
  axis = 'horizontal',
  trackClassName = '',
}: AnimatedBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;

    const onStart = () => {
      el.style.willChange = axis === 'horizontal' ? 'width' : 'height';
    };
    const onEnd = () => {
      el.style.willChange = 'auto';
    };

    el.addEventListener('transitionstart', onStart);
    el.addEventListener('transitionend', onEnd);
    return () => {
      el.removeEventListener('transitionstart', onStart);
      el.removeEventListener('transitionend', onEnd);
    };
  }, [axis]);

  const fillStyle: CSSProperties & { '--bar-size': string; '--i': number } = {
    '--bar-size': barSize,
    '--i': index,
    backgroundColor: color,
  };

  // Decorative: the numeric value/points is always rendered as adjacent text by
  // callers, so the bar is visual reinforcement only — hidden from AT to avoid
  // a redundant, value-less announcement.
  if (axis === 'vertical') {
    return (
      <div
        ref={fillRef}
        aria-hidden
        className={`standings-bar-fill standings-bar-fill--vertical w-full ${trackClassName}`.trim()}
        style={fillStyle}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`h-1.5 w-full ${trackClassName}`.trim()}
      style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
    >
      <div ref={fillRef} className="standings-bar-fill h-full" style={fillStyle} />
    </div>
  );
}
