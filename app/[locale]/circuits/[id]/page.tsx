import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { countryName } from '@/lib/i18n/format';
import { localizedAlternates } from '@/lib/seo';
import { getCircuitDetail, getCurrentSeasonResults, getCircuitWeather } from '@/lib/data/circuits';
import { getCircuitFacts } from '@/data/circuits/facts';
import { CURRENT_SEASON, seasonHasDrs } from '@/lib/f1Calendar';
import nextDynamic from 'next/dynamic';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { SeasonResultsPanel } from '@/components/circuit/SeasonResultsPanel';
import { CircuitCharacter } from '@/components/circuit/CircuitCharacter';
import { CircuitWeatherCard } from '@/components/circuit/CircuitWeatherCard';
import { CircuitHero } from '@/components/circuit/CircuitHero';
import { CircuitFactsRibbon } from '@/components/circuit/CircuitFactsRibbon';
import { TrackTrace } from '@/components/circuit/TrackTrace';
import { hasElevationProfile } from '@/data/circuits/topography';
import { hasCircuitLore } from '@/data/circuits/lore';
import { circuitIconSrc } from '@/lib/assets/f1-icons';
import { getMedia } from '@/lib/media/read';

const CircuitElevationProfile = nextDynamic(
  () => import('@/components/circuit/CircuitElevationProfile').then((m) => m.CircuitElevationProfile),
  {
    loading: () => <div className="h-44 rounded-2xl bg-surface border border-hairline animate-pulse" />,
  }
);

const CircuitLoreCards = nextDynamic(
  () => import('@/components/circuit/CircuitLoreCards').then((m) => m.CircuitLoreCards)
);

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

/** Vercel @vercel/next + Next 16 segment SSG packaging bug — force server render. */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const circuit = await getCircuitDetail(id);
  const t = await getTranslations({ locale, namespace: 'ui.circuit' });
  if (!circuit) {
    return { title: (await getTranslations({ locale, namespace: 'system.entityNotFound' }))('circuit') };
  }
  const description = t('detailMeta', { name: circuit.circuitName, country: countryName(circuit.country, locale), round: circuit.round });
  return {
    title: circuit.circuitName,
    description,
    alternates: localizedAlternates(`/circuits/${id}`, locale),
    openGraph: {
      title: t('detailOg', { name: circuit.circuitName }),
      description,
      url: `/circuits/${id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('detailOg', { name: circuit.circuitName }),
      description,
    },
  };
}

export default async function CircuitDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ui.circuit' });
  const [circuit, results, weather, circuitMedia] = await Promise.all([
    getCircuitDetail(id),
    getCurrentSeasonResults(),
    getCircuitWeather(id),
    getMedia('circuit', id),
  ]);
  if (!circuit) notFound();

  const facts = getCircuitFacts(id, locale);
  const svgTrackSrc = circuit.svgSrc ?? circuitIconSrc(id);
  const num = (v: string | number | null | undefined) => {
    const n = typeof v === 'number' ? v : parseFloat(v ?? '');
    return Number.isFinite(n) ? n : null;
  };
  const lengthKm = num(facts?.lengthKm) ?? num(circuit.editorial.lapLengthKm);
  const drsZones = seasonHasDrs(CURRENT_SEASON) ? (num(facts?.drsZones) ?? num(circuit.editorial.drsZones)) : null;

  // Plan Faz 13 (component rules §9). One home per figure: hero = place, date, status;
  // strip = lap and race numbers; map = outline + DRS; guide = character text.
  return (
    <PageShell>
      <CircuitHero circuit={circuit} media={circuitMedia} trackSrc={svgTrackSrc} firstGp={facts?.firstGp} />

      <CircuitFactsRibbon
        lengthKm={lengthKm}
        corners={num(facts?.corners)}
        laps={num(circuit.laps)}
        lapRecord={facts?.lapRecord ?? null}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <BentoGrid>
            <BentoCard span={facts ? 7 : 12} className="relative flex min-h-80 flex-col overflow-hidden">
              <div className="flex items-center justify-between gap-3">
                <span className="label-caps text-text-mid">{t('blueprint')}</span>
                {drsZones != null ? (
                  <span className="rounded-full border border-hairline px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-text-mid">
                    {t('elevation.drsZones', { count: drsZones })}
                  </span>
                ) : null}
              </div>
              <div className="relative my-auto h-64 w-full py-4 md:h-80">
                {svgTrackSrc ? (
                  <TrackTrace src={svgTrackSrc} label={t('mapAlt', { name: circuit.circuitName })} />
                ) : (
                  <span className="label-caps text-text-low">{t('noMap')}</span>
                )}
              </div>
              {svgTrackSrc ? <span className="font-mono text-[10px] text-text-low">{t('mapSource')}</span> : null}
            </BentoCard>

            {facts ? (
              <BentoCard span={5}>
                <CircuitCharacter facts={facts} />
              </BentoCard>
            ) : null}

            {/* Topography and demands (curated circuits only; editorial estimates, labelled) */}
            {hasElevationProfile(id) ? (
              <div className="col-span-1 md:col-span-8 lg:col-span-12 bento-deferred">
                <CircuitElevationProfile circuitId={id} />
              </div>
            ) : null}

            {weather ? (
              <BentoCard span={circuit.winners.length > 0 ? 4 : 12}>
                <CircuitWeatherCard weather={weather} />
              </BentoCard>
            ) : null}

            {circuit.winners.length > 0 ? (
              <BentoCard span={weather ? 8 : 12} deferred>
                <span className="label-caps mb-3 block text-text-mid">{t('recentWinners')}</span>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {circuit.winners.map((w, i) => (
                    <div
                      key={w.season}
                      className={[
                        'flex items-center justify-between rounded-lg border bg-white/[0.02] p-3 transition-colors hover:border-white/15',
                        i === 0 ? 'border-white/20' : 'border-hairline',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3">
                        <span className={['font-mono text-sm tabular-nums', i === 0 ? 'font-bold text-text-hi' : 'text-text-mid'].join(' ')}>
                          {w.season}
                        </span>
                        <div>
                          <span
                            lang="en"
                            className={['font-condensed block uppercase text-text-hi', i === 0 ? 'text-lg font-700' : 'text-base font-600'].join(' ')}
                            style={{ fontFamily: 'var(--font-condensed)' }}
                          >
                            {w.driverName}
                          </span>
                          <span lang="en" className="text-xs text-text-mid">{w.constructorName}</span>
                        </div>
                      </div>
                      {i === 0 ? (
                        <span className="rounded-full border border-hairline px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-text-mid">
                          {t('latestWin')}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </BentoCard>
            ) : null}

            {/* Historical moments (circuits with recorded lore only) */}
            {hasCircuitLore(id) ? (
              <BentoCard span={12} deferred>
                <CircuitLoreCards circuitId={id} />
              </BentoCard>
            ) : null}
          </BentoGrid>
        </div>

        <aside className="hidden w-full shrink-0 flex-col gap-3 lg:flex lg:w-[300px]">
          <span className="label-caps text-text-mid">{t('results')}</span>
          <SeasonResultsPanel results={results} />
        </aside>
      </div>
    </PageShell>
  );
}
