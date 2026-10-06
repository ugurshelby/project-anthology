import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getGlossaryTerms } from '@/data/glossary/terms';
import { getTyreCompounds } from '@/data/glossary/tyres';
import { PageShell } from '@/components/layout/BentoGrid';
import { GlossaryExplorer } from '@/components/glossary/GlossaryExplorer';
import { RegulationErasPanel } from '@/components/glossary/RegulationErasPanel';
import { TyreThermalWindows } from '@/components/glossary/TyreThermalWindows';
import { localizedAlternates } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ui.glossary' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localizedAlternates('/tech-glossary', locale),
    openGraph: {
      title: t('metaOg'),
      description: t('metaOgDescription'),
      url: '/tech-glossary',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('metaOg'),
      description: t('metaOgDescription'),
    },
  };
}

export default async function TechGlossaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ui.glossary' });
  const glossaryTerms = getGlossaryTerms(locale);
  const TYRE_COMPOUNDS = getTyreCompounds(locale);
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
              {t('eyebrow')}
            </span>
          </div>

          <h1
            className="font-condensed text-4xl font-700 uppercase tracking-tight text-white sm:text-5xl md:text-6xl"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {t('title')}
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-text-mid sm:text-lg">
            {t('intro')}
          </p>

          {/* Quick Telemetry Metric Bar */}
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-text-mid">
              <span className="font-bold text-white tabular-nums">{totalDefinitions}</span> {t('definitions')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-text-mid">
              <span className="font-bold text-white tabular-nums">{totalTyres}</span> {t('compounds')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-text-mid">
              <span className="font-bold text-white tabular-nums">6</span> {t('disciplines')}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-12 space-y-10">
        {/* 5.1 Regulation Eras Module */}
        <RegulationErasPanel />

        {/* 5.2 Tyre Physics & Thermal Operating Windows */}
        <TyreThermalWindows />
      </div>

      {/* Interactive Search & Term Catalog */}
      <GlossaryExplorer terms={glossaryTerms} tyres={TYRE_COMPOUNDS} />
    </PageShell>
  );
}
