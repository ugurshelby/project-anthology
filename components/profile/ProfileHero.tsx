import Image from 'next/image';
import type { ReactNode } from 'react';

/**
 * Cinematic profile hero (Apex sinematik dil, driver/team detail).
 * No card shell — full-bleed section that blends into the page background.
 * Layers: Z-0 background wash + giant faded number, Z-10 subject cutout with
 * a mask-image fade at the base, Z-20 foreground title/meta/stats.
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
  flankNumbers,
  logoSrc,
  children,
}: {
  kicker?: string;
  title: string;
  meta?: string;
  bigNumber?: string | null;
  imageSrc?: string | null;
  imageAlt: string;
  imageKind?: 'portrait' | 'car';
  /** Team hero only — two driver numbers flanking the team logo/car. */
  flankNumbers?: [string | null, string | null];
  /** Team hero only — logo centered above the car cutout. */
  logoSrc?: string | null;
  children?: ReactNode;
}) {
  const maskFade = {
    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 96%)',
    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 96%)',
  };

  return (
    <section className="relative overflow-hidden">
      {/* Z-0 — team-tinted wash dissolving into the page background */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, color-mix(in srgb, var(--team-secondary) 25%, transparent) 0%, rgba(0,0,0,0.4) 55%, var(--bg) 100%)',
        }}
      />

      {bigNumber && imageKind === 'portrait' ? (
        <span
          aria-hidden
          className="hero-number pointer-events-none absolute inset-0 z-0 hidden select-none items-center justify-center text-[clamp(220px,30vw,420px)] leading-none text-text-hi/10 lg:flex"
          style={{
            WebkitTextStroke: '1px color-mix(in srgb, var(--team-secondary) 60%, transparent)',
          }}
        >
          {bigNumber}
        </span>
      ) : null}
      {bigNumber && imageKind !== 'portrait' ? (
        <span
          aria-hidden
          className="hero-number pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center text-[clamp(160px,26vw,340px)] leading-none text-text-hi/[0.06]"
        >
          {bigNumber}
        </span>
      ) : null}

      <div className="relative z-20 flex flex-col items-center gap-6 px-5 pt-10 pb-6 text-center md:px-8 md:pt-14 lg:px-16 lg:pt-20 lg:pb-10">
        {imageKind === 'portrait' ? (
          <div className="relative z-10 flex h-56 w-full items-end justify-center lg:h-[320px]">
            {bigNumber ? (
              <span
                aria-hidden
                className="hero-number pointer-events-none absolute -top-2 z-0 select-none text-[clamp(72px,18vw,140px)] leading-none text-text-hi/15"
                style={{
                  WebkitTextStroke: '1px color-mix(in srgb, var(--team-secondary) 70%, transparent)',
                }}
              >
                {bigNumber}
              </span>
            ) : null}
            {imageSrc ? (
              <div className="relative z-10 h-full w-full max-w-xs" style={maskFade}>
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 1024px) 60vw, 320px"
                  className="object-contain object-bottom"
                  priority
                />
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col items-center gap-3">
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
      </div>

      {imageKind === 'car' ? (
        <div className="relative z-10 -mt-4 flex flex-col items-center gap-4 px-5 pb-8 md:px-8 lg:px-16 lg:pb-12">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 blur-2xl"
            style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--team-secondary) 15%, transparent), transparent)' }}
          />
          {logoSrc ? (
            <div className="relative z-10 h-10 w-10 md:h-14 md:w-14">
              <Image src={logoSrc} alt="" fill sizes="56px" className="object-contain" />
            </div>
          ) : null}
          <div className="relative z-10 flex w-full items-center justify-center gap-6 md:gap-10">
            <span className="hero-number text-4xl text-text-hi/20 md:text-6xl">{flankNumbers?.[0] ?? ''}</span>
            {imageSrc ? (
              <div className="relative h-32 w-full max-w-2xl md:h-48" style={maskFade}>
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 1024px) 90vw, 50vw"
                  className="object-contain object-bottom"
                  priority
                />
              </div>
            ) : null}
            <span className="hero-number text-4xl text-text-hi/20 md:text-6xl">{flankNumbers?.[1] ?? ''}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
