import Image from 'next/image';
import type { CSSProperties } from 'react';

const PORTRAIT_MASK: CSSProperties = {
  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
};

/**
 * Editorial driver hero — magazine cover layering:
 * z-0 giant number watermark, z-10 title behind the silhouette, z-20 portrait on top.
 * Mobile uses a full-bleed portrait with a glass panel at the lower third.
 */
export function DriverProfileHero({
  kicker,
  title,
  meta,
  bigNumber,
  imageSrc,
  imageAlt,
  editorialTagline,
}: {
  kicker?: string;
  title: string;
  meta?: string;
  bigNumber?: string | null;
  imageSrc?: string | null;
  imageAlt: string;
  /** Optional italic pull-line — lore snippet or radio-style detail. */
  editorialTagline?: string | null;
}) {
  const nameParts = title.trim().split(/\s+/);
  const firstName = nameParts.slice(0, -1).join(' ') || title;
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : null;

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
              WebkitTextStroke: '1px color-mix(in srgb, var(--team-secondary) 28%, transparent)',
            }}
          >
            {bigNumber}
          </span>
        ) : null}

        <div className="relative z-10 hidden min-h-[min(82vh,680px)] flex-col justify-end px-5 pb-5 pt-36 md:absolute md:inset-0 md:flex md:min-h-0 md:justify-end md:px-10 md:pb-12 lg:px-16">
          <div className="relative md:max-w-[min(72%,760px)]">
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
                  <span className="block text-[clamp(2.6rem,9vw,7.5rem)] leading-[0.9] tracking-tight md:text-[clamp(3.5rem,7.5vw,8.5rem)]">
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
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
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
        ) : null}

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
