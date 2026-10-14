import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { countryName, formatDate, raceName as localRaceName } from '@/lib/i18n/format';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { Countdown } from '@/components/home/Countdown';
import { MediaAssetView } from '@/components/media/MediaAssetView';
import { MediaCredit } from '@/components/media/MediaCredit';
import type { MediaResult } from '@/lib/media/read';
import type { CircuitDetail } from '@/lib/data/circuits';

/**
 * Circuit poster hero (plan 13.2): full-bleed venue photo, or the track outline on
 * the surface when there is none, under a dark vignette; the circuit name at
 * display scale; country, round, race date and race status. Apex red appears only
 * on the "next race" status (component rules §9, accent discipline).
 */
export function CircuitHero({
  circuit,
  media,
  trackSrc,
  firstGp,
}: {
  circuit: CircuitDetail;
  media: MediaResult;
  trackSrc: string | null;
  firstGp?: number;
}) {
  const t = useTranslations('ui.circuit');
  const ts = useTranslations('ui.status');
  const locale = useLocale();
  const date = Date.parse(`${circuit.date}T12:00:00Z`);
  const dateLabel = Number.isFinite(date)
    ? formatDate(date, locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    : null;
  const round = Number(circuit.round);

  return (
    <section className="relative -mx-5 mb-6 overflow-hidden border-b border-hairline md:-mx-8 md:mb-8 md:rounded-[var(--radius-lg)] md:border lg:-mx-16">
      {/* Background: venue photo, else the track outline as a quiet watermark */}
      <div aria-hidden={media.status !== 'image'} className="absolute inset-0">
        {media.status === 'image' ? (
          <MediaAssetView
            type="circuit"
            entityKey={circuit.circuitId}
            initialResult={media}
            alt={t('venueAlt', { name: circuit.circuitName })}
            name={circuit.circuitName}
            className="h-full w-full"
            objectFit="cover"
            sizes="100vw"
            priority
            showAttribution={false}
          />
        ) : trackSrc ? (
          <div className="absolute -right-10 top-1/2 h-[120%] w-[70%] -translate-y-1/2 opacity-[0.07] md:right-0">
            <Image src={trackSrc} alt="" fill sizes="70vw" className="object-contain invert" />
          </div>
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, #0a0a0a 10%, rgba(10,10,10,0.72) 55%, rgba(10,10,10,0.35) 100%), linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.2) 60%, transparent 100%)',
          }}
        />
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

      <div className="relative flex min-h-[40vh] flex-col justify-end gap-4 px-5 pb-7 pt-12 md:min-h-[420px] md:px-8 md:pb-10 lg:px-16">
        <div className="flex flex-wrap items-center gap-2">
          {Number.isFinite(round) ? (
            <span className="rounded-full border border-hairline bg-black/40 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-text-mid">
              {t('roundOf', { round, total: circuit.totalRounds })}
            </span>
          ) : null}
          {circuit.status === 'next' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-accent">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
              {ts('next')}
            </span>
          ) : (
            <span className="rounded-full border border-hairline bg-black/40 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-text-mid">
              {circuit.status === 'done' ? ts('done') : ts('upcoming')}
            </span>
          )}
          {firstGp ? (
            <span className="rounded-full border border-hairline bg-black/40 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-text-mid">
              {t('firstGp')} {firstGp}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm text-text-mid">
            <CountryFlag country={circuit.country} className="h-3 w-[18px] rounded-[2px]" />
            <span>{countryName(circuit.country, locale)}</span>
            {circuit.locality && circuit.locality !== '—' ? (
              <>
                <span aria-hidden className="text-text-low">·</span>
                <span lang="en">{circuit.locality}</span>
              </>
            ) : null}
            {dateLabel ? (
              <>
                <span aria-hidden className="text-text-low">·</span>
                <span className="tabular-nums">{dateLabel}</span>
              </>
            ) : null}
          </p>
          <h1
            lang="en"
            className="font-condensed max-w-4xl text-balance text-[clamp(2.75rem,8vw,6rem)] font-700 uppercase leading-[0.92] tracking-[-0.02em] text-text-hi"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {circuit.circuitName}
          </h1>
          {circuit.raceName ? <p className="text-base text-text-mid">{localRaceName(circuit.raceName, locale)}</p> : null}
        </div>

        {circuit.status !== 'done' && circuit.startMs ? (
          <div className="flex flex-col gap-2">
            <span className="label-caps text-text-low">{t('raceStart')}</span>
            <Countdown targetMs={circuit.startMs} />
          </div>
        ) : null}
      </div>

      {media.status === 'image' && media.attribution?.text ? (
        <MediaCredit attribution={media.attribution} className="absolute bottom-2 right-3 max-w-[60%]" />
      ) : null}
    </section>
  );
}
