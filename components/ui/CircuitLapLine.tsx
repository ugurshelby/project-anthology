'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import { useInViewOnce } from '@/components/ui/useInViewOnce';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';
import { useWillChange } from '@/components/ui/useWillChange';

interface CircuitLapLineProps {
  svgSrc: string;
  alt: string;
  /** Optional accent colour for the moving dot — defaults to #ff1801 */
  dotColor?: string;
}

interface ParsedSvg {
  viewBox: string;
  pathD: string;
}

function parseCircuitSvg(svgText: string): ParsedSvg | null {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  const path = doc.querySelector('path');
  if (!svg || !path) return null;
  const pathD = path.getAttribute('d');
  if (!pathD) return null;
  return {
    viewBox: svg.getAttribute('viewBox') ?? '0 0 800 600',
    pathD,
  };
}

export function CircuitLapLine({ svgSrc, alt, dotColor = '#ff1801' }: CircuitLapLineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lapPathRef = useRef<SVGPathElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const inView = useInViewOnce(containerRef, { threshold: 0.2 });
  const { willChange, onStart, onEnd } = useWillChange('stroke-dashoffset');

  const [parsed, setParsed] = useState<ParsedSvg | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [pathLength, setPathLength] = useState(2000);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadFailed(false);
    setParsed(null);

    fetch(svgSrc)
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed');
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        const result = parseCircuitSvg(text);
        if (!result) {
          setLoadFailed(true);
          return;
        }
        setParsed(result);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [svgSrc]);

  useEffect(() => {
    const path = lapPathRef.current;
    if (!path || !parsed) return;
    const length = path.getTotalLength();
    setPathLength(length);
  }, [parsed]);

  useEffect(() => {
    if (!inView || !parsed) return;
    if (reducedMotion) {
      setAnimate(false);
      return;
    }
    setAnimate(true);
    onStart();
  }, [inView, parsed, reducedMotion, onStart]);

  const handleAnimationEnd = useCallback(() => {
    onEnd();
  }, [onEnd]);

  if (loadFailed) {
    return (
      <SafeImage
        src={svgSrc}
        alt={alt}
        width={640}
        height={400}
        className="h-auto max-h-[400px] w-full max-w-2xl object-contain opacity-95"
      />
    );
  }

  if (!parsed) {
    return (
      <div ref={containerRef} className="h-64 w-full max-w-2xl" aria-hidden>
        <div className="h-full w-full" style={{ backgroundColor: 'var(--surface)' }} />
      </div>
    );
  }

  const dashOffset = reducedMotion ? 0 : pathLength;
  const dashArray = pathLength;

  return (
    <div ref={containerRef} className="h-auto w-full max-w-2xl">
      <svg
        viewBox={parsed.viewBox}
        className="h-auto max-h-[400px] w-full opacity-95"
        role="img"
        aria-label={alt}
      >
        {/* Ghost track */}
        <path
          d={parsed.pathD}
          fill="none"
          stroke={dotColor}
          strokeWidth={2}
          opacity={0.12}
        />
        {/* Animated draw-on stroke */}
        <path
          ref={lapPathRef}
          d={parsed.pathD}
          fill="none"
          stroke={dotColor}
          strokeWidth={2}
          className={animate && !reducedMotion ? 'circuit-lap-line-animate' : undefined}
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
            willChange,
          }}
          onAnimationEnd={handleAnimationEnd}
        />
        {/* Moving dot along the path — uses CSS offset-path; reduced-motion: static at start */}
        {parsed && !reducedMotion && animate ? (
          <circle
            r={5}
            fill={dotColor}
            style={{
              offsetPath: `path('${parsed.pathD}')`,
              offsetDistance: '0%',
              animation: 'lapDot 3s ease-in-out forwards',
              willChange: 'offset-distance',
            } as React.CSSProperties}
          />
        ) : null}
        {/* Reduced-motion: static dot at start position */}
        {parsed && reducedMotion ? (
          <circle
            r={4}
            fill={dotColor}
            style={{
              offsetPath: `path('${parsed.pathD}')`,
              offsetDistance: '0%',
            } as React.CSSProperties}
          />
        ) : null}
      </svg>
    </div>
  );
}
