import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getStoryBySlug,
  getStorySlugs,
  getPublishedStories,
  type Story,
} from '@/lib/data/stories';
import { AnthologyHero } from '@/components/anthology/AnthologyHero';
import { StoryBody } from '@/components/anthology/StoryBody';
import { StoryCard } from '@/components/anthology/StoryCard';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getStorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) {
    return { title: 'Story not found' };
  }
  const description = story.subtitle || `An F1 anthology story: ${story.title}.`;
  return {
    title: story.title,
    description,
    alternates: { canonical: `/anthology/${slug}` },
    openGraph: {
      title: `${story.title} (${story.year})`,
      description,
      type: 'article',
      url: `/anthology/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${story.title} (${story.year})`,
      description,
    },
  };
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;
  const [story, all]: [Story | null, Story[]] = await Promise.all([
    getStoryBySlug(slug),
    getPublishedStories(),
  ]);
  if (!story) notFound();

  const idx = all.findIndex((s) => s.slug === slug);
  const next = idx >= 0 ? all[(idx + 1) % all.length] : undefined;

  return (
    <main id="main-content">
      <AnthologyHero
        kicker={`The Anthology · ${story.category}${story.year ? ` · ${story.year}` : ''}`}
        title={story.title}
        standfirst={story.subtitle}
        byline={story.year ? `F1 Anthology · ${story.year}` : 'F1 Anthology'}
        image={story.heroImage}
      />

      <StoryBody blocks={story.blocks} />

      {next && next.slug !== slug ? (
        <section className="mx-auto w-full max-w-3xl px-5 pb-20 md:px-8">
          <span className="label-caps mb-3 block text-text-mid">Next in the Anthology</span>
          <StoryCard story={next} wide />
        </section>
      ) : null}
    </main>
  );
}
