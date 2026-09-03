import type { Metadata } from 'next';
import { glossaryTerms } from '@/data/glossary/terms';
import { TYRE_COMPOUNDS } from '@/data/glossary/tyres';
import { PageShell } from '@/components/layout/BentoGrid';
import { GlossaryExplorer } from '@/components/glossary/GlossaryExplorer';

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
  return (
    <PageShell>
      <header className="mb-6 flex flex-col gap-1 md:mb-8">
        <span className="label-caps text-text-mid">Reference</span>
        <h1 className="headline-lg uppercase text-text-hi">Tech Glossary</h1>
        <p className="mt-1 max-w-xl body-md text-text-mid">
          Pit-wall vocabulary — compounds, aero, hybrid PU, and the sporting regs that shape a race weekend.
        </p>
      </header>

      <GlossaryExplorer terms={glossaryTerms} tyres={TYRE_COMPOUNDS} />
    </PageShell>
  );
}
