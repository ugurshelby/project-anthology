import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getCircuitDetail } from '@/lib/data/circuits';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { TechnicalDossier } from '@/components/profile/TechnicalDossier';

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
  const circuit = await getCircuitDetail(id);
  if (!circuit) notFound();

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

      <BentoGrid>
        <BentoCard span={8} className="flex items-center justify-center">
          {circuit.svgSrc ? (
            <div className="relative h-64 w-full md:h-80">
              <Image src={circuit.svgSrc} alt={`${circuit.circuitName} track map`} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-contain" />
            </div>
          ) : (
            <span className="label-caps text-text-low">No track map available</span>
          )}
        </BentoCard>

        <BentoCard span={4}>
          <span className="label-caps mb-3 block text-text-mid">Circuit Data</span>
          <TechnicalDossier entries={dossier} />
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
    </PageShell>
  );
}
