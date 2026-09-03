import Image from 'next/image';
import type { OnThisDayEntry } from '@/lib/data/f1';
import { circuitCoverSrc } from '@/lib/assets/f1-icons';

export function OnThisDayCard({ entries }: { entries: OnThisDayEntry[] }) {
  if (entries.length === 0) return null;

  const featured = entries[0];
  const cover = circuitCoverSrc(featured.circuitId);
  const dateLabel = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
  const podium = [featured.winnerName, featured.p2Name, featured.p3Name].filter(Boolean);

  return (
    <article className="relative grid overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface md:grid-cols-[minmax(0,38%),minmax(0,1fr)]">
      <div className="relative min-h-40 md:min-h-[220px]">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 38vw"
            className="object-cover grayscale contrast-125"
          />
        ) : (
          <span aria-hidden className="absolute inset-0 bg-surface-raised" />
        )}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent to-surface/80 md:block hidden" />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-surface to-transparent md:hidden" />
      </div>
      <div className="relative z-10 flex flex-col justify-center gap-3 p-5 md:p-8">
        <div className="flex items-baseline justify-between gap-2">
          <span className="label-caps text-text-mid">On This Day</span>
          <span className="label-caps text-zinc-500">{dateLabel}</span>
        </div>
        <h2
          className="font-condensed text-2xl font-700 uppercase italic leading-tight text-text-hi md:text-3xl"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {featured.season} · {featured.raceName}
        </h2>
        {podium.length > 0 ? (
          <p className="font-mono text-xs uppercase tracking-wide text-zinc-400">
            Podium · {podium.join(' · ')}
          </p>
        ) : null}
        <p className="body-md max-w-prose text-text-mid">
          {featured.winnerName}{' '}
          {/grand prix/i.test(featured.raceName)
            ? `won the ${featured.raceName}`
            : `won at ${featured.raceName}`}{' '}
          for {featured.winnerConstructor}
          {featured.season ? ` in ${featured.season}` : ''}.
        </p>
        {entries.length > 1 ? (
          <p className="data-tabular text-[11px] text-zinc-500">
            Also {entries.slice(1, 4).map((e) => e.season).join(' · ')}
          </p>
        ) : null}
      </div>
    </article>
  );
}
