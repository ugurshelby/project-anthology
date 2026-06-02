import { Suspense } from 'react';
import { CircuitsMasonry } from '@/app/(site)/_components/circuits-masonry';
import { ShimmerGrid } from '@/app/(site)/_components/shimmer';
import { getAllCircuits } from '@/lib/data/circuits';

async function CircuitsSection() {
  const circuits = await getAllCircuits();
  const ordered = [...circuits].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <CircuitsMasonry
      circuits={ordered}
      cloudinaryCloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
    />
  );
}

async function circuitStats(): Promise<{ total: number; countries: number; withLapData: number }> {
  const circuits = await getAllCircuits();
  return {
    total: circuits.length,
    countries: new Set(circuits.map((c) => c.country).filter(Boolean)).size,
    withLapData: circuits.filter((c) => c.lap_length_km).length,
  };
}

export default async function CircuitsPage() {
  const stats = await circuitStats();

  return (
    <main>
      <section className="hero" style={{ minHeight: 'calc(70vh - 52px)' }}>
        <div className="content-wrap hero-inner">
          <p className="eyebrow">World Venues / Circuit Metadata Archive</p>
          <h1 className="hero-title">Circuits</h1>
          <p className="hero-subtitle">
            Circuit cards resolve images with the fallback chain requested: Cloudinary circuit
            asset, local WebP, then local SVG map.
          </p>
          <div className="hud-row">
            <div className="hud-item">
              <p className="hud-label">Total Circuits</p>
              <p className="hud-value">{stats.total}</p>
            </div>
            <div className="hud-item">
              <p className="hud-label">Countries</p>
              <p className="hud-value">{stats.countries}</p>
            </div>
            <div className="hud-item">
              <p className="hud-label">Lap Data</p>
              <p className="hud-value">{stats.withLapData}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="content-wrap section">
        <p className="section-divider">Circuit Masonry</p>
        <Suspense fallback={<ShimmerGrid count={9} />}>
          <CircuitsSection />
        </Suspense>
      </section>
    </main>
  );
}
