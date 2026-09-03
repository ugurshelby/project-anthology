import { BentoCard } from '@/components/bento/BentoCard';
import { TechnicalDossier, type DossierEntry } from '@/components/profile/TechnicalDossier';

function ChassisSilhouette() {
  return (
    <svg viewBox="0 0 280 90" fill="none" aria-hidden className="h-full w-full text-white">
      <path
        d="M18 58 H52 L68 38 H128 L148 22 H198 L232 38 H262 V52 H232 L210 68 H98 L78 58 H18 Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M88 58 C96 48 112 48 120 58" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="104" cy="62" r="10" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="214" cy="62" r="10" stroke="currentColor" strokeWidth="1.2" />
      <path d="M148 22 V38" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function TeamTechnicalCard({
  entries,
  powerUnit,
}: {
  entries: DossierEntry[];
  powerUnit?: string | null;
}) {
  const rows = powerUnit ? [{ label: 'Power Unit', value: powerUnit }, ...entries] : entries;

  return (
    <BentoCard span={12} className="relative overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: 'var(--team-secondary)', opacity: 0.7 }}
      />
      <span className="pointer-events-none absolute -right-6 bottom-0 h-28 w-64 opacity-[0.07] md:h-32 md:w-80">
        <ChassisSilhouette />
      </span>
      <span className="label-caps mb-4 block text-text-mid">Technical Dossier</span>
      <div className="relative z-10">
        <TechnicalDossier entries={rows} />
      </div>
    </BentoCard>
  );
}
