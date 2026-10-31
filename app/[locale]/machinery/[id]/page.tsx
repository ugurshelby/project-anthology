import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { TechnicalDossier } from '@/components/profile/TechnicalDossier';
import { getMachineryCar } from '@/data/machinery/cars';
import { MachineryVisual } from '@/components/machinery/MachineryVisual';
import { getMedia } from '@/lib/media/read';
import { localizedAlternates, vehicleJsonLd } from '@/lib/seo';
import { serializeJsonLd } from '@/components/seo/JsonLd';
import { formatPercent } from '@/lib/i18n/format';

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

/** Cached per URL, rebuilt at most every hour (caching design, DECISIONS 2026-10-28). */
export const revalidate = 3600;

/** No build-time prerender: each URL is rendered on its first request, then served from the cache. */
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const car = getMachineryCar(id);
  const t = await getTranslations({ locale, namespace: 'ui.machinery.detail' });

  if (!car) {
    return { title: t('vehicleNotFound') };
  }

  const title = `${car.fullName} (${car.year}) — Machinery`;
  const description = t('metaDescription', { name: car.fullName, engine: car.engine.spec, year: car.year });

  return {
    title,
    description,
    alternates: localizedAlternates(`/machinery/${id}`, locale),
    openGraph: {
      title,
      description,
      url: `/machinery/${id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function MachineryDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const car = getMachineryCar(id);
  if (!car) notFound();

  const isTr = locale === 'tr';
  const t = await getTranslations({ locale, namespace: 'ui.machinery.detail' });
  const carMedia = await getMedia('car', `iconic:${car.id}`);

  const engineDossier = [
    { label: t('powerUnit'), value: car.engine.spec },
    { label: t('configuration'), value: car.engine.cylinders },
    { label: t('displacement'), value: car.engine.displacement },
    { label: t('maxPower'), value: car.engine.power },
    { label: t('maxRpm'), value: car.engine.rpm },
    { label: t('aspiration'), value: car.engine.aspiration },
  ];

  const chassisDossier = [
    { label: t('dryWeight'), value: `${car.chassis.weightKg} kg` },
    { label: t('transmission'), value: car.chassis.transmission },
    { label: t('monocoque'), value: car.chassis.monocoque },
    { label: t('brakeSystem'), value: car.chassis.brakes },
  ];

  const jsonLd = vehicleJsonLd({
    name: car.fullName,
    brand: car.constructorName,
    modelDate: car.year,
    description: isTr ? car.keyInnovationTr : car.keyInnovationEn,
    url: `/machinery/${id}`,
  });

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      {/* Back Navigation Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 font-mono text-xs text-text-mid">
        <Link href="/machinery" className="transition-colors hover:text-accent">
          ← {t('machinery')}
        </Link>
        <span>/</span>
        <span className="text-text-hi">{car.name}</span>
      </nav>

      {/* Header */}
      <header className="mb-8 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-text-mid">
            {isTr ? car.eraTr : car.era}
          </span>
          <span className="font-mono text-xs font-bold text-accent">
            {t('seasonBadge', { year: car.year })}
          </span>
          <span className="text-xs text-text-low font-mono">
            {'//'} {t('chiefDesigner')} {car.designer.join(', ')}
          </span>
        </div>

        <h1 lang="en"
          className="font-condensed text-4xl font-700 uppercase tracking-tight text-text-hi sm:text-5xl md:text-6xl"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {car.fullName}
        </h1>

        <p className="max-w-3xl text-base text-text-mid sm:text-lg">
          {isTr ? car.keyInnovationTr : car.keyInnovationEn}
        </p>
      </header>

      {/* One visual: the licensed archive photo, or the livery silhouette when there is none */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <figure className="overflow-hidden rounded-[16px] border border-hairline bg-surface lg:col-span-8">
          <MachineryVisual
            car={car}
            media={carMedia}
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="h-full"
          />
        </figure>

        <aside
          aria-label={t('keyFigures')}
          className="flex flex-col justify-between gap-6 rounded-[16px] border border-hairline bg-surface p-5 sm:p-6 lg:col-span-4"
        >
          <div>
            <span className="label-caps block text-text-low">{car.constructorName}</span>
            <span lang="en"
              className="mt-1 block font-condensed text-3xl font-700 uppercase tracking-tight text-text-hi"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {car.name}
            </span>
          </div>
          <dl className="divide-y divide-hairline font-mono text-xs">
            {[
              { label: t('season'), value: String(car.year) },
              { label: t('powerUnit'), value: car.engine.spec },
              { label: t('weight'), value: `${car.chassis.weightKg} kg` },
              { label: t('wins'), value: `${car.achievements.wins} / ${car.achievements.races}` },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-text-low">{row.label}</dt>
                <dd className="truncate text-right font-semibold text-text-hi">{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex items-baseline justify-between border-t border-hairline pt-4">
            <span className="label-caps text-text-low">{t('winRate')}</span>
            <span className="hero-number text-4xl text-text-hi tabular-nums">{formatPercent(parseFloat(car.achievements.winRate), locale, 2)}</span>
          </div>
        </aside>
      </div>

      <BentoGrid>
        {/* Technical Breakthrough Narrative */}
        <BentoCard span={8} className="flex flex-col justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="label-caps font-mono text-xs tracking-widest text-accent">
                {t('engineeringBreakthrough')}
              </span>
            </div>
            <h2
              className="font-condensed text-2xl font-700 uppercase tracking-tight text-text-hi sm:text-3xl"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {t('whyItBrokeTheSport')}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-text-mid sm:text-base">
              {isTr ? car.technicalBreakthroughTr : car.technicalBreakthroughEn}
            </p>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <span className="label-caps mb-1 block text-[11px] text-text-hi">
                {t('aerodynamicConcept')}
              </span>
              <p className="text-xs leading-relaxed text-text-mid">
                {isTr ? car.aerodynamicsTr : car.aerodynamicsEn}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-hairline pt-4">
            <span className="label-caps mb-1 block text-[11px] text-text-low">
              {t('legacyPedigree')}
            </span>
            <p className="text-xs text-text-hi italic">
              &ldquo;{isTr ? car.legacyTr : car.legacyEn}&rdquo;
            </p>
          </div>
        </BentoCard>

        {/* Season Dominance Trophy Panel */}
        <BentoCard span={4}>
          <div className="mb-3 flex items-center justify-between">
            <span className="label-caps text-text-mid">
              {t('palmaresDominance')}
            </span>
            <span className="font-mono text-xs font-bold text-accent">
              {car.year}
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <span className="text-text-mid">{t('racesEntered')}</span>
              <span className="font-bold text-text-hi">{car.achievements.races}</span>
            </div>
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <span className="text-text-mid">{t('victories')}</span>
              <span className="font-bold text-accent text-sm">{car.achievements.wins}</span>
            </div>
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <span className="text-text-mid">{t('polePositions')}</span>
              <span className="font-bold text-text-hi">{car.achievements.poles}</span>
            </div>
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <span className="text-text-mid">{t('podiumFinishes')}</span>
              <span className="font-bold text-text-hi">{car.achievements.podiums}</span>
            </div>
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <span className="text-text-mid">{t('winPercentage')}</span>
              <span className="font-bold text-emerald-400 text-sm">{formatPercent(parseFloat(car.achievements.winRate), locale, 2)}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {car.achievements.titles.map((title) => (
              <span
                key={title}
                className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-400"
              >
                <span>🏆</span>
                <span>{title === 'WDC' ? (t('worldDriversTitle')) : (t('constructorsTitle'))}</span>
              </span>
            ))}
          </div>

          {/* Quick Cross link to Season */}
          <Link
            href={`/season/${car.year}`}
            className="mt-6 block text-center rounded-lg border border-white/10 bg-white/[0.04] py-2 font-mono text-xs font-semibold text-text-hi transition-colors hover:border-white/20 hover:bg-white/[0.08]"
          >
            {t('seasonArchive', { year: car.year })}
          </Link>
        </BentoCard>

        {/* Engine & Powertrain Dossier */}
        <BentoCard span={6}>
          <span className="label-caps mb-3 block text-text-mid">
            {t('engineArchitecture')}
          </span>
          <TechnicalDossier entries={engineDossier} />
        </BentoCard>

        {/* Chassis & Composite Dossier */}
        <BentoCard span={6}>
          <span className="label-caps mb-3 block text-text-mid">
            {t('chassisSpecification')}
          </span>
          <TechnicalDossier entries={chassisDossier} />
        </BentoCard>

        {/* Drivers / Pilots Panel */}
        <BentoCard span={6}>
          <span className="label-caps mb-3 block text-text-mid">
            {t('thePilots')}
          </span>
          <div className="divide-y divide-hairline">
            {car.drivers.map((driver) => (
              <div key={driver.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {driver.number ? (
                    <span className="font-mono text-sm font-bold text-accent">
                      #{driver.number}
                    </span>
                  ) : null}
                  <span lang="en"
                    className="font-condensed text-xl font-700 uppercase text-text-hi"
                    style={{ fontFamily: 'var(--font-condensed)' }}
                  >
                    {driver.name}
                  </span>
                </div>
                {driver.isChampion ? (
                  <span className="rounded bg-accent/20 px-2 py-0.5 font-mono text-[11px] font-bold text-accent-text">
                    {t('champion')}
                  </span>
                ) : (
                  <span className="font-mono text-xs text-text-low">
                    {t('driver')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Technical Glossary Deep Cross-links */}
        <BentoCard span={6}>
          <div className="mb-3 flex items-center justify-between">
            <span className="label-caps text-text-mid">
              {t('connectedTechGlossary')}
            </span>
            <Link href="/tech-glossary" className="font-mono text-xs text-accent hover:underline">
              {t('fullGlossary')}
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {car.relatedGlossaryTerms.map((term) => (
              <Link
                key={term}
                href={`/tech-glossary?q=${encodeURIComponent(term)}`}
                className="group flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-text-hi transition-all hover:border-accent/40 hover:bg-accent/[0.05]"
              >
                <span className="text-accent group-hover:translate-x-0.5 transition-transform">#</span>
                <span>{term}</span>
              </Link>
            ))}
          </div>
        </BentoCard>
      </BentoGrid>
    </PageShell>
  );
}
