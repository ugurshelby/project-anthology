import type { Metadata } from 'next';
import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { getPublishedStories } from '@/lib/data/stories';
import { StoryCard } from './_components/StoryCard';

export const metadata: Metadata = {
  title: 'Anthology',
  description:
    'An anthology of Formula 1 stories: legends, rivalries, tragedies and miracles, told as long-form narrative.',
  openGraph: {
    title: 'Anthology — F1 Stories',
    description:
      'Legends, rivalries, tragedies and miracles from Formula 1 history.',
    type: 'website',
  },
};

export default async function AnthologyPage() {
  const stories = await getPublishedStories();

  return (
    <>
      <AtmosphericHero>
        <p
          className="font-condensed text-[11px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--muted)' }}
        >
          Long-form
        </p>
        <h1
          className="mt-2 font-display text-[clamp(4rem,14vw,10rem)] leading-[0.88] tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          ANTHOLOGY
        </h1>
        <p
          className="mt-3 max-w-xl text-sm font-light leading-relaxed"
          style={{ color: 'var(--muted)' }}
        >
          {stories.length} stories from the history of Formula 1 — the divine laps,
          the black weekends, the impossible comebacks.
        </p>
      </AtmosphericHero>

      <div className="content-wrap">
        <SectionDivider title="Stories" />
        {stories.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            No published stories yet. Run <code>npm run seed:stories</code>.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
