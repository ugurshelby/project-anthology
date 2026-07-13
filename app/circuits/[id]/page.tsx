import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getCircuitDetail, getCurrentSeasonResults } from '@/lib/data/circuits';
import { getCircuitFacts } from '@/data/circuits/facts';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { TechnicalDossier } from '@/components/profile/TechnicalDossier';
import { SeasonResultsPanel } from '@/components/circuit/SeasonResultsPanel';
import { CircuitCharacter } from '@/components/circuit/CircuitCharacter';
import { circuitCoverSrc } from '@/lib/assets/f1-icons';

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
  const [circuit, results] = await Promise.all([
    getCircuitDetail(id),
    getCurrentSeasonResults(),
  ]);
  if (!circuit) notFound();

  const facts = getCircuitFacts(id);
  const cover = circuitCoverSrc(id);

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

            {/* Track map — glassmorphic surface over the real circuit cover photo */}
            <BentoCard
              span={8}
              className="relative order-1 flex min-h-64 items-center justify-center overflow-hidden !bg-transparent !p-0 md:order-2 md:min-h-80"
            >
              {cover ? (
                <Image
                  src={cover}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="pointer-events-none object-cover opacity-50"
                />
              ) : null}
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-bg/40" />
              <div
                className="relative z-10 m-4 flex h-[calc(100%-2rem)] w-[calc(100%-2rem)] items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-white/15"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                {circuit.svgSrc ? (
                  <div className="relative h-56 w-full md:h-72">
                    <Image src={circuit.svgSrc} alt={`${circuit.circuitName} track map`} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-contain" />
                  </div>
                ) : (
                  <span className="label-caps text-text-low">No track map available</span>
                )}
              </div>
            </BentoCard>

            {facts ? (
              <BentoCard span={6}>
                <CircuitCharacter facts={facts} />
              </BentoCard>
            ) : null}

            {circuit.winners.length > 0 ? (
              <BentoCard span={facts ? 6 : 12}>
                <span className="label-caps mb-3 block text-text-mid">Recent Winners</span>
                <div className="flex flex-col">
                  {circuit.winners.map((w, i) => (
                    <div
                      key={w.season}
                      className={[
                        'flex items-center gap-4 border-b border-hairline py-2.5 last:border-b-0',
                        i === 0 ? 'text-text-hi' : '',
                      ].join(' ')}
                    >
                      <span className={['data-tabular w-14', i === 0 ? 'font-700 text-accent' : 'text-text-mid'].join(' ')}>
                        {w.season}
                      </span>
                      <span
                        className={['font-condensed flex-1 uppercase text-text-hi', i === 0 ? 'text-xl font-700' : 'text-lg font-600'].join(' ')}
                        style={{ fontFamily: 'var(--font-condensed)' }}
                      >
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

        <aside className="hidden w-full shrink-0 flex-col gap-3 lg:flex lg:w-[300px]">
          <span className="label-caps text-text-mid">Results</span>
          <SeasonResultsPanel results={results} />
        </aside>
      </div>
    </PageShell>
  );
}
