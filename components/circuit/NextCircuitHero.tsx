import Image from 'next/image';
import { displayUpper } from '@/lib/i18n/caps';
import { useLocale, useTranslations } from 'next-intl';
import { countryName, formatDate, raceName as localRaceName } from '@/lib/i18n/format';
import { ApexFallback } from '@/components/media/ApexFallback';
import { Link } from '@/i18n/routing';
import { Countdown } from '@/components/home/Countdown';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { getCircuitFacts } from '@/data/circuits/facts';
import { CURRENT_SEASON, raceStartMs, seasonHasDrs, type CalendarRace } from '@/lib/f1Calendar';
import type { CircuitCard } from '@/lib/data/circuits';

import type { MediaResult } from '@/lib/media/read';
import { MediaAssetView } from '@/components/media/MediaAssetView';

function formatRaceDate(date: string, locale: string): string {
  if (!date || date === '—') return '';
  const t = Date.parse(`${date}T12:00:00Z`);
  if (!Number.isFinite(t)) return date;
  return formatDate(t, locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/**
 * Full-width "Next Grand Prix" split hero — typography + countdown left,
 * atmospheric cover + floating track map right. Pulls the upcoming race out of
 * the card grid so the list below can stay a uniform 3-column scan.
 */
export function NextCircuitHero({
  card,
  race,
  totalRounds,
  media,
}: {
  card: CircuitCard;
  race: CalendarRace;
  totalRounds: number;
  media?: MediaResult | null;
}) {
  const t = useTranslations('ui.circuit');
  const locale = useLocale();
  const facts = getCircuitFacts(card.circuitId, locale);
  const targetMs = raceStartMs(race);
  const raceName = localRaceName(race.raceName ?? 'Grand Prix', locale);
  const round = card.round;

  const stats = [
    facts?.lengthKm != null ? { label: t('length'), value: t('km', { value: facts.lengthKm }) } : null,
    facts?.corners != null ? { label: t('corners'), value: String(facts.corners) } : null,
    facts?.drsZones != null && seasonHasDrs(CURRENT_SEASON) ? { label: t('drs'), value: t('zones', { count: facts.drsZones }) } : null,
    facts?.lapRecord ? { label: t('lapRecordShort'), value: facts.lapRecord } : null,
  ].filter((s): s is { label: string; value: string } => s !== null);

  return (
    <section className="relative -mx-5 mb-8 overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-surface/40 backdrop-blur-sm md:-mx-8 lg:-mx-16">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,46%)]">
        <div className="flex flex-col gap-5 p-6 md:gap-6 md:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-caps text-text-mid">
              {t('roundOf', { round, total: totalRounds })}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
              <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              <span className="label-caps text-accent">{t('upcoming')}</span>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <p className="data-tabular flex items-center gap-1.5 text-text-mid">
              <CountryFlag country={card.country} />
              {countryName(card.country, locale)}
              <span aria-hidden className="text-text-low">·</span>
              {formatRaceDate(card.date, locale)}
            </p>
            <p className="label-caps text-accent">{displayUpper(raceName, locale)}</p>
            <h2 lang="en" className="headline-lg uppercase text-text-hi">{card.circuitName}</h2>
          </div>

          {targetMs ? (
            <div className="flex flex-col gap-2">
              <span className="label-caps text-text-low">{t('raceStart')}</span>
              <Countdown targetMs={targetMs} />
            </div>
          ) : null}

          {stats.length > 0 ? (
            <dl className="grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <dt className="label-caps text-text-low">{s.label}</dt>
                  <dd className="data-tabular text-sm text-text-hi">{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href={`/circuits/${card.circuitId}`}
              className="label-caps inline-flex items-center rounded-[var(--radius)] border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-text-hi transition-colors hover:border-accent/40 hover:bg-accent/10"
            >
              {t('guide')}
            </Link>
            {round !== '—' ? (
              <Link
                href={`/season/${CURRENT_SEASON}/round/${round}`}
                className="label-caps inline-flex items-center rounded-[var(--radius)] border border-hairline px-4 py-2 text-text-mid transition-colors hover:border-white/20 hover:text-text-hi"
              >
                {t('weekend')}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="relative min-h-[260px] overflow-hidden border-t border-white/[0.06] lg:min-h-[380px] lg:border-t-0 lg:border-l bg-surface-raised">
          {media?.status === 'image' ? (
            <MediaAssetView
              type="circuit"
              entityKey={card.circuitId}
              initialResult={media}
              alt={card.circuitName}
              name={card.circuitName}
              objectFit="cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="h-full w-full object-cover [filter:contrast(1.06)_saturate(0.92)] transition-transform duration-700 ease-out hover:scale-105"
              showAttribution={false}
            />
          ) : (
            <ApexFallback kind="circuit" label={card.circuitName} />
          )}

          {/* Multi-layer atmospheric dark vignette to preserve contrast and integrate with UI */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/50 to-[#0a0a0a]/20 lg:bg-gradient-to-l lg:from-[#0a0a0a]/95 lg:via-[#0a0a0a]/50 lg:to-transparent"
          />

          {card.svgSrc ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-6 md:p-8">
              <div className="relative h-full w-full max-h-56 max-w-md drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] md:max-h-72">
                <Image
                  src={card.svgSrc}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 80vw, 400px"
                  className="object-contain opacity-95 brightness-0 invert drop-shadow-[0_0_16px_rgba(255,255,255,0.3)]"
                />
              </div>
            </div>
          ) : null}

          {facts?.signatureCorner || facts?.character ? (
            <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap gap-2">
              {facts.signatureCorner ? (
                <span className="label-caps rounded-full border border-white/10 bg-black/60 px-3 py-1 text-text-hi backdrop-blur-md shadow-sm">
                  {facts.signatureCorner}
                </span>
              ) : null}
              {facts.character ? (
                <span className="label-caps rounded-full border border-white/10 bg-black/60 px-3 py-1 text-text-mid backdrop-blur-md shadow-sm">
                  {facts.character}
                </span>
              ) : null}
            </div>
          ) : null}

          {media?.status === 'image' && media.attribution?.text ? (
            <div className="absolute top-3 right-3 z-20">
              <span className="rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[9px] font-mono text-text-low/80 backdrop-blur-md">
                {media.attribution.text}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
