import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { CIRCUIT_SVG_FILES, circuitLabelFromFile } from '@/lib/circuits-public';

export default function CircuitsPage() {
  return (
    <>
      <AtmosphericHero>
        <p
          className="font-[family-name:var(--font-condensed)] text-[11px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--muted)' }}
        >
          Track Maps
        </p>
        <h1
          className="mt-2 font-[family-name:var(--font-display)] text-[2.5rem] leading-[0.88] tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          CIRCUITS
        </h1>
        <p className="mt-2 text-sm text-muted" style={{ color: 'var(--muted)' }}>
          {CIRCUIT_SVG_FILES.length} circuit layouts — hydrate from Supabase in later phases.
        </p>
      </AtmosphericHero>

      <div className="content-wrap">
        <SectionDivider title="All Circuits" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CIRCUIT_SVG_FILES.map((file) => (
            <article
              key={file}
              className="anthology-card flex flex-col items-center gap-3 p-4"
            >
              <SafeImage
                src={`/circuits/${file}`}
                alt={circuitLabelFromFile(file)}
                width={160}
                height={120}
                className="h-24 w-full object-contain opacity-90"
              />
              <p
                className="font-[family-name:var(--font-condensed)] text-[10px] uppercase tracking-[0.12em]"
                style={{ color: 'var(--paper)' }}
              >
                {circuitLabelFromFile(file)}
              </p>
              <p
                className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.05em] text-muted"
                style={{ color: 'var(--muted)' }}
              >
                {file.replace('.svg', '')}
              </p>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
