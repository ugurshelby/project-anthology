import type { Metadata } from 'next';
import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { getPublishedRadioMoments } from '@/lib/data/radio';
import { getPublishedStories } from '@/lib/data/stories';
import { RadioMomentCard } from './_components/RadioMomentCard';
import { StoryCard } from './_components/StoryCard';

export const metadata: Metadata = {
  title: 'Anthology',
  description:
    'An anthology of Formula 1 stories and iconic team radio moments — legends, rivalries, tragedies and miracles.',
  openGraph: {
    title: 'Anthology — F1 Stories & Radio',
    description:
      'Legends, rivalries, tragedies, miracles, and team radio from Formula 1 history.',
    type: 'website',
  },
};

export default async function AnthologyPage() {
  const [stories, moments] = await Promise.all([
    getPublishedStories(),
    getPublishedRadioMoments(40),
  ]);

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
          className="mt-2 font-display text-[clamp(5rem,16vw,12rem)] leading-[0.88] tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          ANTHOLOGY
        </h1>
        <p
          className="mt-3 max-w-xl mx-auto text-sm font-light leading-relaxed"
          style={{ color: 'var(--muted)' }}
        >
          {stories.length} stories from the history of Formula 1 — the divine laps,
          the black weekends, the impossible comebacks.
        </p>
      </AtmosphericHero>

      <div className="content-wrap space-y-section-gap">
        <section>
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
        </section>

        <section>
          <SectionDivider title="Radio Moments" />
          {moments.length === 0 ? (
            <p className="text-sm text-muted" style={{ color: 'var(--muted)' }}>
              No published radio moments yet. Run sync-radio cron after seeding.
            </p>
          ) : (
            <ul className="space-y-3">
              {moments.map((m) => (
                <RadioMomentCard key={m.id} moment={m} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
