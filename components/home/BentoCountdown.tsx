'use client';

import { useEffect, useState } from 'react';
import { getCountdownParts } from '@/lib/f1/mrdata';

interface BentoCountdownProps {
  targetMs: number;
  initialNowMs: number;
  variant?: 'compact' | 'full';
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function BentoCountdown({
  targetMs,
  initialNowMs,
  variant = 'full',
}: BentoCountdownProps) {
  const [nowMs, setNowMs] = useState(initialNowMs);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = getCountdownParts(targetMs, nowMs);

  if (parts.expired) {
    return (
      <p className="font-mono text-xs tracking-wider" style={{ color: 'var(--accent)' }}>
        Race underway or finished
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="font-mono text-sm tracking-widest flex gap-1" style={{ color: 'var(--paper)' }}>
        <span>
          {pad(parts.days)}
          <span className="text-[9px]" style={{ color: 'var(--muted)' }}>
            D
          </span>
        </span>
        :
        <span>
          {pad(parts.hours)}
          <span className="text-[9px]" style={{ color: 'var(--muted)' }}>
            H
          </span>
        </span>
      </div>
    );
  }

  const cells = [
    { value: parts.days, label: 'DAYS' },
    { value: parts.hours, label: 'HRS' },
    { value: parts.mins, label: 'MIN' },
    { value: parts.secs, label: 'SEC' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {cells.map((cell) => (
        <div key={cell.label}>
          <span
            className="font-display text-3xl leading-none lg:text-4xl"
            style={{ color: 'var(--paper)' }}
          >
            {pad(cell.value)}
          </span>
          <span
            className="font-condensed mt-1 block text-[10px] uppercase tracking-[0.2em]"
            style={{ color: 'var(--muted)' }}
          >
            {cell.label}
          </span>
        </div>
      ))}
    </div>
  );
}
