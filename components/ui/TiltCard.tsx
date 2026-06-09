'use client';

import Link from 'next/link';
import {
  useCallback,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';

const MAX_TILT = 8;

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  href?: string;
  'data-nearest'?: string;
}

export function TiltCard({ children, className = '', href, 'data-nearest': dataNearest }: TiltCardProps) {
  const reducedMotion = usePrefersReducedMotion();
  const cardRef = useRef<HTMLAnchorElement & HTMLDivElement>(null);
  const willChangeActive = useRef(false);

  const setWillChange = useCallback((active: boolean) => {
    const el = cardRef.current;
    if (!el) return;
    if (active && !willChangeActive.current) {
      el.style.willChange = 'transform';
      willChangeActive.current = true;
    } else if (!active && willChangeActive.current) {
      el.style.willChange = 'auto';
      willChangeActive.current = false;
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLAnchorElement | HTMLDivElement>) => {
      if (reducedMotion) return;
      const el = cardRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * MAX_TILT;
      const rotateX = ((rect.height / 2 - y) / (rect.height / 2)) * MAX_TILT;

      setWillChange(true);
      el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    },
    [reducedMotion, setWillChange],
  );

  const handleMouseLeave = useCallback(() => {
    if (reducedMotion) return;
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = '';
    setWillChange(false);
  }, [reducedMotion, setWillChange]);

  const motionStyle: CSSProperties = reducedMotion
    ? {}
    : { transition: 'transform 200ms ease' };

  const handlers = reducedMotion
    ? {}
    : { onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };

  if (href) {
    return (
      <div style={{ perspective: '600px' }} className="w-[220px] shrink-0 snap-start">
        <Link
          ref={cardRef as RefObject<HTMLAnchorElement>}
          href={href}
          data-nearest={dataNearest}
          className={className}
          style={motionStyle}
          {...handlers}
        >
          {children}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ perspective: '600px' }} className="w-[220px] shrink-0 snap-start">
      <div
        ref={cardRef as RefObject<HTMLDivElement>}
        data-nearest={dataNearest}
        className={className}
        style={motionStyle}
        {...handlers}
      >
        {children}
      </div>
    </div>
  );
}
