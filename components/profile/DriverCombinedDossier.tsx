import { BentoCard } from '@/components/bento/BentoCard';
import { TechnicalDossier, type DossierEntry } from '@/components/profile/TechnicalDossier';

/**
 * Two-column technical + career dossier in a single bento card.
 */
export function DriverCombinedDossier({
  technical,
  career,
}: {
  technical: DossierEntry[];
  career: DossierEntry[];
}) {
  return (
    <BentoCard span={12}>
      <span className="label-caps mb-4 block text-text-mid">Technical &amp; Historical Dossier</span>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        <div>
          <span className="label-caps mb-2 block text-text-low">Technical Overview</span>
          <TechnicalDossier entries={technical} />
        </div>
        <div>
          <span className="label-caps mb-2 block text-text-low">Career</span>
          <TechnicalDossier entries={career} />
        </div>
      </div>
    </BentoCard>
  );
}
