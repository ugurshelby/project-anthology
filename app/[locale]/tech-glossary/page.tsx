import type { Metadata } from 'next';
import { glossaryTerms } from '@/data/glossary/terms';
import { TYRE_COMPOUNDS } from '@/data/glossary/tyres';
import { PageShell } from '@/components/layout/BentoGrid';
import { GlossaryExplorer } from '@/components/glossary/GlossaryExplorer';
import { localizedAlternates } from '@/lib/seo';

const DESCRIPTION =
  'A reference glossary of Formula 1 technical terms: aerodynamics, power units, tyres, chassis, strategy and regulations.';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Tech Glossary',
    description: DESCRIPTION,
    alternates: localizedAlternates('/tech-glossary', locale),
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
}

export default function TechGlossaryPage() {
  const totalDefinitions = glossaryTerms.length;
  const totalTyres = TYRE_COMPOUNDS.length;

  return (
    <PageShell>
      <div className="relative mb-8 flex flex-col gap-4 md:mb-10">
        {/* Subtle Ambient Glow */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-0 h-80 w-full max-w-2xl rounded-full bg-accent/[0.04] blur-3xl"
        />

        <div className="relative z-10 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Reference · Technical Dossier
            </span>
          </div>

          <h1
            className="font-condensed text-4xl font-700 uppercase tracking-tight text-white sm:text-5xl md:text-6xl"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            Tech Glossary
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-text-mid sm:text-lg">
            Pit-wall vocabulary — ground effect aerodynamics, hybrid power units, Pirelli compounds, and the sporting regulations that shape a Grand Prix weekend.
          </p>

          {/* Quick Telemetry Metric Bar */}
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-text-mid">
              <span className="font-bold text-white tabular-nums">{totalDefinitions}</span> Definitions
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-text-mid">
              <span className="font-bold text-white tabular-nums">{totalTyres}</span> Pirelli Compounds
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-text-mid">
              <span className="font-bold text-white tabular-nums">6</span> Disciplines
            </span>
          </div>
        </div>
      </div>

      <GlossaryExplorer terms={glossaryTerms} tyres={TYRE_COMPOUNDS} />
    </PageShell>
  );
}
