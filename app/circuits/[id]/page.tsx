import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCircuitDetail, getCircuitIdsForSitemap } from '@/lib/data/circuits';

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
  void circuit;

  return <main id="main-content">{circuit.circuitName}</main>;
}
