import type { Metadata } from 'next';
import Image from 'next/image';
import { glossaryTerms, type GlossaryTerm } from '@/data/glossary/terms';
import { TYRE_COMPOUNDS } from '@/data/glossary/tyres';
import { PageShell } from '@/components/layout/BentoGrid';
import { GlossaryAccordion } from '@/components/glossary/GlossaryAccordion';

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
  const byCategory = glossaryTerms.reduce<Record<string, GlossaryTerm[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});

  return (
    <PageShell>
      <header className="mb-10 flex flex-col gap-1">
        <span className="label-caps text-text-mid">Reference</span>
        <h1 className="headline-lg uppercase text-text-hi">Tech Glossary</h1>
      </header>

      {/* Tyre compounds */}
      <section className="mb-12 flex flex-col gap-4">
        <h2 className="headline-md uppercase text-text-hi">Tyre Compounds</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TYRE_COMPOUNDS.map((t) => (
            <div key={t.id} className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-hairline bg-surface p-4">
              <div className="flex items-center gap-2">
                <Image src={`/tyres/${t.id}.svg`} alt="" width={28} height={28} />
                <span className="font-condensed text-lg font-600 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                  {t.name}
                </span>
              </div>
              <span className="label-caps text-text-low">{t.kicker}</span>
              <p className="body-md text-text-mid">{t.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Terms by category */}
      {Object.entries(byCategory).map(([category, terms]) => (
        <section key={category} className="mb-10 flex flex-col gap-4">
          <h2 className="headline-md uppercase text-text-hi">{category}</h2>
          <GlossaryAccordion terms={terms} />
        </section>
      ))}
    </PageShell>
  );
}
