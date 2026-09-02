import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

const PORTRAIT_MASK: CSSProperties = {
  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 78%, rgba(0,0,0,0) 100%)',
  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 78%, rgba(0,0,0,0) 100%)',
};

const CAR_MASK: CSSProperties = {
  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 68%, rgba(0,0,0,0) 98%)',
  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 68%, rgba(0,0,0,0) 98%)',
};

/**
 * Cinematic profile hero (Apex sinematik dil, driver/team detail).
 * Full-bleed within the page container — portrait drivers get a split-cinema
 * layout on lg (title left, cutout right); team pages keep the car strip.
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
  return (
    <section className="relative -mx-5 overflow-hidden md:-mx-8 lg:-mx-16">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, color-mix(in srgb, var(--team-secondary) 22%, transparent) 0%, rgba(0,0,0,0.35) 50%, var(--bg) 100%)',
        }}
      />

      {imageKind === 'portrait' ? (
        <>
          {bigNumber ? (
            <span
              aria-hidden
              className="hero-number pointer-events-none absolute inset-y-0 left-0 z-0 hidden w-[58%] select-none items-center justify-start pl-6 text-[clamp(160px,22vw,380px)] leading-none text-text-hi/[0.07] md:flex md:pl-10"
              style={{
                WebkitTextStroke: '1px color-mix(in srgb, var(--team-secondary) 45%, transparent)',
              }}
            >
              {bigNumber}
            </span>
          ) : null}

          <div className="relative z-20 grid min-h-[min(50vh,440px)] grid-cols-1 items-end gap-4 px-5 pb-6 pt-4 sm:gap-5 md:min-h-[min(48vh,480px)] md:grid-cols-[minmax(0,1fr)_minmax(220px,40%)] md:gap-6 md:px-8 md:pb-8 lg:min-h-[min(52vh,520px)] lg:grid-cols-[minmax(0,1fr)_minmax(260px,42%)] lg:gap-8 lg:px-16 lg:pb-10 lg:pt-8">
            <div className="relative order-1 flex h-[min(42vh,360px)] w-full items-end justify-center sm:h-[min(44vh,400px)] md:order-2 md:col-start-2 md:h-[min(50vh,460px)] md:justify-end lg:h-[min(56vh,520px)]">
              {bigNumber ? (
                <span
                  aria-hidden
                  className="hero-number pointer-events-none absolute inset-x-0 top-2 z-0 flex justify-center select-none text-[clamp(88px,26vw,168px)] leading-none text-text-hi/12 md:hidden"
                  style={{
                    WebkitTextStroke: '1px color-mix(in srgb, var(--team-secondary) 55%, transparent)',
                  }}
                >
                  {bigNumber}
                </span>
              ) : null}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-[5%] bottom-0 top-[15%] opacity-50 blur-3xl"
                style={{
                  background:
                    'radial-gradient(ellipse 80% 70% at 50% 80%, color-mix(in srgb, var(--team-secondary) 35%, transparent), transparent 70%)',
                }}
              />
              {imageSrc ? (
                <div
                  className="relative z-10 h-full w-full max-w-[min(82vw,380px)] sm:max-w-[min(76vw,420px)] md:max-w-none md:w-full"
                  style={PORTRAIT_MASK}
                >
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    sizes="(max-width: 1024px) 82vw, 42vw"
                    className="object-contain object-bottom md:object-right-bottom md:scale-[1.05] lg:scale-[1.08]"
                    priority
                  />
                </div>
              ) : null}
            </div>

            <div className="order-2 flex flex-col items-center gap-2 text-center md:order-1 md:col-start-1 md:row-start-1 md:items-start md:justify-end md:self-end md:pb-1 md:text-left">
              {kicker ? <span className="label-caps text-text-mid">{kicker}</span> : null}
              <h1 className="display-hero uppercase text-text-hi">{title}</h1>
              {meta ? <p className="data-tabular text-text-mid">{meta}</p> : null}
              {children}
            </div>
          </div>
        </>
      ) : (
        <>
          {bigNumber ? (
            <span
              aria-hidden
              className="hero-number pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center text-[clamp(140px,24vw,320px)] leading-none text-text-hi/[0.05]"
            >
              {bigNumber}
            </span>
          ) : null}

          <div className="relative z-20 flex flex-col items-center gap-3 px-5 pt-8 pb-4 text-center md:px-8 md:pt-12 lg:px-16 lg:pt-14">
            {kicker ? <span className="label-caps text-text-mid">{kicker}</span> : null}
            <h1 className="display-hero uppercase text-text-hi">{title}</h1>
            {meta ? <p className="data-tabular text-text-mid">{meta}</p> : null}
            {children}
          </div>

          <div className="relative z-10 flex flex-col items-center gap-3 px-5 pb-8 md:px-8 lg:px-16 lg:pb-12">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 blur-2xl"
              style={{
                background:
                  'linear-gradient(to top, color-mix(in srgb, var(--team-secondary) 18%, transparent), transparent)',
              }}
            />
            {logoSrc ? (
              <div className="relative z-10 h-10 w-10 md:h-14 md:w-14">
                <Image src={logoSrc} alt="" fill sizes="56px" className="object-contain" />
              </div>
            ) : null}
            <div className="relative z-10 flex w-full max-w-3xl items-end justify-center gap-3 sm:gap-6 md:gap-10">
              <span className="hero-number hidden shrink-0 text-3xl text-text-hi/20 sm:block md:text-5xl">
                {flankNumbers?.[0] ?? ''}
              </span>
              {imageSrc ? (
                <div className="relative h-36 w-full sm:h-44 md:h-52" style={CAR_MASK}>
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
              <span className="hero-number hidden shrink-0 text-3xl text-text-hi/20 sm:block md:text-5xl">
                {flankNumbers?.[1] ?? ''}
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
