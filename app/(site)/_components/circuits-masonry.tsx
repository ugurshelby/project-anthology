'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useReducedMotion } from '@/app/(site)/_components/reduced-motion';
import type { Circuit } from '@/lib/data/circuits';

interface CircuitCardProps {
  circuit: Circuit;
  cloudinaryCloudName?: string;
}

function useCircuitImageChain(id: string, cloudinaryCloudName?: string): string[] {
  return useMemo(() => {
    const chain: string[] = [];
    if (cloudinaryCloudName) {
      chain.push(
        `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/f1-anthology/circuit/${id}`,
      );
    }
    chain.push(`/circuits/${id}.webp`);
    chain.push(`/circuits/${id}.svg`);
    chain.push('/images/placeholders/circuit.svg');
    return chain;
  }, [cloudinaryCloudName, id]);
}

function CircuitCard({ circuit, cloudinaryCloudName }: CircuitCardProps) {
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const chain = useCircuitImageChain(circuit.id, cloudinaryCloudName);
  const [imageIndex, setImageIndex] = useState(0);
  const imageSrc = chain[Math.min(imageIndex, chain.length - 1)];
  const galleryCount = Array.isArray((circuit.data as { gallery?: unknown[] } | null)?.gallery)
    ? ((circuit.data as { gallery?: unknown[] }).gallery ?? []).length
    : 0;

  return (
    <article
      className="card"
      style={{ breakInside: 'avoid', marginBottom: 16, display: 'inline-block', width: '100%' }}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        style={{ all: 'unset', width: '100%', cursor: 'pointer', display: 'block' }}
        aria-expanded={expanded}
      >
        <div className="card-image-wrap">
          <Image
            src={imageSrc}
            alt={circuit.name}
            fill
            sizes="(max-width: 900px) 100vw, 33vw"
            onError={() => setImageIndex((value) => Math.min(value + 1, chain.length - 1))}
          />
        </div>
        <div className="card-body">
          <p className="card-kicker">
            Circuit / {circuit.country ?? 'Unknown Country'} {circuit.flag_emoji ?? ''}
          </p>
          <h3 className="card-title">{circuit.name}</h3>
          <div
            className="expand-panel"
            style={{ maxHeight: expanded ? 240 : 0, transition: reduced ? 'none' : undefined }}
          >
            <p>City: {circuit.city ?? 'Unknown'}</p>
            <p>Lap Length: {circuit.lap_length_km ? `${circuit.lap_length_km} km` : 'N/A'}</p>
            <p>DRS Zones: {circuit.drs_zones ?? 'N/A'}</p>
            <p>First F1 Year: {circuit.first_f1_year ?? 'N/A'}</p>
            <p>Gallery Assets: {galleryCount}</p>
          </div>
        </div>
      </button>
    </article>
  );
}

interface CircuitsMasonryProps {
  circuits: Circuit[];
  cloudinaryCloudName?: string;
}

export function CircuitsMasonry({
  circuits,
  cloudinaryCloudName,
}: CircuitsMasonryProps) {
  return (
    <div style={{ columnCount: 1, columnGap: 16 }}>
      <style>{`
        @media (min-width: 768px) { .circuits-masonry { column-count: 2; } }
        @media (min-width: 1200px) { .circuits-masonry { column-count: 3; } }
      `}</style>
      <div className="circuits-masonry">
        {circuits.map((circuit) => (
          <CircuitCard
            key={circuit.id}
            circuit={circuit}
            cloudinaryCloudName={cloudinaryCloudName}
          />
        ))}
      </div>
    </div>
  );
}
