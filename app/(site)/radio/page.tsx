import { Suspense } from 'react';
import { RadioMasonry } from '@/app/(site)/_components/radio-masonry';
import { ShimmerGrid } from '@/app/(site)/_components/shimmer';
import { getAllRadioMoments } from '@/lib/data/radio';

async function RadioSection() {
  const moments = await getAllRadioMoments();
  const ordered = [...moments].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  return <RadioMasonry items={ordered} />;
}

async function radioStats(): Promise<{ total: number; withAudio: number; teams: number }> {
  const moments = await getAllRadioMoments();
  return {
    total: moments.length,
    withAudio: moments.filter((item) => item.audio_url).length,
    teams: new Set(moments.map((item) => item.team).filter(Boolean)).size,
  };
}

export default async function RadioPage() {
  const stats = await radioStats();

  return (
    <main>
      <section className="hero" style={{ minHeight: 'calc(70vh - 52px)' }}>
        <div className="content-wrap hero-inner">
          <p className="eyebrow">Driver Voices / Historical Team Radio</p>
          <h1 className="hero-title">Radio Anthology</h1>
          <p className="hero-subtitle">
            The grid below renders real radio moment records. Play buttons stay disabled if a
            moment has no audio URL.
          </p>
          <div className="hud-row">
            <div className="hud-item">
              <p className="hud-label">Total Moments</p>
              <p className="hud-value">{stats.total}</p>
            </div>
            <div className="hud-item">
              <p className="hud-label">Audio Available</p>
              <p className="hud-value">{stats.withAudio}</p>
            </div>
            <div className="hud-item">
              <p className="hud-label">Teams Covered</p>
              <p className="hud-value">{stats.teams}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="content-wrap section">
        <p className="section-divider">Radio Masonry</p>
        <Suspense fallback={<ShimmerGrid count={9} />}>
          <RadioSection />
        </Suspense>
      </section>
    </main>
  );
}
