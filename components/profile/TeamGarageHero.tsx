import Image from 'next/image';
import type { CSSProperties } from 'react';

const CAR_MASK: CSSProperties = {
  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
};

/**
 * Team garage hero — layered magazine cover: watermark numbers + name (z-0),
 * oversized car profile (z-10), constructor title on a glass panel (z-20).
 * Background is an industrial pit-lane wash built from the team car (blurred)
 * plus floor grid — no stock photography.
 */
export function TeamGarageHero({
  kicker,
  title,
  meta,
  imageSrc,
  imageAlt,
  logoSrc,
  flankNumbers,
}: {
  kicker?: string;
  title: string;
  meta?: string;
  imageSrc?: string | null;
  imageAlt: string;
  logoSrc?: string | null;
  flankNumbers?: [string | null, string | null];
}) {
  const [n1, n2] = flankNumbers ?? [null, null];
  const watermark = [n1, n2].filter(Boolean).join('  ') || title;

  return (
    <section className="relative -mx-5 mb-4 overflow-hidden md:-mx-8 lg:-mx-16">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, color-mix(in srgb, var(--team-secondary) 16%, #050505) 0%, #050505 88%)',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(255,255,255,0.035) 47px, rgba(255,255,255,0.035) 48px), repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(255,255,255,0.035) 47px, rgba(255,255,255,0.035) 48px)',
        }}
      />
      {imageSrc ? (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="100vw"
            className="scale-[2.4] object-cover object-center opacity-25 blur-2xl saturate-50"
          />
        </div>
      ) : null}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 40%, color-mix(in srgb, var(--team-secondary) 18%, transparent), transparent 70%)',
        }}
      />

      <div className="relative min-h-[min(72vh,560px)] md:min-h-[520px] lg:min-h-[580px]">
        <span
          aria-hidden
          className="hero-number pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center text-[clamp(6rem,22vw,14rem)] leading-none text-transparent"
          style={{ WebkitTextStroke: '1px color-mix(in srgb, var(--team-secondary) 28%, transparent)' }}
        >
          {watermark}
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[8%] z-0 hidden select-none text-center font-condensed text-[clamp(4rem,14vw,11rem)] font-700 uppercase leading-none text-white/[0.04] md:block"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {title}
        </span>

        {imageSrc ? (
          <div className="absolute inset-x-0 top-[8%] z-10 mx-auto h-[min(42vh,280px)] w-full max-w-[1200px] md:top-[6%] md:h-[min(58vh,420px)] lg:h-[min(62vh,460px)]" style={CAR_MASK}>
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-contain object-bottom scale-110 md:scale-125 lg:scale-[1.35]"
            />
          </div>
        ) : null}

        <div className="relative z-20 hidden min-h-[520px] flex-col justify-end px-10 pb-12 lg:px-16 md:flex">
          <div className="flex items-end justify-between gap-6">
            <div className="max-w-xl">
              {kicker ? <span className="label-caps text-text-mid">{kicker}</span> : null}
              <h1 className="display-hero mt-2 italic uppercase leading-[0.86] text-text-hi">{title}</h1>
              {meta ? <p className="data-tabular mt-3 text-text-mid">{meta}</p> : null}
            </div>
            {logoSrc ? (
              <div className="relative h-14 w-14 shrink-0 opacity-80">
                <Image src={logoSrc} alt="" fill sizes="56px" className="object-contain" />
              </div>
            ) : null}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-5 md:hidden">
          <div className="rounded-[var(--radius-lg)] border border-white/[0.12] bg-black/50 p-5 backdrop-blur-md">
            {kicker ? <span className="label-caps text-text-mid">{kicker}</span> : null}
            <h1 className="display-hero mt-2 uppercase italic text-text-hi">{title}</h1>
            {meta ? <p className="data-tabular mt-2 text-text-mid">{meta}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
