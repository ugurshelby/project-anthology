import { Link } from '@/i18n/routing';
import type { MachineryCar } from '@/data/machinery/cars';
import { MachineryCadWireframe } from '@/components/machinery/MachineryCadWireframe';

interface MachineryCrossLinkProps {
  cars: MachineryCar[];
  locale?: string;
  title?: string;
  kicker?: string;
}

export function MachineryCrossLink({
  cars,
  locale = 'tr',
  title,
  kicker,
}: MachineryCrossLinkProps) {
  if (!cars || cars.length === 0) return null;
  const isTr = locale === 'tr';

  return (
    <div className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface/40 p-5 md:p-6 backdrop-blur-md">
      {/* Editorial Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-hairline/60 pb-3">
        <div>
          <span className="label-caps block text-accent font-mono text-[11px] tracking-wider">
            {kicker ?? (isTr ? 'İkonik Araçlar Koleksiyonu' : 'Iconic Machinery Archive')}
          </span>
          <h3
            className="mt-1 font-condensed text-xl font-700 uppercase tracking-tight text-text-hi md:text-2xl"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {title ?? (isTr ? 'Mühendislik Başyapıtları' : 'Engineering Masterpieces')}
          </h3>
        </div>

        <Link
          href="/machinery"
          className="group inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-text-mid transition-colors hover:text-white"
        >
          <span>{isTr ? 'Tüm Koleksiyonu Gör' : 'View Full Collection'}</span>
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      {/* Grid of matched cars */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cars.map((car) => (
          <Link
            key={car.id}
            href={`/machinery/${car.id}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-hairline bg-[#080808]/90 p-4 transition-all duration-200 hover:border-white/25 hover:bg-[#0d0d0d]"
          >
            {/* Top accent line */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-75"
              style={{
                background: `linear-gradient(90deg, ${car.accentColor}, transparent)`,
              }}
            />

            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-accent">
                  {car.year}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-mid">
                  {isTr ? car.eraTr : car.era}
                </span>
              </div>

              <div className="mt-2">
                <span className="label-caps block text-[10px] text-text-mid">
                  {car.constructorName}
                </span>
                <h4
                  className="font-condensed text-lg font-700 uppercase tracking-tight text-text-hi transition-colors group-hover:text-accent md:text-xl"
                  style={{ fontFamily: 'var(--font-condensed)' }}
                >
                  {car.name}
                </h4>
              </div>

              {/* Miniature CAD wireframe */}
              <div className="my-2 h-20 w-full overflow-hidden">
                <MachineryCadWireframe car={car} interactive={false} />
              </div>

              <p className="line-clamp-2 text-xs leading-relaxed text-text-mid">
                {isTr ? car.keyInnovationTr : car.keyInnovationEn}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-hairline/60 pt-3 font-mono text-[11px]">
              <span className="text-text-mid">
                {car.achievements.wins} {isTr ? 'G' : 'W'} · {car.achievements.titles.join('/')}
              </span>
              <span className="flex items-center gap-1 font-semibold text-accent group-hover:underline">
                <span>{isTr ? 'İncele' : 'Inspect'}</span>
                <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
