import { ApexImage } from '@/components/media/ApexImage';
import { teamPatternStyle } from '@/lib/assets/team-pattern';
import type { CSSProperties } from 'react';

const PORTRAIT_MASK: CSSProperties = {
  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 68%, rgba(0,0,0,0) 100%)',
  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 68%, rgba(0,0,0,0) 100%)',
};

/** Derives a 2-4 uppercase letter FIA driver code or monogram from available data. */
function markFromDriver(driverCode?: string | null, title?: string): string {
  const code = driverCode?.trim().toUpperCase();
  if (code && /^[A-Z0-9]{2,4}$/.test(code)) return code;
  if (!title) return '—';
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0]?.slice(0, 3).toUpperCase() || '—';
}

/**
 * Editorial typographic sculpture & team DNA texture panel for photo-free driver hero.
 * Renders on desktop/tablet to replace the vacant portrait cutout with a pure data-driven
 * motorsport poster artwork: monumental condensed monogram, team pattern, and CAD dossier.
 */
export function DriverHeroGraphic({
  mark,
  bigNumber,
  constructorId,
  constructorName,
}: {
  mark: string;
  bigNumber?: string | null;
  constructorId?: string | null;
  constructorName?: string | null;
}) {
  const pattern = teamPatternStyle(constructorId, 'var(--team-secondary, var(--accent))', 0.12);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 hidden select-none overflow-hidden md:block"
    >
      <div
        className="absolute inset-y-0 right-0 flex h-full w-[min(58%,660px)] flex-col justify-between p-8 lg:w-[min(54%,760px)] lg:p-12 xl:w-[min(50%,840px)]"
        style={PORTRAIT_MASK}
      >
        {/* Team DNA micro-pattern texture */}
        <span aria-hidden className="pointer-events-none absolute inset-0 opacity-60" style={pattern} />

        {/* Ambient radial glow tuned to constructor secondary color */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 62% 45%, color-mix(in srgb, var(--team-secondary, var(--accent)) 22%, transparent), transparent 72%)',
          }}
        />

        {/* Soft edge fade into dark page canvas on the left */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-bg via-bg/60 to-transparent"
        />

        {/* CAD Blueprint corner brackets */}
        <span aria-hidden className="pointer-events-none absolute left-6 top-6 h-3.5 w-3.5 border-l border-t border-hairline/70" />
        <span aria-hidden className="pointer-events-none absolute right-6 top-6 h-3.5 w-3.5 border-r border-t border-hairline/70" />
        <span aria-hidden className="pointer-events-none absolute left-6 bottom-6 h-3.5 w-3.5 border-b border-l border-hairline/70" />
        <span aria-hidden className="pointer-events-none absolute right-6 bottom-6 h-3.5 w-3.5 border-b border-r border-hairline/70" />

        {/* Crosshair telemetry markers */}
        <span aria-hidden className="pointer-events-none absolute left-1/3 top-1/4 font-mono text-[10px] text-hairline/70">+</span>
        <span aria-hidden className="pointer-events-none absolute right-1/4 bottom-1/3 font-mono text-[10px] text-hairline/70">+</span>

        {/* Top HUD telemetry header */}
        <div className="relative z-10 flex items-center justify-between border-b border-hairline/60 pb-3">
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: 'var(--team-secondary, var(--accent))' }}
            />
            <span className="font-mono text-[11px] font-500 uppercase tracking-[0.2em] text-text-mid">
              SPEC // {mark}
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-text-low">
            {bigNumber ? (
              <span>CAR NO. {bigNumber.padStart(2, '0')}</span>
            ) : (
              <span>ACTIVE SPEC</span>
            )}
            <span className="text-hairline">/</span>
            <span>FIA F1</span>
          </div>
        </div>

        {/* Centerpiece: Monumental typographic sculpture */}
        <div className="relative z-10 my-auto flex flex-col justify-center py-6">
          {/* Ghost outline behind for speed/depth illusion */}
          <span
            aria-hidden
            className="pointer-events-none absolute -left-1 -top-1 font-condensed font-900 uppercase tracking-tight text-[clamp(6rem,13vw,12.5rem)] leading-[0.8] text-transparent select-none lg:text-[clamp(7.5rem,15vw,15rem)]"
            style={{
              WebkitTextStroke: '1.5px color-mix(in srgb, var(--team-secondary, var(--accent)) 25%, transparent)',
              opacity: 0.6,
            }}
          >
            {mark}
          </span>

          {/* Primary sculptural monogram with metallic/team-color gradient wash */}
          <span
            className="relative font-condensed font-900 uppercase tracking-tight text-[clamp(6rem,13vw,12.5rem)] leading-[0.8] text-transparent select-none lg:text-[clamp(7.5rem,15vw,15rem)]"
            style={{
              backgroundImage:
                'linear-gradient(175deg, #ffffff 0%, color-mix(in srgb, var(--team-secondary, var(--accent)) 75%, #ffffff) 38%, color-mix(in srgb, var(--team-secondary, var(--accent)) 25%, transparent) 82%, transparent 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {mark}
          </span>

          {/* Motorsport identity bar: speed stripe + number badge + constructor */}
          <div className="mt-5 flex items-center gap-3">
            <span
              className="h-1 w-16 shrink-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, var(--team-secondary, var(--accent)), transparent)',
              }}
            />
            {bigNumber ? (
              <span
                className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-hairline/80 px-2 py-0.5 font-mono text-[10px] font-600 uppercase tracking-wider text-text-hi"
                style={{
                  background: 'color-mix(in srgb, var(--team-secondary, var(--accent)) 12%, rgba(0,0,0,0.65))',
                }}
              >
                <span className="text-text-low font-normal">NO.</span>
                <span
                  className="font-condensed text-sm font-700 leading-none text-text-hi"
                  style={{ fontFamily: 'var(--font-condensed)' }}
                >
                  {bigNumber}
                </span>
              </span>
            ) : null}
            <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-text-low">
              {constructorName || 'PADDOCK SPEC'}
            </span>
          </div>
        </div>

        {/* Bottom Technical Archive Footer Bar */}
        <div className="relative z-10 flex items-center justify-between border-t border-hairline/40 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-text-low/70">
          <span>APEX ARCHIVE // TELEMETRY</span>
          <span>SYSTEM CHASSIS</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Editorial driver hero — magazine cover layering:
 * z-0 giant number watermark, z-10 title + data, and on desktop z-10 DriverHeroGraphic
 * (pure data-driven typographic sculpture and team DNA texture, replacing missing photo).
 * Mobile preserves a full-bleed backdrop with a glass panel at the lower third.
 */
export function DriverProfileHero({
  kicker,
  title,
  meta,
  bigNumber,
  imageSrc,
  imageAlt,
  editorialTagline,
  driverCode,
  constructorId,
  constructorName,
}: {
  kicker?: string;
  title: string;
  meta?: string;
  bigNumber?: string | null;
  imageSrc?: string | null;
  imageAlt: string;
  /** Optional italic pull-line — lore snippet or radio-style detail. */
  editorialTagline?: string | null;
  driverCode?: string | null;
  constructorId?: string | null;
  constructorName?: string | null;
}) {
  const nameParts = title.trim().split(/\s+/);
  const firstName = nameParts.slice(0, -1).join(' ') || title;
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : null;
  const mark = markFromDriver(driverCode, title);

  return (
    <section className="relative -mx-5 mb-4 overflow-hidden md:-mx-8 lg:-mx-16">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, color-mix(in srgb, var(--team-secondary) 14%, transparent) 0%, var(--bg) 88%)',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--team-secondary) 15%, transparent), transparent 70%)',
        }}
      />

      <div className="relative min-h-[min(82vh,680px)] md:min-h-[580px] lg:min-h-[620px]">
        {bigNumber ? (
          <span
            aria-hidden
            className="hero-number pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center text-[clamp(10rem,38vw,14rem)] leading-[0.82] text-transparent md:items-end md:justify-start md:pl-[4%] md:pb-6 md:text-[clamp(12rem,22vw,18rem)] lg:pl-[6%]"
            style={{
              WebkitTextStroke: '1px color-mix(in srgb, var(--team-secondary) 24%, transparent)',
            }}
          >
            {bigNumber}
          </span>
        ) : null}

        <div className="relative z-10 hidden min-h-[min(82vh,680px)] flex-col justify-end px-5 pb-5 pt-36 md:absolute md:inset-0 md:flex md:min-h-0 md:justify-end md:px-10 md:pb-12 lg:px-16">
          <div className="relative md:max-w-[min(56%,580px)] lg:max-w-[min(54%,680px)]">
            {kicker ? <span className="label-caps text-text-mid">{kicker}</span> : null}
            {editorialTagline ? (
              <p
                className="mt-2 max-w-xl font-condensed text-sm italic leading-snug text-text-mid md:text-base"
                style={{ fontFamily: 'var(--font-condensed)' }}
              >
                {editorialTagline}
              </p>
            ) : null}
            <h1 className="display-hero relative mt-2 hidden uppercase text-text-hi md:mt-3 md:block md:leading-[0.86]">
              {lastName ? (
                <>
                  <span className="block">{firstName}</span>
                  <span className="block text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.9] tracking-tight md:text-[clamp(3.5rem,6.8vw,7.5rem)]">
                    {lastName}
                  </span>
                </>
              ) : (
                title
              )}
            </h1>
            {meta ? <p className="data-tabular mt-3 text-text-mid">{meta}</p> : null}
          </div>
        </div>

        {imageSrc ? (
          <div className="pointer-events-none absolute inset-0 z-20">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[55%] bg-gradient-to-b from-black/55 via-black/20 to-transparent md:from-transparent md:via-transparent"
            />
            <div
              className="absolute inset-0 mx-auto md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-[min(68%,820px)] lg:w-[min(62%,900px)]"
              style={PORTRAIT_MASK}
            >
              <ApexImage
                src={imageSrc}
                alt={imageAlt}
                fill
                kind="driver"
                sizes="(max-width: 768px) 100vw, 62vw"
                className="object-contain object-[center_12%] scale-[1.55] sm:scale-[1.45] md:object-right-bottom md:object-contain md:scale-[1.22] lg:scale-[1.28]"
                priority
              />
            </div>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[48%] bg-gradient-to-t from-bg via-bg/95 to-transparent md:h-[42%]"
            />
          </div>
        ) : (
          <DriverHeroGraphic
            mark={mark}
            bigNumber={bigNumber}
            constructorId={constructorId}
            constructorName={constructorName}
          />
        )}

        <div className="absolute inset-x-0 bottom-0 z-30 px-5 pb-5 md:hidden">
          <div className="rounded-[var(--radius-lg)] border border-white/[0.12] bg-black/50 p-5 backdrop-blur-md">
            {kicker ? <span className="label-caps text-text-mid">{kicker}</span> : null}
            {editorialTagline ? (
              <p
                className="mt-2 line-clamp-2 font-condensed text-sm italic leading-snug text-text-mid"
                style={{ fontFamily: 'var(--font-condensed)' }}
              >
                {editorialTagline}
              </p>
            ) : null}
            <h1 className="display-hero mt-2 uppercase text-text-hi">{title}</h1>
            {meta ? <p className="data-tabular mt-2 text-text-mid">{meta}</p> : null}
          </div>
        </div>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 hidden h-24 bg-gradient-to-t from-bg to-transparent md:block"
        />
      </div>
    </section>
  );
}
