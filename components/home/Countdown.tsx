'use client';

import { useEffect, useState } from 'react';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Telemetry-style race countdown — days · hrs · min · sec in mono. */
export function Countdown({ targetMs }: { targetMs: number }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const initial = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, []);

  if (now === null) {
    return <span className="font-mono text-sm text-zinc-500">-- · -- · -- · --</span>;
  }

  const diff = targetMs - now;
  if (diff <= 0) {
    return <span className="label-caps text-accent">Lights out</span>;
  }

  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);

  return (
    <div
      className="flex items-baseline gap-2 font-mono text-text-hi md:gap-3"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${d} days, ${h} hours, ${m} minutes, ${s} seconds until race start`}
    >
      {[
        { v: d, l: 'D' },
        { v: h, l: 'H' },
        { v: m, l: 'M' },
        { v: s, l: 'S' },
      ].map((u) => (
        <span key={u.l} className="flex items-baseline gap-0.5">
          <span className="text-[clamp(1.4rem,3.5vw,2.25rem)] leading-none">{pad(u.v)}</span>
          <span className="text-[10px] text-zinc-500">{u.l}</span>
        </span>
      ))}
    </div>
  );
}
