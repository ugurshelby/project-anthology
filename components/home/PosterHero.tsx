import Image from 'next/image';
import Link from 'next/link';
import { Countdown } from './Countdown';

export interface PosterHeroProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  countdownTargetMs: number | null;
  circuitCoverSrc: string | null;
  showMobileLogo?: boolean;
}

/**
 * Sinematik poster hero — Poster Dense (mobile ~42dvh) / Split Cinema left panel (lg 60dvh).
 */
export function PosterHero({
  eyebrow,
  title,
  subtitle,
  countdownTargetMs,
  circuitCoverSrc,
  showMobileLogo = true,
}: PosterHeroProps) {
  return (
    <section className="relative flex min-h-[42dvh] flex-col justify-end overflow-hidden md:min-h-[35vh] lg:min-h-[60vh]">
      {circuitCoverSrc ? (
        <Image
          src={circuitCoverSrc}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="pointer-events-none object-cover object-center"
        />
      ) : null}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-bg/20"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#2a0a0a]/80 via-transparent to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
      />

      {showMobileLogo ? (
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-[max(12px,env(safe-area-inset-top))] md:hidden">
          <Link
            href="/"
            className="font-condensed text-xl font-700 tracking-tight text-text-hi"
            style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700 }}
          >
            APEX
          </Link>
        </div>
      ) : null}

      <div className="relative z-10 flex flex-col gap-1 px-5 pb-8 pt-16 md:px-8 md:pb-10 lg:px-12 lg:pb-12">
        <span className="label-caps text-accent">{eyebrow}</span>
        <h1 className="display-hero uppercase text-text-hi">{title}</h1>
        {subtitle ? <p className="data-tabular text-text-mid">{subtitle}</p> : null}
        <div className="mt-4 md:mt-6">
          {countdownTargetMs ? (
            <Countdown targetMs={countdownTargetMs} />
          ) : (
            <span className="label-caps text-text-low">Schedule to be confirmed</span>
          )}
        </div>
      </div>
    </section>
  );
}
