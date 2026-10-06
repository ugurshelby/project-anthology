import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { TechnicalDossier } from '@/components/profile/TechnicalDossier';
import { getMachineryCar, getAllMachineryCars } from '@/data/machinery/cars';
import { MachineryCadWireframe } from '@/components/machinery/MachineryCadWireframe';
import { MediaAssetView } from '@/components/media/MediaAssetView';
import { getMedia } from '@/lib/media/read';
import { localizedAlternates, vehicleJsonLd } from '@/lib/seo';

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const cars = getAllMachineryCars();
  return cars.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const car = getMachineryCar(id);
  const isTr = locale === 'tr';

  if (!car) {
    return { title: isTr ? 'Araç Bulunamadı' : 'Vehicle Not Found' };
  }

  const title = `${car.fullName} (${car.year}) — Machinery`;
  const description = isTr
    ? `${car.fullName} teknik CAD analizi, ${car.engine.spec} motor verileri, aerodinamik inovasyonlar ve ${car.year} sezonu mühendislik dosyası.`
    : `${car.fullName} technical CAD dossier, ${car.engine.spec} powertrain data, aerodynamic breakthroughs and ${car.year} championship pedigree.`;

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
  const carMedia = await getMedia('car', `iconic:${car.id}`);

  const engineDossier = [
    { label: isTr ? 'GÜÇ ÜNİTESİ' : 'POWER UNIT', value: car.engine.spec },
    { label: isTr ? 'MİMARİ' : 'CONFIGURATION', value: car.engine.cylinders },
    { label: isTr ? 'HACİM' : 'DISPLACEMENT', value: car.engine.displacement },
    { label: isTr ? 'GÜÇ ÇIKIŞI' : 'MAX POWER', value: car.engine.power },
    { label: isTr ? 'MAKSİMUM DEVİR' : 'MAX RPM', value: car.engine.rpm },
    { label: isTr ? 'ASPİRASYON' : 'ASPIRATION', value: car.engine.aspiration },
  ];

  const chassisDossier = [
    { label: isTr ? 'MİNİMUM AĞIRLIK' : 'DRY WEIGHT', value: `${car.chassis.weightKg} kg` },
    { label: isTr ? 'ŞANZIMAN' : 'TRANSMISSION', value: car.chassis.transmission },
    { label: isTr ? 'MONOKOK' : 'MONOCOQUE', value: car.chassis.monocoque },
    { label: isTr ? 'FREN SİSTEMİ' : 'BRAKE SYSTEM', value: car.chassis.brakes },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back Navigation Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 font-mono text-xs text-text-mid">
        <Link href="/machinery" className="transition-colors hover:text-accent">
          ← {isTr ? 'TÜM ARAÇLAR' : 'MACHINERY'}
        </Link>
        <span>/</span>
        <span className="text-text-hi">{car.name}</span>
      </nav>

      {/* Header */}
      <header className="mb-8 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-text-mid">
            {isTr ? car.eraTr : car.era}
          </span>
          <span className="font-mono text-xs font-bold text-accent">
            SEASON {car.year}
          </span>
          <span className="text-xs text-text-low font-mono">
            {'//'} {isTr ? 'BAŞ TASARIMCI:' : 'CHIEF DESIGNER:'} {car.designer.join(', ')}
          </span>
        </div>

        <h1
          className="font-condensed text-4xl font-700 uppercase tracking-tight text-text-hi sm:text-5xl md:text-6xl"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {car.fullName}
        </h1>

        <p className="max-w-3xl text-base text-text-mid sm:text-lg">
          {isTr ? car.keyInnovationTr : car.keyInnovationEn}
        </p>
      </header>

      {/* CAD Blueprint & Authentic Archive Photo Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <MachineryCadWireframe car={car} interactive={true} />
        </div>
        <div className="flex flex-col justify-between rounded-[16px] border border-white/10 bg-[#090d14] p-4 lg:col-span-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="label-caps font-mono text-[10px] tracking-wider text-text-low">
              {isTr ? 'ARŞİV FOTOĞRAFI // CC BY' : 'ARCHIVE DOSSIER // CC BY'}
            </span>
            <span className="font-mono text-[10px] text-accent">
              {car.year} SPEC
            </span>
          </div>
          <div className="relative min-h-[220px] w-full flex-1 overflow-hidden rounded-lg">
            <MediaAssetView
              type="car"
              entityKey={`iconic:${car.id}`}
              initialResult={carMedia}
              alt={car.fullName}
              name={car.fullName}
              teamColor={car.accentColor}
              season={car.year}
              aspectRatio="16/9"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <BentoGrid>
        {/* Technical Breakthrough Narrative */}
        <BentoCard span={8} className="flex flex-col justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="label-caps font-mono text-xs tracking-widest text-accent">
                {isTr ? 'MÜHENDİSLİK ATILIMI' : 'ENGINEERING BREAKTHROUGH'}
              </span>
            </div>
            <h2
              className="font-condensed text-2xl font-700 uppercase tracking-tight text-text-hi sm:text-3xl"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {isTr ? 'Neden Sporu Değiştirdi?' : 'Why It Broke The Sport'}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-text-mid sm:text-base">
              {isTr ? car.technicalBreakthroughTr : car.technicalBreakthroughEn}
            </p>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <span className="label-caps mb-1 block text-[11px] text-text-hi">
                {isTr ? 'AERODİNAMİK PAKETİ' : 'AERODYNAMIC CONCEPT'}
              </span>
              <p className="text-xs leading-relaxed text-text-mid">
                {isTr ? car.aerodynamicsTr : car.aerodynamicsEn}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-hairline pt-4">
            <span className="label-caps mb-1 block text-[10px] text-text-low">
              {isTr ? 'MİRAS & TARİHİ ETKİ' : 'LEGACY & PEDIGREE'}
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
              {isTr ? 'ŞAMPİYONLUK KARNESİ' : 'PALMARES & DOMINANCE'}
            </span>
            <span className="font-mono text-xs font-bold text-accent">
              {car.year}
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <span className="text-text-mid">{isTr ? 'Yarış Sayısı' : 'Races Entered'}</span>
              <span className="font-bold text-text-hi">{car.achievements.races}</span>
            </div>
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <span className="text-text-mid">{isTr ? 'Galibiyet' : 'Victories'}</span>
              <span className="font-bold text-accent text-sm">{car.achievements.wins}</span>
            </div>
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <span className="text-text-mid">{isTr ? 'Pole Pozisyonu' : 'Pole Positions'}</span>
              <span className="font-bold text-text-hi">{car.achievements.poles}</span>
            </div>
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <span className="text-text-mid">{isTr ? 'Podyum Derecesi' : 'Podium Finishes'}</span>
              <span className="font-bold text-text-hi">{car.achievements.podiums}</span>
            </div>
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <span className="text-text-mid">{isTr ? 'Kazanma Oranı' : 'Win Percentage'}</span>
              <span className="font-bold text-emerald-400 text-sm">{car.achievements.winRate}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {car.achievements.titles.map((title) => (
              <span
                key={title}
                className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-400"
              >
                <span>🏆</span>
                <span>{title === 'WDC' ? (isTr ? 'PİLOTLAR ŞAMPİYONU' : 'WORLD DRIVERS TITLE') : (isTr ? 'MARKALAR ŞAMPİYONU' : 'CONSTRUCTORS TITLE')}</span>
              </span>
            ))}
          </div>

          {/* Quick Cross link to Season */}
          <Link
            href={`/season/${car.year}`}
            className="mt-6 block text-center rounded-lg border border-white/10 bg-white/[0.04] py-2 font-mono text-xs font-semibold text-text-hi transition-colors hover:border-white/20 hover:bg-white/[0.08]"
          >
            {isTr ? `${car.year} SEZONU ARŞİVİNE GİT →` : `VIEW ${car.year} SEASON ARCHIVE →`}
          </Link>
        </BentoCard>

        {/* Engine & Powertrain Dossier */}
        <BentoCard span={6}>
          <span className="label-caps mb-3 block text-text-mid">
            {isTr ? 'MOTOR & GÜÇ ÜNİTESİ' : 'ENGINE ARCHITECTURE'}
          </span>
          <TechnicalDossier entries={engineDossier} />
        </BentoCard>

        {/* Chassis & Composite Dossier */}
        <BentoCard span={6}>
          <span className="label-caps mb-3 block text-text-mid">
            {isTr ? 'ŞASİ & MEKANİK DİNAMİK' : 'CHASSIS SPECIFICATION'}
          </span>
          <TechnicalDossier entries={chassisDossier} />
        </BentoCard>

        {/* Drivers / Pilots Panel */}
        <BentoCard span={6}>
          <span className="label-caps mb-3 block text-text-mid">
            {isTr ? 'KOKPİTTEKİ PİLOTLAR' : 'THE PILOTS'}
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
                  <span
                    className="font-condensed text-xl font-700 uppercase text-text-hi"
                    style={{ fontFamily: 'var(--font-condensed)' }}
                  >
                    {driver.name}
                  </span>
                </div>
                {driver.isChampion ? (
                  <span className="rounded bg-accent/20 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
                    {isTr ? 'DÜNYA ŞAMPİYONU' : 'CHAMPION'}
                  </span>
                ) : (
                  <span className="font-mono text-xs text-text-low">
                    {isTr ? 'PİLOT' : 'DRIVER'}
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
              {isTr ? 'İLİŞKİLİ TEKNİK KAVRAMLAR' : 'CONNECTED TECH GLOSSARY'}
            </span>
            <Link href="/tech-glossary" className="font-mono text-xs text-accent hover:underline">
              {isTr ? 'Sözlüğe Git →' : 'Full Glossary →'}
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
