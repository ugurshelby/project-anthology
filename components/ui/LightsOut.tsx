'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';

interface LightsOutProps {
  /** Race start epoch ms. If null or passed, renders nothing special. */
  raceStartMs: number | null;
  /** Server-rendered now (for hydration consistency). */
  initialNowMs: number;
}

function getSecondsLeft(targetMs: number, nowMs: number): number {
  return Math.max(0, Math.floor((targetMs - nowMs) / 1000));
}

export function LightsOut({ raceStartMs, initialNowMs }: LightsOutProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [secsLeft, setSecsLeft] = useState(() =>
    raceStartMs != null ? getSecondsLeft(raceStartMs, initialNowMs) : Infinity,
  );
  const [flashing, setFlashing] = useState(false);
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (raceStartMs == null) return;
    const tick = () => setSecsLeft(getSecondsLeft(raceStartMs, Date.now()));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [raceStartMs]);

  useEffect(() => {
    if (secsLeft === 0 && !reducedMotion) {
      setFlashing(true);
      flashRef.current = setTimeout(() => setFlashing(false), 1200);
    }
    return () => {
      if (flashRef.current) clearTimeout(flashRef.current);
    };
  }, [secsLeft, reducedMotion]);

  // Only render when within 5 seconds of race start
  if (raceStartMs == null || secsLeft > 5 || secsLeft < 0) return null;

  const litCount = reducedMotion ? 5 : 5 - secsLeft;

  return (
    <>
      {/* Full-screen flash at lights-out */}
      {flashing && !reducedMotion ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[9999]"
          style={{
            backgroundColor: 'var(--accent)',
            opacity: 0.35,
            animation: 'lightsout-flash 1.2s ease-out forwards',
          }}
        />
      ) : null}

      <div
        role="status"
        aria-live="assertive"
        aria-label={secsLeft === 0 ? 'Lights out!' : `Race starts in ${secsLeft} seconds`}
        className="flex flex-col items-center gap-3"
      >
        <p
          className="font-condensed text-[10px] uppercase tracking-[0.25em]"
          style={{ color: 'var(--muted)' }}
        >
          Lights out in
        </p>

        {/* 5 F1 start lights */}
        <div className="flex items-center gap-2" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => {
            const isLit = i < litCount;
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="h-4 w-4 border"
                  style={{
                    backgroundColor: isLit ? 'var(--accent)' : 'transparent',
                    borderColor: isLit ? 'var(--accent)' : 'var(--border)',
                    boxShadow: isLit && !reducedMotion
                      ? '0 0 12px rgba(255,24,1,0.6)'
                      : 'none',
                    transition: reducedMotion ? 'none' : 'background-color 80ms ease, box-shadow 80ms ease',
                  }}
                />
              </div>
            );
          })}
        </div>

        <span
          className="font-display text-6xl leading-none tracking-[0.04em]"
          style={{ color: secsLeft === 0 ? 'var(--accent)' : 'var(--paper)' }}
        >
          {secsLeft === 0 ? 'GO' : secsLeft}
        </span>
      </div>
    </>
  );
}
