import { Suspense } from 'react';
import { NewsFeedClient } from '@/app/(site)/_components/news-feed-client';
import { ShimmerGrid } from '@/app/(site)/_components/shimmer';
import { getLatestNews } from '@/lib/data/news';

async function NewsSection() {
  const news = await getLatestNews(24);
  return <NewsFeedClient initialItems={news} />;
}

export default function NewsPage() {
  return (
    <main>
      <section className="hero" style={{ minHeight: 'calc(60vh - 52px)' }}>
        <div className="content-wrap hero-inner">
          <p className="eyebrow">Live Aggregation / 5 Minute Polling</p>
          <h1 className="hero-title">News Room</h1>
          <p className="hero-subtitle">
            Featured story is rendered from server data first, then refreshed with `/api/news`
            polling every five minutes for fresh AI summaries and ranking.
          </p>
          <div className="hud-row">
            <div className="hud-item">
              <p className="hud-label">Server Source</p>
              <p className="hud-value">getLatestNews()</p>
            </div>
            <div className="hud-item">
              <p className="hud-label">Refresh</p>
              <p className="hud-value">300s Poll</p>
            </div>
            <div className="hud-item">
              <p className="hud-label">Feed API</p>
              <p className="hud-value">/api/news</p>
            </div>
          </div>
        </div>
      </section>

      <section className="content-wrap section">
        <p className="section-divider">Latest Headlines</p>
        <Suspense fallback={<ShimmerGrid count={6} />}>
          <NewsSection />
        </Suspense>
      </section>
    </main>
  );
}
