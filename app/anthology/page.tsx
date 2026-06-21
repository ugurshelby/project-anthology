import type { Metadata } from 'next';
import { getPublishedRadioMoments } from '@/lib/data/radio';
import { getPublishedStories } from '@/lib/data/stories';

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
  void { stories, moments };

  return <main id="main-content">Anthology</main>;
}
