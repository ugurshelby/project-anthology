import Image from 'next/image';
import { BentoCard } from '@/components/bento/BentoCard';

type Span = 4 | 5 | 6 | 7 | 8 | 12;

/**
 * Team machinery strip — car visual always visible on mobile/tablet/desktop.
 */
export function DriverMachineryCard({
  season,
  constructorName,
  teamLogo,
  carSrc,
  span = 12,
}: {
  season: number;
  constructorName: string;
  teamLogo: string | null;
  carSrc: string;
  span?: Span;
}) {
  return (
    <BentoCard span={span} as="div" className="relative flex min-h-64 flex-col overflow-hidden p-0 sm:min-h-72 lg:min-h-80">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 85% 60%, color-mix(in srgb, var(--team-secondary) 28%, transparent), transparent 65%)',
        }}
      />
      <div className="relative z-10 flex flex-col gap-3 p-5 sm:p-6">
        {teamLogo ? (
          <Image src={teamLogo} alt={constructorName} width={48} height={48} className="h-10 w-10 object-contain sm:h-12 sm:w-12" />
        ) : null}
        <span className="label-caps text-text-mid">{season} Machinery</span>
        <span className="font-condensed text-2xl font-700 uppercase text-text-hi sm:text-3xl" style={{ fontFamily: 'var(--font-condensed)' }}>
          {constructorName}
        </span>
      </div>
      <div className="relative z-10 mt-auto h-48 w-full sm:h-56 lg:h-64">
        <Image
          src={carSrc}
          alt={`${constructorName} ${season} car`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain object-center px-3 pb-3 sm:object-right-bottom sm:px-6 sm:pb-6"
        />
      </div>
    </BentoCard>
  );
}
