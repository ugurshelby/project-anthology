import { teamPatternStyle } from '@/lib/assets/team-pattern';
import { MediaAssetView } from '@/components/media/MediaAssetView';
import type { MediaResult } from '@/lib/media/read';

/**
 * Team hero for any season: the team name, team logo/badge when available, a monumental outlined
 * year, the car numbers of that season's drivers, all in the team colours of
 * that year (set as CSS variables on the page root).
 */
export function TeamSeasonHero({
  kicker,
  name,
  year,
  meta,
  entrant,
  badge,
  numbers,
  constructorId,
  mediaResult,
}: {
  kicker: string;
  name: string;
  year: number;
  meta?: string;
  entrant?: string | null;
  badge?: string | null;
  numbers: string[];
  constructorId: string;
  mediaResult?: MediaResult | null;
}) {
  const pattern = teamPatternStyle(constructorId.replace(/-/g, '_'), 'var(--team-secondary, var(--accent))', 0.1);

  return (
    <section className="relative -mx-5 mb-4 overflow-hidden md:-mx-8 lg:-mx-16">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, color-mix(in srgb, var(--team-secondary) 18%, #050505) 0%, #050505 92%)' }}
      />
      <span aria-hidden className="pointer-events-none absolute inset-0 opacity-60" style={pattern} />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 70% at 78% 40%, color-mix(in srgb, var(--team-secondary) 24%, transparent), transparent 70%)' }}
      />

      <div className="relative mx-auto flex min-h-[320px] w-full max-w-[var(--container-max)] items-end justify-between gap-6 px-5 pb-8 pt-10 md:min-h-[440px] md:px-8 md:pb-12 lg:px-16">
        <div className="relative z-10 min-w-0 max-w-2xl">
          <div className="flex items-center gap-3">
            {mediaResult ? (
              <div className="h-10 w-24 sm:h-12 sm:w-32">
                <MediaAssetView
                  type="team"
                  entityKey={constructorId}
                  initialResult={mediaResult}
                  alt={`${name} emblem`}
                  name={name}
                  className="h-full w-full object-contain"
                  showAttribution={false}
                />
              </div>
            ) : null}
            <p className="label-caps text-text-mid">{kicker}</p>
          </div>
          <h1 className="display-hero mt-2 text-balance uppercase italic leading-[0.88] text-text-hi">{name}</h1>
          {meta ? <p className="data-tabular mt-3 text-text-mid">{meta}</p> : null}
          {entrant ? <p className="body-sm mt-1 text-text-low">{entrant}</p> : null}
          {badge ? (
            <p
              className="label-caps mt-4 inline-block rounded-full border px-3 py-1 text-[10px] tracking-[0.2em]"
              style={{ borderColor: 'var(--team-secondary)', color: 'var(--team-secondary)' }}
            >
              {badge}
            </p>
          ) : null}
          {mediaResult?.status === 'image' && mediaResult.attribution?.text ? (
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-text-low">
              <span>{mediaResult.attribution.trademark ? 'Marka:' : 'Görsel:'}</span>
              <span className="max-w-[260px] truncate text-text-mid">{mediaResult.attribution.text}</span>
              {mediaResult.attribution.sourceUrl ? (
                <a
                  href={mediaResult.attribution.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-0.5 text-accent hover:underline"
                >
                  ↗
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <div aria-hidden className="pointer-events-none absolute right-3 top-4 select-none text-right md:bottom-2 md:right-8 md:top-auto lg:right-16">
          <span
            className="hero-number block text-[clamp(4.5rem,24vw,17rem)] leading-[0.8] text-transparent"
            style={{ WebkitTextStroke: '1.5px color-mix(in srgb, var(--team-secondary) 55%, transparent)' }}
          >
            {year}
          </span>
          {numbers.length > 0 ? (
            <span className="data-tabular mt-3 block text-sm tracking-[0.3em] text-text-mid">{numbers.map((n) => `#${n}`).join('  ')}</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
