'use client';

import { useEffect, useState } from 'react';

/**
 * Race countdown (design.md home hero). Counts down to a target epoch ms.
 * tabular-nums so digits don't jump (§7). Renders "LIGHTS OUT" once elapsed.
 * Client: ticks every second.
 */
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
    return <span className="hero-number text-4xl text-text-mid">--:--:--:--</span>;
  }

  const diff = targetMs - now;
  if (diff <= 0) {
    return <span className="label-caps text-accent">Lights out</span>;
  }

  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className="flex items-end gap-3"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${d} days, ${h} hours, ${m} minutes, ${s} seconds until race start`}
    >
      {[
        { v: d, l: 'DAYS' },
        { v: h, l: 'HRS' },
        { v: m, l: 'MIN' },
        { v: s, l: 'SEC' },
      ].map((u) => (
        <div key={u.l} className="flex flex-col items-center">
          <span className="hero-number text-[clamp(32px,5vw,56px)] text-text-hi" aria-hidden>
            {pad(u.v)}
          </span>
          <span className="label-caps text-text-low" aria-hidden>
            {u.l}
          </span>
        </div>
      ))}
    </div>
  );
}
