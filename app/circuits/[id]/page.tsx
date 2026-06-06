import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { getCircuitDetail, getCircuitIdsForSitemap } from '@/lib/data/circuits';
import { getCircuitFacts } from '@/data/circuits/facts';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const ids = await getCircuitIdsForSitemap();
  return ids.map((id) => ({ id }));
}

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
  };
}

export default async function CircuitDetailPage({ params }: PageProps) {
  const { id } = await params;
  const circuit = await getCircuitDetail(id);
  if (!circuit) notFound();

  const facts = getCircuitFacts(id);

  // Prefer seeded editorial data, fall back to the curated facts module.
  const lengthKm = circuit.editorial.lapLengthKm ?? facts?.lengthKm?.toString() ?? null;
  const drsZones = circuit.editorial.drsZones ?? facts?.drsZones?.toString() ?? null;

  const stats = [
    lengthKm ? { label: 'Length', value: `${lengthKm} km` } : null,
    circuit.laps ? { label: 'Race Laps', value: circuit.laps } : null,
    facts?.corners ? { label: 'Corners', value: String(facts.corners) } : null,
    drsZones ? { label: 'DRS Zones', value: String(drsZones) } : null,
    facts?.firstGp ? { label: 'First GP', value: String(facts.firstGp) } : null,
  ].filter((s): s is { label: string; value: string } => s !== null);

  const characteristics = facts
    ? [
        facts.character ? { label: 'Character', value: facts.character } : null,
        facts.signatureCorner ? { label: 'Signature Corner', value: facts.signatureCorner } : null,
        facts.lapRecord ? { label: 'Lap Record', value: facts.lapRecord } : null,
      ].filter((s): s is { label: string; value: string } => s !== null)
    : [];

  return (
    <div className="content-wrap py-section-gap">
      <Link
        href="/circuits"
        className="font-condensed text-[10px] uppercase tracking-[0.12em]"
        style={{ color: 'var(--accent)' }}
      >
        ← All Circuits
      </Link>

      <header className="mt-6">
        <p
          className="font-mono text-[9px] uppercase tracking-[0.15em]"
          style={{ color: 'rgba(255,24,1,0.7)' }}
        >
          Round {circuit.round} · {circuit.date}
        </p>
        <h1
          className="mt-2 font-display text-[clamp(2.5rem,8vw,5rem)] leading-[0.9] tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          {circuit.circuitName}
        </h1>
        <p
          className="mt-2 font-condensed text-sm uppercase tracking-[0.14em]"
          style={{ color: 'var(--muted)' }}
        >
          {circuit.locality !== '—' ? `${circuit.locality}, ` : ''}
          {circuit.country}
        </p>
      </header>

      <div className="anthology-card mt-8 flex items-center justify-center p-8">
        {circuit.svgSrc ? (
          <SafeImage
            src={circuit.svgSrc}
            alt={circuit.circuitName}
            width={640}
            height={400}
            className="h-auto max-h-[400px] w-full max-w-2xl object-contain opacity-95"
          />
        ) : (
          <div className="h-64 w-full max-w-2xl" style={{ backgroundColor: 'var(--surface)' }} aria-hidden />
        )}
      </div>

      {stats.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p
                className="font-mono text-[9px] uppercase tracking-[0.15em]"
                style={{ color: 'var(--muted)' }}
              >
                {stat.label}
              </p>
              <p
                className="mt-1 font-display text-xl tracking-[0.04em]"
                style={{ color: 'var(--paper)' }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {facts?.note ? (
        <p
          className="mt-8 max-w-2xl text-[15px] font-light leading-relaxed"
          style={{ color: 'var(--paper)' }}
        >
          {facts.note}
        </p>
      ) : null}

      {characteristics.length > 0 ? (
        <section className="mt-section-gap">
          <SectionDivider title="Characteristics" />
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {characteristics.map((c) => (
              <div key={c.label} className="anthology-card p-5">
                <dt
                  className="font-mono text-[9px] uppercase tracking-[0.15em]"
                  style={{ color: 'rgba(255,24,1,0.7)' }}
                >
                  {c.label}
                </dt>
                <dd
                  className="mt-2 font-display text-[1.4rem] leading-tight tracking-[0.03em]"
                  style={{ color: 'var(--paper)' }}
                >
                  {c.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="mt-section-gap">
        <SectionDivider title="Past Winners" />
        {circuit.winners.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            No historical results in database yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {circuit.winners.map((entry) => (
              <li
                key={entry.season}
                className="flex flex-wrap items-baseline justify-between gap-2 py-3"
              >
                <div>
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.15em]"
                    style={{ color: 'rgba(255,24,1,0.7)' }}
                  >
                    {entry.season}
                  </span>
                  <p
                    className="mt-1 font-display text-lg tracking-[0.04em]"
                    style={{ color: 'var(--paper)' }}
                  >
                    {entry.driverName}
                  </p>
                  <p className="text-xs font-light" style={{ color: 'var(--muted)' }}>
                    {entry.raceName} · {entry.constructorName}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
