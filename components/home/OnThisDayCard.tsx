import { ApexImage } from '@/components/media/ApexImage';
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

  return (
    <article className="group relative grid overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-surface/90 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.8)] backdrop-blur-md md:grid-cols-12 md:items-stretch">
      {/* Top specular highlight edge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      {/* Left Media Area */}
      <div className="relative min-h-[220px] overflow-hidden md:col-span-5 md:min-h-[280px]">
        {cover ? (
          <ApexImage
            src={cover}
            alt=""
            fill
            kind="circuit"
            sizes="(max-width: 768px) 100vw, 42vw"
            className="object-cover grayscale contrast-125 opacity-70 transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <span aria-hidden className="absolute inset-0 bg-surface-raised" />
        )}

        {/* Ambient Gradient Masks */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-black/20 via-surface/40 to-surface md:block"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent md:hidden"
        />

        {/* Floating Date Badge */}
        <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1 font-mono text-xs uppercase tracking-wider text-white shadow-sm backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span>On This Day · {dateLabel}</span>
        </div>

        {/* Historical Year Watermark */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 left-4 select-none font-condensed text-7xl font-700 tabular-nums leading-none text-white/[0.06] md:text-8xl"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {featured.season}
        </span>
      </div>

      {/* Right Content Area */}
      <div className="relative z-10 flex flex-col justify-between gap-5 p-6 sm:p-8 md:col-span-7">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
              Historical Flashback · {featured.season}
            </span>
          </div>

          <h2
            className="font-condensed text-2xl font-700 uppercase italic leading-tight tracking-tight text-white sm:text-3xl md:text-4xl"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {featured.season} · {featured.raceName}
          </h2>

          {/* Podium Finisher Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              P1 {featured.winnerName}
            </span>
            {featured.p2Name ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300/30 bg-white/[0.05] px-2.5 py-1 font-mono text-xs text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                P2 {featured.p2Name}
              </span>
            ) : null}
            {featured.p3Name ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-700/30 bg-amber-700/10 px-2.5 py-1 font-mono text-xs text-amber-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                P3 {featured.p3Name}
              </span>
            ) : null}
          </div>

          <p className="max-w-prose text-sm leading-relaxed text-text-mid/90 sm:text-base">
            {featured.winnerName}{' '}
            {/grand prix/i.test(featured.raceName)
              ? `won the ${featured.raceName}`
              : `won at ${featured.raceName}`}{' '}
            for <span className="font-medium text-text-hi">{featured.winnerConstructor}</span>
            {featured.season ? ` in ${featured.season}` : ''}.
          </p>
        </div>

        {/* Additional Anniversaries */}
        {entries.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-hairline/60 pt-3 font-mono text-xs">
            <span className="uppercase tracking-wider text-text-low">
              Also on this day:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {entries.slice(1, 5).map((e) => (
                <span
                  key={`${e.season}-${e.raceName}`}
                  className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-text-mid transition-colors hover:border-white/20 hover:text-white"
                >
                  {e.season} {e.raceName.replace(/ Grand Prix/i, '')}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
