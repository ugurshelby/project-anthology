import type { Metadata } from 'next';
import { glossaryTerms } from '@/data/glossary/terms';
import { TYRE_COMPOUNDS } from '@/data/glossary/tyres';

export const metadata: Metadata = {
  title: 'Tech Glossary',
  description:
    'A reference glossary of Formula 1 technical terms: aerodynamics, power units, tyres, chassis, strategy and regulations.',
  alternates: { canonical: '/tech-glossary' },
  openGraph: {
    title: 'Tech Glossary — F1 Terms',
    description: 'Reference definitions for Formula 1 technical vocabulary.',
    url: '/tech-glossary',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tech Glossary — F1 Terms',
    description: 'Reference definitions for Formula 1 technical vocabulary.',
  },
};

export default function TechGlossaryPage() {
  void { glossaryTerms, TYRE_COMPOUNDS };

  return <main id="main-content">Tech Glossary</main>;
}
