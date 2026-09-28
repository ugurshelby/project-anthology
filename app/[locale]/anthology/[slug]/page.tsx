import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import {
  getStoryBySlug,
  getPublishedStories,
  type Story,
} from '@/lib/data/stories';
import { localizedAlternates, articleJsonLd } from '@/lib/seo';
import { StoryReader } from '@/components/anthology/StoryReader';
import { StoryCard } from '@/components/anthology/StoryCard';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/** Vercel @vercel/next + Next 16 segment SSG packaging bug — force server render. */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) {
    return { title: 'Story not found' };
  }
  const isTr = locale === 'tr';
  const title = isTr && story.titleTr ? story.titleTr : story.title;
  const description = (isTr && story.subtitleTr) || story.subtitle || `An F1 anthology story: ${story.title}.`;
  const urlPath = isTr ? `/tr/anthology/${slug}` : `/anthology/${slug}`;

  return {
    title,
    description,
    alternates: localizedAlternates(`/anthology/${slug}`, locale),
    openGraph: {
      title: `${title} (${story.year})`,
      description,
      type: 'article',
      url: urlPath,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} (${story.year})`,
      description,
    },
  };
}

export default async function StoryPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [story, all]: [Story | null, Story[]] = await Promise.all([
    getStoryBySlug(slug),
    getPublishedStories(),
  ]);
  if (!story) notFound();

  const idx = all.findIndex((s) => s.slug === slug);
  const next = idx >= 0 ? all[(idx + 1) % all.length] : undefined;

  const isTr = locale === 'tr';
  const displayTitle = isTr && story.titleTr ? story.titleTr : story.title;
  const displayDesc = (isTr && story.subtitleTr) || story.subtitle || `An F1 anthology story: ${story.title}.`;

  const jsonLd = articleJsonLd({
    title: displayTitle,
    description: displayDesc,
    slug: story.slug,
    imageUrl: story.heroImage,
    year: String(story.year),
    category: story.category,
    locale,
  });

  return (
    <main id="main-content" className="pb-mobile-nav">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StoryReader story={story} initialLanguage={isTr ? 'tr' : 'en'} />

      {next && next.slug !== slug ? (
        <section className="mx-auto w-full max-w-3xl px-5 pb-28 pt-16 md:px-8 md:pt-20 md:pb-24">
          <span className="label-caps mb-3 block text-text-mid">
            {isTr ? 'Antolojideki Sıradaki Hikâye' : 'Next in the Anthology'}
          </span>
          <StoryCard story={next} wide />
        </section>
      ) : null}
    </main>
  );
}
