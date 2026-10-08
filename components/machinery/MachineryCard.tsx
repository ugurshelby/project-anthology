'use client';

import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import type { MachineryCar } from '@/data/machinery/cars';
import type { MediaResult } from '@/lib/media/read';
import { MachineryVisual } from './MachineryVisual';

interface MachineryCardProps {
  car: MachineryCar;
  /** Server lookup for `iconic:<id>`: the photo when one exists, else the livery silhouette. */
  media?: MediaResult | null;
}

export function MachineryCard({ car, media }: MachineryCardProps) {
  const locale = useLocale();
  const isTr = locale === 'tr';

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-[16px] border border-hairline bg-surface p-5 transition-all duration-300 hover:border-white/25 hover:shadow-2xl">
      {/* Top Accent Stripe */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, ${car.accentColor}, transparent)`,
        }}
      />

      {/* Header meta */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-text-mid">
            {isTr ? car.eraTr : car.era}
          </span>
          <span className="font-mono text-xs font-bold text-accent">
            {car.year}
          </span>
        </div>

        {/* Title and Constructor */}
        <div className="mb-4">
          <span className="label-caps block text-[11px] text-text-mid">
            {car.constructorName}
          </span>
          <h2
            className="font-condensed text-2xl font-700 uppercase tracking-tight text-text-hi transition-colors group-hover:text-accent sm:text-3xl"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {car.fullName}
          </h2>
        </div>

        {/* Archive photo, or the livery silhouette when there is none */}
        <div className="my-3 overflow-hidden rounded-[10px] border border-hairline">
          <MachineryVisual
            car={car}
            media={media}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {/* Innovation Tagline */}
        <p className="mt-3 text-sm leading-relaxed text-text-mid">
          {isTr ? car.keyInnovationTr : car.keyInnovationEn}
        </p>
      </div>

      {/* Footer Stats & CTA */}
      <div className="mt-5 border-t border-hairline pt-4">
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
          <div className="rounded-lg bg-white/[0.02] p-2 border border-white/5">
            <span className="block text-[10px] text-text-low">{isTr ? 'YARIŞ' : 'RACES'}</span>
            <span className="font-bold text-text-hi">{car.achievements.races}</span>
          </div>
          <div className="rounded-lg bg-white/[0.02] p-2 border border-white/5">
            <span className="block text-[10px] text-text-low">{isTr ? 'GALİBİYET' : 'WINS'}</span>
            <span className="font-bold text-accent">{car.achievements.wins}</span>
          </div>
          <div className="rounded-lg bg-white/[0.02] p-2 border border-white/5">
            <span className="block text-[10px] text-text-low">{isTr ? 'ORAN' : 'WIN %'}</span>
            <span className="font-bold text-emerald-400">{car.achievements.winRate}</span>
          </div>
        </div>

        <Link
          href={`/machinery/${car.id}`}
          className="mt-4 flex items-center justify-between rounded-lg bg-white/[0.04] px-4 py-2.5 font-mono text-xs font-semibold text-text-hi transition-all hover:bg-accent hover:text-white"
        >
          <span>{isTr ? 'TEKNİK DOSYAYI İNCELE' : 'INSPECT DOSSIER'}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
