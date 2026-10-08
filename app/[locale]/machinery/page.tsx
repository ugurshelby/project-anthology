import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/layout/BentoGrid';
import { getAllMachineryCars } from '@/data/machinery/cars';
import { MachineryCard } from '@/components/machinery/MachineryCard';
import { getMediaBatch } from '@/lib/media/read';
import { localizedAlternates } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isTr = locale === 'tr';

  const title = isTr ? 'İkonik Araçlar ve Şasiler' : 'Machinery — Iconic F1 Cars';
  const description = isTr
    ? 'Formula 1 tarihine yön veren ikonik şasiler, motor şaheserleri ve aerodinamik atılımlar: MP4/4, FW14B, F2004, BGP 001, Lotus 72 ve RB19 teknik dosyaları.'
    : 'The definitive catalog of Formula 1 engineering masterpieces: MP4/4, FW14B, F2004, BGP 001, Lotus 72, and RB19 technical dossiers.';

  return {
    title,
    description,
    alternates: localizedAlternates('/machinery', locale),
    openGraph: {
      title,
      description,
      url: '/machinery',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function MachineryPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isTr = locale === 'tr';
  const cars = getAllMachineryCars();
  const media = await getMediaBatch('car', cars.map((c) => `iconic:${c.id}`));

  return (
    <PageShell>
      {/* Editorial Header */}
      <header className="mb-10 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="label-caps font-mono text-xs tracking-widest text-accent">
            {isTr ? 'MÜHENDİSLİK ARŞİVİ · 1950–GÜNÜMÜZ' : 'ENGINEERING ARCHIVE · 1950–PRESENT'}
          </span>
        </div>
        <h1
          className="font-condensed text-4xl font-700 uppercase tracking-tight text-text-hi sm:text-5xl md:text-6xl"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {isTr ? 'İkonik Şasiler ve Araçlar' : 'Machinery & Iconic Cars'}
        </h1>
        <p className="max-w-3xl text-base text-text-mid sm:text-lg">
          {isTr
            ? 'Formula 1 yalnızca pilotların değil, havacılık ve malzeme mühendisliğinin sınırlarını zorlayan makinelerin savaşıdır. Aktif süspansiyon, çift difüzör, zemin etkisi ve çığlık atan V10’lar: Sporu sonsuza dek değiştiren dönüm noktaları.'
            : 'Formula 1 is not merely a drivers championship — it is an arena where mechanical and aerospace genius transforms physics into speed. Active suspension, double diffusers, ground-effect venturis, and howling V10s: The machines that changed motorsport forever.'}
        </p>
      </header>

      {/* Grid Showcase */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <MachineryCard key={car.id} car={car} media={media.get(`iconic:${car.id}`)} />
        ))}
      </section>

      {/* Engineering Philosophy Banner */}
      <footer className="mt-14 overflow-hidden rounded-[16px] border border-white/10 bg-[#0d1117] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <span className="label-caps font-mono text-[10px] text-text-low">
              {isTr ? 'GÖRSEL STANDARDI' : 'IMAGE STANDARD'}
            </span>
            <h3
              className="mt-1 font-condensed text-2xl font-700 uppercase tracking-tight text-text-hi sm:text-3xl"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {isTr ? 'Lisanslı Fotoğraf, Yoksa Livery Silüeti' : 'Licensed Photo, Otherwise a Livery Silhouette'}
            </h3>
            <p className="mt-2 text-sm text-text-mid">
              {isTr
                ? 'Her araç, kaynağı, yazarı ve lisansı kayıtlı bir arşiv fotoğrafıyla gösterilir. Lisanslı fotoğrafı olmayan araçlar, takımın o yılki iki renkli livery’siyle çizilmiş sade bir yan profil silüetiyle temsil edilir. Resmi logo kullanılmaz.'
                : 'Each car is shown with an archive photo whose source, author and license are on record. A car without a licensed photo is drawn as a minimal side profile in its two livery colours of that year. No official marks are used.'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 font-mono text-xs text-text-low">
            <span className="rounded border border-white/10 bg-white/[0.03] px-3 py-1.5">
              {cars.length} {isTr ? 'İKONİK ARAÇ' : 'ICONIC CARS'}
            </span>
          </div>
        </div>
      </footer>
    </PageShell>
  );
}
