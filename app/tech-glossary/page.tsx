import type { Metadata } from 'next';
import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { glossaryTerms, type GlossaryTerm } from '@/data/glossary/terms';

export const metadata: Metadata = {
  title: 'Tech Glossary',
  description:
    'A reference glossary of Formula 1 technical terms: aerodynamics, power units, tyres, chassis, strategy and regulations.',
  openGraph: {
    title: 'Tech Glossary — F1 Terms',
    description: 'Reference definitions for Formula 1 technical vocabulary.',
    type: 'website',
  },
};

// Group terms by category, preserving alphabetical order within each group.
function groupByCategory(terms: GlossaryTerm[]): Array<[string, GlossaryTerm[]]> {
  const map = new Map<string, GlossaryTerm[]>();
  for (const t of terms) {
    const list = map.get(t.category) ?? [];
    list.push(t);
    map.set(t.category, list);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export default function TechGlossaryPage() {
  const groups = groupByCategory(glossaryTerms);

  return (
    <>
      <AtmosphericHero>
        <p
          className="font-condensed text-[11px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--muted)' }}
        >
          Reference
        </p>
        <h1
          className="mt-2 font-display text-[clamp(5rem,16vw,12rem)] leading-[0.88] tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          TECH GLOSSARY
        </h1>
        <p
          className="mt-3 max-w-xl mx-auto text-sm font-light leading-relaxed"
          style={{ color: 'var(--muted)' }}
        >
          The vocabulary of Formula 1 engineering — the terms our stories link to.
        </p>
      </AtmosphericHero>

      <div className="content-wrap">
        {groups.map(([category, terms]) => (
          <section key={category} className="mb-12">
            <SectionDivider title={category} />
            <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {terms.map((t) => (
                <div
                  key={t.slug}
                  id={t.slug}
                  className="anthology-card scroll-mt-20 p-5"
                >
                  <dt
                    className="font-display text-[1.4rem] leading-none tracking-[0.04em]"
                    style={{ color: 'var(--paper)' }}
                  >
                    {t.term}
                  </dt>
                  {t.aliases?.length ? (
                    <p
                      className="mt-1 font-mono text-[9px] uppercase tracking-wider"
                      style={{ color: 'rgba(255,24,1,0.7)' }}
                    >
                      {t.aliases.join(' · ')}
                    </p>
                  ) : null}
                  <dd
                    className="mt-2 text-[13px] font-light leading-relaxed"
                    style={{ color: 'var(--muted)' }}
                  >
                    {t.definition}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </>
  );
}
