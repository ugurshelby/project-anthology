'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { OdometerDigit } from '@/components/ui/OdometerDigit';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';
import { getCountdownParts } from '@/lib/f1/mrdata';
import { getRaceCountdownPhase } from '@/lib/f1Calendar';

export interface RaceCountdownProps {
  targetDate: Date;
  raceName: string;
  variant?: 'home' | 'circuit';
  embedded?: boolean;
  initialNowMs?: number;
  fallback?: ReactNode;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function OdometerPair({
  value,
  size,
  background = 'dark',
}: {
  value: number;
  size: 'sm' | 'md' | 'lg';
  background?: 'transparent' | 'dark';
}) {
  const digits = pad(value).split('');
  return (
    <span className="inline-flex gap-px">
      {digits.map((_, index) => (
        <OdometerDigit
          key={index}
          value={Number(digits[index])}
          size={size}
          background={background}
        />
      ))}
    </span>
  );
}

function LivePanel({ raceName, reducedMotion }: { raceName: string; reducedMotion: boolean }) {
  return (
    <div
      className="p-4"
      style={{
        borderLeft: '3px solid var(--accent)',
        backgroundColor: '#141414',
      }}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={`inline-block h-2 w-2 rounded-full${
            reducedMotion ? '' : ' race-countdown-pulse-dot'
          }`}
          style={{ backgroundColor: 'var(--accent)' }}
        />
        <span
          className="font-condensed text-[11px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--paper)' }}
        >
          Race in progress
        </span>
      </div>
      <p
        className="mt-2 font-display text-[1.3rem] leading-tight tracking-[0.04em]"
        style={{ color: 'var(--paper)' }}
      >
        {raceName}
      </p>
      <p
        className="mt-1 font-condensed text-[11px] uppercase tracking-[0.2em]"
        style={{ color: 'var(--accent)' }}
      >
        Live now
      </p>
    </div>
  );
}

function HomeCountdownGrid({
  parts,
  embedded,
  raceName,
}: {
  parts: ReturnType<typeof getCountdownParts>;
  embedded: boolean;
  raceName: string;
}) {
  const cells = [
    { value: parts.days, label: 'DAYS' },
    { value: parts.hours, label: 'HRS' },
    { value: parts.mins, label: 'MIN' },
    { value: parts.secs, label: 'SEC' },
  ];

  return (
    <>
      {!embedded ? (
        <>
          <p
            className="font-condensed text-[11px] uppercase tracking-[0.2em]"
            style={{ color: 'var(--muted)' }}
          >
            Next race
          </p>
          <p
            className="mt-1 font-display text-[1.3rem] leading-tight tracking-[0.04em]"
            style={{ color: 'var(--paper)' }}
          >
            {raceName}
          </p>
          <hr className="my-3 border-0 border-t" style={{ borderColor: 'var(--border)' }} />
        </>
      ) : null}
      <div className="grid grid-cols-4 gap-2 text-center">
        {cells.map((cell) => (
          <div key={cell.label}>
            <OdometerPair value={cell.value} size="md" />
            <span
              className="font-condensed mt-1 block text-[9px] uppercase tracking-[0.2em]"
              style={{ color: 'var(--muted)' }}
            >
              {cell.label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function CircuitCountdownRow({ parts }: { parts: ReturnType<typeof getCountdownParts> }) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm tracking-wider"
      style={{ color: 'var(--paper)' }}
    >
      <span
        className="font-condensed text-[11px] uppercase tracking-[0.2em]"
        style={{ color: 'var(--muted)' }}
      >
        Race in:
      </span>
      <span className="inline-flex items-center gap-1">
        <OdometerPair value={parts.days} size="sm" background="transparent" />
        <span className="text-[9px]" style={{ color: 'var(--muted)' }}>
          d
        </span>
      </span>
      <span className="inline-flex items-center gap-1">
        <OdometerPair value={parts.hours} size="sm" background="transparent" />
        <span className="text-[9px]" style={{ color: 'var(--muted)' }}>
          h
        </span>
      </span>
      <span className="inline-flex items-center gap-1">
        <OdometerPair value={parts.mins} size="sm" background="transparent" />
        <span className="text-[9px]" style={{ color: 'var(--muted)' }}>
          m
        </span>
      </span>
      <span className="inline-flex items-center gap-1">
        <OdometerPair value={parts.secs} size="sm" background="transparent" />
        <span className="text-[9px]" style={{ color: 'var(--muted)' }}>
          s
        </span>
      </span>
    </div>
  );
}

const PULSE_STYLES = `
@keyframes race-countdown-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.race-countdown-pulse-dot {
  animation: race-countdown-pulse 2s infinite;
}
@media (prefers-reduced-motion: reduce) {
  .race-countdown-pulse-dot { animation: none; }
}
`;

export function RaceCountdown({
  targetDate,
  raceName,
  variant = 'home',
  embedded = false,
  initialNowMs,
  fallback = null,
}: RaceCountdownProps) {
  const reducedMotion = usePrefersReducedMotion();
  const targetMs = targetDate.getTime();
  const [nowMs, setNowMs] = useState(initialNowMs ?? Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const phase = useMemo(
    () => getRaceCountdownPhase(targetMs, nowMs),
    [targetMs, nowMs],
  );

  if (phase === 'completed') {
    return fallback;
  }

  if (phase === 'live') {
    return (
      <>
        <style>{PULSE_STYLES}</style>
        <div aria-live="polite" aria-label={`${raceName} is live`}>
          <LivePanel raceName={raceName} reducedMotion={reducedMotion} />
        </div>
      </>
    );
  }

  const parts = getCountdownParts(targetMs, nowMs);
  const ariaLabel = `${raceName}: ${parts.days} days, ${parts.hours} hours, ${parts.mins} minutes, ${parts.secs} seconds`;

  return (
    <>
      <style>{PULSE_STYLES}</style>
      <div aria-live="polite" aria-label={ariaLabel}>
        {variant === 'circuit' ? (
          <CircuitCountdownRow parts={parts} />
        ) : (
          <HomeCountdownGrid parts={parts} embedded={embedded} raceName={raceName} />
        )}
      </div>
    </>
  );
}
