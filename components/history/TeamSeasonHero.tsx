import { teamPatternStyle } from '@/lib/assets/team-pattern';
import { MediaAssetView } from '@/components/media/MediaAssetView';
import { MediaCredit } from '@/components/media/MediaCredit';
import { TeamPlaceholder } from '@/components/media/placeholders/TeamPlaceholder';
import { resolveTeamUiColor } from '@/config/team-colors';
import type { MediaResult } from '@/lib/media/read';

export interface TeamSeasonHeroProps {
  kicker: string;
  name: string;
  year: number;
  meta?: string;
  entrant?: string | null;
  badge?: string | null;
  numbers: string[];
  constructorId: string;
  carMediaResult?: MediaResult | null;
  country?: string | null;
}

/**
 * Cinematic Poster Hero (Top 45vh) for Team Detail Page:
 * - Full-bleed atmospheric paddock/car background with dark vignette falloff.
 * - Monumental condensed typography (Barlow Condensed), optical tracking (-0.02em).
 * - Apple material top-edge specular highlight (rgba(255,255,255,0.06)).
 * - Team chassis badge, constructor standing rank, and monumental outlined year watermark.
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
  carMediaResult,
  country,
}: TeamSeasonHeroProps) {
  const normId = constructorId.replace(/-/g, '_');
  const pattern = teamPatternStyle(normId, 'var(--team-secondary, var(--accent))', 0.08);

  const hasCarImage = carMediaResult?.status === 'image';

  return (
    <section className="relative -mx-5 mb-6 overflow-hidden md:-mx-8 lg:-mx-16 border-b border-hairline/80 bg-[#0a0a0a]">
      {/* Specular hairline top highlight */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

      {/* Atmospheric gradient canvas */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, color-mix(in srgb, var(--team-secondary) 15%, #0a0a0a) 0%, #0a0a0a 95%)',
        }}
      />

      {/* Signature livery geometric pattern */}
      <span aria-hidden className="pointer-events-none absolute inset-0 opacity-40" style={pattern} />

      {/* Radial ambient glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 65% 70% at 75% 35%, color-mix(in srgb, var(--team-secondary) 20%, transparent), transparent 75%)',
        }}
      />

      {/* Atmospheric Car Silhouette / Photo (when available) */}
      {hasCarImage ? (
        <div className="pointer-events-none absolute right-0 top-0 h-full w-full lg:w-3/5 overflow-hidden opacity-35 lg:opacity-50 transition-opacity duration-700">
          <div className="relative h-full w-full">
            <MediaAssetView
              type="car"
              entityKey={`${constructorId}:${year}`}
              initialResult={carMediaResult}
              alt={`${name} ${year} car`}
              name={`${name} ${year}`}
              objectFit="contain"
              className="h-full w-full object-contain object-right"
              // The hero car is the page's LCP element (Lighthouse 2026-10-28): load it first.
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              showAttribution={false}
            />
            {/* Dark vignette scrim to blend car seamlessly into canvas */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `
                  linear-gradient(to right, #0a0a0a 15%, rgba(10,10,10,0.6) 50%, transparent 100%),
                  linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.3) 50%, transparent 100%)
                `,
              }}
            />
          </div>
        </div>
      ) : null}

      {/* Hero Content HUD */}
      <div className="relative mx-auto flex min-h-[340px] w-full max-w-[var(--container-max)] items-end justify-between gap-6 px-5 pb-8 pt-10 md:min-h-[420px] md:px-8 md:pb-12 lg:px-16">
        <div className="relative z-10 min-w-0 max-w-2xl">
          {/* Header Tag / Emblem HUD */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Designed team mark, never an official logo (owner decision 2026-10-27, 8.11). */}
            <div className="h-10 w-24 shrink-0 overflow-hidden rounded-[var(--radius-chip)] sm:h-12 sm:w-32 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
              <TeamPlaceholder seed={constructorId} name={name} teamColor={resolveTeamUiColor(undefined, name, year)} compact />
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--team-secondary,var(--accent))]" />
              <p className="label-caps font-mono text-[11px] tracking-[0.16em] text-text-mid">{kicker}</p>
            </div>
          </div>

          {/* Monumental Team Moniker */}
          <h1
            lang="en"
            className="font-condensed mt-2.5 text-balance uppercase italic leading-[0.9] tracking-[-0.02em] text-text-hi text-[clamp(2.75rem,7.5vw,5.5rem)] font-800"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {name}
          </h1>

          {/* Telemetry and Entrant line */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-mono text-text-mid">
            {meta ? <span className="data-tabular font-semibold text-text-hi">{meta}</span> : null}
            {country ? (
              <>
                <span className="text-text-low">·</span>
                <span className="text-text-mid">{country}</span>
              </>
            ) : null}
          </div>

          {entrant ? (
            <p lang="en" className="body-sm mt-1.5 text-xs font-mono text-text-low line-clamp-1">{entrant}</p>
          ) : null}

          {/* Badges and Indicators Row */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {badge ? (
              <span
                className="label-caps inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] tracking-[0.2em] font-mono font-bold"
                style={{
                  borderColor: 'var(--team-secondary)',
                  color: 'var(--team-secondary)',
                  backgroundColor: 'color-mix(in srgb, var(--team-secondary) 12%, transparent)',
                }}
              >
                ★ {badge}
              </span>
            ) : null}
          </div>

          {/* Credit of the car photo behind the hero (the team mark is our own design and needs none). */}
          {carMediaResult?.status === 'image' && carMediaResult.attribution?.text ? (
            <MediaCredit attribution={carMediaResult.attribution} className="mt-3 max-w-[320px]" />
          ) : null}
        </div>

        {/* Monumental Outlined Year Watermark */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-3 top-4 select-none text-right md:bottom-2 md:right-8 md:top-auto lg:right-16"
        >
          <span
            className="hero-number block text-[clamp(5.5rem,22vw,16rem)] leading-[0.8] text-transparent"
            style={{
              WebkitTextStroke: '1.5px color-mix(in srgb, var(--team-secondary, var(--accent)) 45%, transparent)',
            }}
          >
            {year}
          </span>
          {numbers.length > 0 ? (
            <span className="data-tabular mt-2 block font-mono text-xs tracking-[0.25em] text-text-mid sm:hidden">
              {numbers.map((n) => `#${n}`).join('  ')}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
