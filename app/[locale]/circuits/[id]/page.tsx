import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { countryName, raceName } from '@/lib/i18n/format';
import Image from 'next/image';
import { localizedAlternates } from '@/lib/seo';
import { getCircuitDetail, getCurrentSeasonResults, getCircuitWeather } from '@/lib/data/circuits';
import { getCircuitFacts } from '@/data/circuits/facts';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { TechnicalDossier } from '@/components/profile/TechnicalDossier';
import { SeasonResultsPanel } from '@/components/circuit/SeasonResultsPanel';
import { CircuitCharacter } from '@/components/circuit/CircuitCharacter';
import { CircuitWeatherCard } from '@/components/circuit/CircuitWeatherCard';
import { CircuitElevationProfile } from '@/components/circuit/CircuitElevationProfile';
import { hasElevationProfile } from '@/data/circuits/topography';
import { hasCircuitLore } from '@/data/circuits/lore';
import { CircuitLoreCards } from '@/components/circuit/CircuitLoreCards';
import { circuitIconSrc } from '@/lib/assets/f1-icons';
import { MediaAssetView } from '@/components/media/MediaAssetView';
import { getMedia } from '@/lib/media/read';

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

  const dossier = [
    { label: t('round'), value: circuit.round ? String(circuit.round) : '' },
    { label: t('locality'), value: circuit.locality ?? '' },
    { label: t('country'), value: countryName(circuit.country, locale) },
    { label: t('laps'), value: circuit.laps != null ? String(circuit.laps) : '' },
    { label: t('lapLength'), value: circuit.editorial.lapLengthKm ? t('km', { value: circuit.editorial.lapLengthKm }) : '' },
    { label: t('drsZones'), value: circuit.editorial.drsZones != null ? String(circuit.editorial.drsZones) : '' },
  ].filter((e) => e.value !== '');

  return (
    <PageShell>
      <header className="mb-8 flex flex-col gap-1">
        <span className="label-caps text-text-mid">{countryName(circuit.country, locale)}</span>
        <h1 className="headline-lg uppercase text-text-hi">{circuit.circuitName}</h1>
        {circuit.raceName ? <p className="data-tabular text-text-mid">{raceName(circuit.raceName, locale)}</p> : null}
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <BentoGrid>
            <BentoCard span={4} className="order-2 md:order-1">
              <span className="label-caps mb-3 block text-text-mid">{t('data')}</span>
              <TechnicalDossier entries={dossier} />
            </BentoCard>

            {/* Track map — CAD Blueprint Viewport with telemetry grid & crosshairs */}
            <BentoCard
              span={8}
              className="relative order-1 flex min-h-72 flex-col justify-between overflow-hidden !bg-[#0b0f14] !p-5 md:order-2 md:min-h-88 border border-white/10"
            >
              {/* CAD Engineering Background Grid */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
                  `,
                  backgroundSize: '32px 32px',
                }}
              />

              {/* CAD Crosshairs in corners */}
              <div aria-hidden="true" className="pointer-events-none absolute top-3 left-3 font-mono text-[10px] text-white/30">
                + [LAT_LON.CAD_GRID]
              </div>
              <div aria-hidden="true" className="pointer-events-none absolute top-3 right-3 font-mono text-[10px] text-accent/60">
                FIA GRADE 1 // APEX TELEMETRY
              </div>
              <div aria-hidden="true" className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] text-white/30">
                SCALE: 1:5000 // SECTOR S1-S2-S3
              </div>

              {/* Radial center glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-accent/[0.06] blur-3xl"
              />

              {/* Technical Header HUD */}
              <div className="relative z-10 flex items-center justify-between text-xs font-mono text-text-low">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="uppercase tracking-widest text-text-hi text-[11px] font-bold">
                    {circuit.circuitName} {'//'} {t('blueprint')}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  {circuit.editorial.lapLengthKm ? (
                    <span className="rounded bg-white/[0.04] px-2 py-0.5 border border-white/5">
                      {t('km', { value: circuit.editorial.lapLengthKm })}
                    </span>
                  ) : null}
                  {circuit.editorial.drsZones ? (
                    <span className="rounded bg-white/[0.04] px-2 py-0.5 border border-white/5 text-accent">
                      {t('elevation.drsZones', { count: Number(circuit.editorial.drsZones) })}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Vector Track Geometry */}
              <div className="relative z-10 my-auto flex items-center justify-center py-6">
                {svgTrackSrc ? (
                  <div className="relative h-56 w-full md:h-72 drop-shadow-[0_0_24px_rgba(255,24,1,0.18)]">
                    <Image
                      src={svgTrackSrc}
                      alt={t('mapAlt', { name: circuit.circuitName })}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-contain transition-transform duration-500 hover:scale-[1.02]"
                    />
                  </div>
                ) : (
                  <span className="label-caps text-text-low">{t('noMap')}</span>
                )}
              </div>

              {/* Bottom Telemetry Bar */}
              <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2 text-[11px] font-mono text-text-mid">
                <span>{t('circuitIdLabel', { id: circuit.circuitId.toUpperCase() })}</span>
                <span>{circuit.locality}, {countryName(circuit.country, locale)}</span>
              </div>
            </BentoCard>

            {/* Elevation & Topography Profile (curated circuits only) */}
            {hasElevationProfile(id) ? (
              <BentoCard span={12}>
                <CircuitElevationProfile
                  circuitId={id}
                  lengthKm={
                    circuit.editorial.lapLengthKm ? parseFloat(circuit.editorial.lapLengthKm) : facts?.lengthKm
                  }
                  drsZones={
                    circuit.editorial.drsZones ? parseInt(circuit.editorial.drsZones, 10) : facts?.drsZones
                  }
                  corners={facts?.corners}
                />
              </BentoCard>
            ) : null}

            {/* Authentic Aerial Venue Photograph (when available) */}
            {circuitMedia.status === 'image' ? (
              <BentoCard span={12} className="overflow-hidden !p-0">
                <div className="relative h-64 w-full md:h-80">
                  <MediaAssetView
                    type="circuit"
                    entityKey={id}
                    initialResult={circuitMedia}
                    alt={`${circuit.circuitName} venue`}
                    name={circuit.circuitName}
                    aspectRatio="21/9"
                    className="h-full w-full object-cover"
                  />
                </div>
              </BentoCard>
            ) : null}

            {weather ? (
              <BentoCard span={6}>
                <CircuitWeatherCard weather={weather} />
              </BentoCard>
            ) : null}

            {facts ? (
              <BentoCard span={6}>
                <CircuitCharacter facts={facts} />
              </BentoCard>
            ) : null}

            {/* Historical Lore Cards (circuits with recorded moments only) */}
            {hasCircuitLore(id) ? (
              <BentoCard span={12}>
                <CircuitLoreCards circuitId={id} />
              </BentoCard>
            ) : null}

            {circuit.winners.length > 0 ? (
              <BentoCard span={12}>
                <span className="label-caps mb-3 block text-text-mid">{t('recentWinners')}</span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {circuit.winners.map((w, i) => (
                    <div
                      key={w.season}
                      className={[
                        'flex items-center justify-between rounded-lg border border-hairline bg-white/[0.02] p-3 transition-colors hover:border-white/15',
                        i === 0 ? 'border-accent/40 bg-accent/[0.04]' : '',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3">
                        <span className={['data-tabular font-mono text-sm', i === 0 ? 'font-bold text-accent' : 'text-text-mid'].join(' ')}>
                          {w.season}
                        </span>
                        <div>
                          <span
                            className={['font-condensed block uppercase text-text-hi', i === 0 ? 'text-lg font-700' : 'text-base font-600'].join(' ')}
                            style={{ fontFamily: 'var(--font-condensed)' }}
                          >
                            {w.driverName}
                          </span>
                          <span className="text-xs text-text-mid">{w.constructorName}</span>
                        </div>
                      </div>
                      {i === 0 ? (
                        <span className="rounded bg-accent/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-accent">
                          LATEST
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
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
