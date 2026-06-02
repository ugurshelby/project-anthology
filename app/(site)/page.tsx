import { Suspense } from 'react';
import { ExpandableCard } from '@/app/(site)/_components/expandable-card';
import { ShimmerGrid } from '@/app/(site)/_components/shimmer';
import { getAllStories } from '@/lib/data/stories';

function storyExcerpt(content: unknown, subtitle: string | null): string {
  if (Array.isArray(content)) {
    const paragraph = content.find(
      (block) =>
        typeof block === 'object' &&
        block !== null &&
        'type' in block &&
        'text' in block &&
        (block as { type?: string }).type === 'paragraph',
    ) as { text?: string } | undefined;
    if (paragraph?.text) return paragraph.text.slice(0, 180);
  }
  return (subtitle ?? '').slice(0, 180);
}

async function StoryGrid() {
  const stories = await getAllStories();
  const ordered = [...stories].sort(
    (a, b) => (a.year ?? Number.MAX_SAFE_INTEGER) - (b.year ?? Number.MAX_SAFE_INTEGER),
  );

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
      {ordered.map((story) => (
        <ExpandableCard
          key={story.id}
          imageSrc={
            story.cover_image_landscape ??
            story.cover_image ??
            story.cover_image_portrait ??
            '/images/placeholders/driver.svg'
          }
          imageAlt={story.title}
          kicker={`${story.category ?? 'Story'} / ${story.year ?? 'Unknown year'}`}
          title={story.title}
          summary={storyExcerpt(story.content, story.subtitle)}
          ctaLabel="Read Story ->"
          ctaHref={`/stories/${story.slug}`}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      <section className="hero" style={{ minHeight: 'calc(100vh - 52px)' }}>
        <div className="content-wrap hero-inner">
          <p className="eyebrow">F1 Memory Engine / Story Archive</p>
          <h1 className="hero-title">Project Anthology</h1>
          <p className="hero-subtitle">
            Every story card below is sourced from the real anthology dataset and ordered
            chronologically from the earliest era to modern Formula 1.
          </p>
          <div className="hud-row">
            <div className="hud-item">
              <p className="hud-label">Mode</p>
              <p className="hud-value">Chronological ASC</p>
            </div>
            <div className="hud-item">
              <p className="hud-label">Source</p>
              <p className="hud-value">getAllStories()</p>
            </div>
            <div className="hud-item">
              <p className="hud-label">Interaction</p>
              <p className="hud-value">In-place Expand</p>
            </div>
          </div>
        </div>
      </section>

      <section className="content-wrap section">
        <p className="section-divider">Story Grid</p>
        <Suspense fallback={<ShimmerGrid count={8} />}>
          <StoryGrid />
        </Suspense>
      </section>
    </main>
  );
}
