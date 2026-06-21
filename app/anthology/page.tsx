import type { Metadata } from 'next';
import { getPublishedRadioMoments } from '@/lib/data/radio';
import { getPublishedStories } from '@/lib/data/stories';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { StoryCard } from '@/components/anthology/StoryCard';
import { RadioMomentCard } from '@/components/anthology/RadioMomentCard';

export const revalidate = 900;

export const metadata: Metadata = {
  title: 'Anthology',
  description:
    'An anthology of Formula 1 stories and iconic team radio moments — legends, rivalries, tragedies and miracles.',
  alternates: { canonical: '/anthology' },
  openGraph: {
    title: 'Anthology — F1 Stories & Radio',
    description:
      'Legends, rivalries, tragedies, miracles, and team radio from Formula 1 history.',
    url: '/anthology',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anthology — F1 Stories & Radio',
    description:
      'Legends, rivalries, tragedies, miracles, and team radio from Formula 1 history.',
  },
};

export default async function AnthologyPage() {
  const [stories, moments] = await Promise.all([
    getPublishedStories(),
    getPublishedRadioMoments(40),
  ]);

  const [lead, ...rest] = stories;

  return (
    <PageShell>
      <header className="mb-8 flex flex-col gap-1">
        <span className="label-caps text-text-mid">The Anthology</span>
        <h1 className="headline-lg uppercase text-text-hi">Stories & Radio</h1>
      </header>

      <BentoGrid>
        {lead ? (
          <div className="col-span-4 md:col-span-8 lg:col-span-8">
            <StoryCard story={lead} wide />
          </div>
        ) : null}
        {rest.slice(0, 1).map((s) => (
          <div key={s.slug} className="col-span-4 md:col-span-8 lg:col-span-4">
            <StoryCard story={s} />
          </div>
        ))}
        {rest.slice(1).map((s) => (
          <div key={s.slug} className="col-span-4 md:col-span-4 lg:col-span-4">
            <StoryCard story={s} />
          </div>
        ))}
      </BentoGrid>

      {moments.length > 0 ? (
        <section className="mt-12 flex flex-col gap-4">
          <h2 className="headline-md uppercase text-text-hi">Team Radio</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {moments.map((m) => (
              <RadioMomentCard key={m.id} moment={m} />
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
