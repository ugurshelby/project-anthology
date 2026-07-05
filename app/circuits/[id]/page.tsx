import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getCircuitDetail } from '@/lib/data/circuits';
import { getSeasonData } from '@/lib/data/f1';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { TechnicalDossier } from '@/components/profile/TechnicalDossier';
import { DriverLeaderCard } from '@/components/standings/StandingsLeaderCard';
import { DriverRow } from '@/components/standings/StandingsRow';

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Vercel @vercel/next + Next 16 segment SSG packaging bug — force server render. */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const circuit = await getCircuitDetail(id);
  if (!circuit) {
    return { title: 'Circuit not found' };
  }
  const description = `${circuit.circuitName} — ${circuit.country}. Round ${circuit.round} of the Formula 1 calendar.`;
  return {
    title: circuit.circuitName,
    description,
    alternates: { canonical: `/circuits/${id}` },
    openGraph: {
      title: `${circuit.circuitName} — F1 Circuit`,
      description,
      url: `/circuits/${id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${circuit.circuitName} — F1 Circuit`,
      description,
    },
  };
}

export default async function CircuitDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [circuit, seasonData] = await Promise.all([
    getCircuitDetail(id),
    getSeasonData(CURRENT_SEASON),
  ]);
  if (!circuit) notFound();

  const standings = seasonData.standings.slice(0, 6);
  const [standingsLeader, ...standingsRest] = standings;

  const dossier = [
    { label: 'Round', value: circuit.round ? `R${circuit.round}` : '—' },
    { label: 'Locality', value: circuit.locality || '—' },
    { label: 'Country', value: circuit.country || '—' },
    { label: 'Laps', value: circuit.laps ?? '—' },
    { label: 'Lap Length', value: circuit.editorial.lapLengthKm ? `${circuit.editorial.lapLengthKm} km` : '—' },
    { label: 'DRS Zones', value: circuit.editorial.drsZones ?? '—' },
  ];

  return (
    <PageShell>
      <header className="mb-8 flex flex-col gap-1">
        <span className="label-caps text-text-mid">{circuit.country}</span>
        <h1 className="headline-lg uppercase text-text-hi">{circuit.circuitName}</h1>
        {circuit.raceName ? <p className="data-tabular text-text-mid">{circuit.raceName}</p> : null}
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <BentoGrid>
            <BentoCard span={4} className="order-2 md:order-1">
              <span className="label-caps mb-3 block text-text-mid">Circuit Data</span>
              <TechnicalDossier entries={dossier} />
            </BentoCard>

            <BentoCard span={8} className="relative order-1 flex items-center justify-center overflow-hidden md:order-2">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{ background: 'radial-gradient(120% 120% at 50% 40%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 65%)' }}
              />
              {circuit.svgSrc ? (
                <div className="relative z-10 h-64 w-full md:h-80">
                  <Image src={circuit.svgSrc} alt={`${circuit.circuitName} track map`} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-contain" />
                </div>
              ) : (
                <span className="label-caps relative z-10 text-text-low">No track map available</span>
              )}
            </BentoCard>

            {circuit.winners.length > 0 ? (
              <BentoCard span={12}>
                <span className="label-caps mb-3 block text-text-mid">Recent Winners</span>
                <div className="flex flex-col">
                  {circuit.winners.map((w) => (
                    <div key={w.season} className="flex items-center gap-4 border-b border-hairline py-2.5 last:border-b-0">
                      <span className="data-tabular w-14 text-text-mid">{w.season}</span>
                      <span className="font-condensed flex-1 text-lg font-600 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                        {w.driverName}
                      </span>
                      <span className="data-tabular text-text-mid">{w.constructorName}</span>
                    </div>
                  ))}
                </div>
              </BentoCard>
            ) : null}
          </BentoGrid>
        </div>

        {standingsLeader ? (
          <aside className="hidden w-full shrink-0 flex-col gap-3 lg:flex lg:w-[300px]">
            <span className="label-caps text-text-mid">Driver Standings</span>
            <DriverLeaderCard row={standingsLeader} season={CURRENT_SEASON} />
            <div className="flex flex-col">
              {standingsRest.map((row) => (
                <DriverRow key={row.driverId} row={row} season={CURRENT_SEASON} />
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </PageShell>
  );
}
