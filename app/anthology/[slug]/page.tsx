import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoryBySlug, getStorySlugs, type Story } from '@/lib/data/stories';

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
  const story: Story | null = await getStoryBySlug(slug);
  if (!story) notFound();
  void story;

  return <main id="main-content">{story.title}</main>;
}
