'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Telemetry-style race countdown — days · hrs · min · sec in mono. */
export function Countdown({ targetMs }: { targetMs: number }) {
  const t = useTranslations('ui.home.countdown');
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
    return <span className="font-mono text-sm text-text-low">-- · -- · -- · --</span>;
  }

  const diff = targetMs - now;
  if (diff <= 0) {
    return <span className="label-caps text-accent">{t('lightsOut')}</span>;
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
      aria-label={t('aria', { d, h, m, s })}
    >
      {[
        { v: d, l: t('d') },
        { v: h, l: t('h') },
        { v: m, l: t('m') },
        { v: s, l: t('s') },
      ].map((u) => (
        <span key={u.l} className="flex items-baseline gap-0.5">
          <span className="text-[clamp(1.4rem,3.5vw,2.25rem)] leading-none">{pad(u.v)}</span>
          <span className="text-xs text-text-low">{u.l}</span>
        </span>
      ))}
    </div>
  );
}
