import Image from 'next/image';
import type { ReactNode } from 'react';

/**
 * Profile hero (design.md §3.3) — left team-color accent bar, big condensed
 * name, mono dossier line, oversized faded number, and a right-side SVG
 * (driver portrait or car). Title uses clamp() to stay on one line (§7).
 * Theme colors come from the page root (--team-* / --accent) so this stays
 * presentational.
 */
export function ProfileHero({
  kicker,
  title,
  meta,
  bigNumber,
  imageSrc,
  imageAlt,
  imageKind = 'portrait',
  children,
}: {
  kicker?: string;
  title: string;
  meta?: string;
  bigNumber?: string | null;
  imageSrc?: string | null;
  imageAlt: string;
  imageKind?: 'portrait' | 'car';
  children?: ReactNode;
}) {
  return (
    <section className="relative grid grid-cols-1 items-center gap-6 overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-6 md:grid-cols-[1.4fr_1fr] md:p-10">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: 'var(--team-secondary)' }}
      />

      <div className="relative z-10 flex flex-col gap-3">
        {kicker ? <span className="label-caps text-text-mid">{kicker}</span> : null}
        <h1
          className="font-condensed uppercase text-text-hi"
          style={{
            fontFamily: 'var(--font-condensed)',
            fontWeight: 700,
            fontSize: 'clamp(48px, 8vw, 104px)',
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h1>
        {meta ? <p className="data-tabular text-text-mid">{meta}</p> : null}
        {children}
      </div>

      <div className="relative z-10 flex min-h-40 items-center justify-center md:min-h-56">
        {bigNumber ? (
          <span
            aria-hidden
            className="hero-number pointer-events-none absolute right-0 select-none text-[clamp(120px,22vw,300px)] leading-none text-text-hi/5"
          >
            {bigNumber}
          </span>
        ) : null}
        {imageSrc ? (
          <div
            className={
              imageKind === 'car'
                ? 'relative aspect-[16/9] w-full'
                : 'relative aspect-[3/4] h-48 md:h-64'
            }
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-contain"
              style={{ filter: 'drop-shadow(0 0 40px var(--team-secondary))' }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
