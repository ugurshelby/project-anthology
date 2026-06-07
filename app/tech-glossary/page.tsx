import type { Metadata } from 'next';
import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { GlossaryCard } from '@/components/ui/GlossaryCard';
import { glossaryTerms, type GlossaryTerm } from '@/data/glossary/terms';
import { TYRE_COMPOUNDS } from '@/data/glossary/tyres';

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
        {/* ── Tyre compounds ──────────────────────────────────────────── */}
        <section className="mb-12">
          <SectionDivider title="Tyre Compounds" />
          <p
            className="mb-8 max-w-2xl text-[15px] font-light leading-relaxed"
            style={{ color: 'var(--paper)' }}
          >
            Pirelli brings a range of five dry slicks, named C1 (hardest) to C5
            (softest), plus two treaded wet tyres. For each Grand Prix only three of
            the slicks are nominated — the hard, medium and soft of that weekend.
            Softer compounds offer more grip but wear faster; the whole race is a
            trade-off between pace and tyre life.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TYRE_COMPOUNDS.map((tyre) => (
              <div key={tyre.id} className="anthology-card flex gap-4 p-5">
                <SafeImage
                  src={`/tyres/${tyre.id}.svg`}
                  alt={tyre.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <p
                    className="font-mono text-[9px] uppercase tracking-[0.15em]"
                    style={{ color: 'rgba(255,24,1,0.7)' }}
                  >
                    {tyre.kicker}
                  </p>
                  <h3
                    className="mt-1 flex items-center gap-2 font-display text-[1.3rem] leading-none tracking-[0.03em]"
                    style={{ color: 'var(--paper)' }}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: tyre.color }}
                      aria-hidden
                    />
                    {tyre.name}
                  </h3>
                  <p
                    className="mt-2 text-[13px] font-light leading-relaxed"
                    style={{ color: 'var(--muted)' }}
                  >
                    {tyre.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {groups.map(([category, terms]) => (
          <section key={category} className="mb-12">
            <SectionDivider title={category} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {terms.map((t) => (
                <GlossaryCard key={t.slug} term={t} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
