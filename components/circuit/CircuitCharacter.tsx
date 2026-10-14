import { useTranslations } from 'next-intl';
import type { CircuitFacts } from '@/data/circuits/facts';

/** Circuit character/lore panel — mirrors mobile's circuit detail "CHARACTER" card (mobile/app/circuit/[id].tsx). */
export function CircuitCharacter({ facts }: { facts: CircuitFacts }) {
  const t = useTranslations('ui.circuit');
  return (
    <div className="flex flex-col gap-4">
      <span className="label-caps text-text-mid">{t('guide')}</span>

      {facts.character ? (
        <div className="flex flex-col">
          <span className="label-caps text-text-low">{t('character')}</span>
          <span className="font-condensed text-lg font-600 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
            {facts.character}
          </span>
        </div>
      ) : null}

      {facts.signatureCorner ? (
        <div className="flex flex-col">
          <span className="label-caps text-text-low">{t('signatureCorner')}</span>
          <span className="data-tabular text-text-hi">{facts.signatureCorner}</span>
        </div>
      ) : null}

      {facts.note ? <p className="text-base leading-[1.6] text-text-mid">{facts.note}</p> : null}
    </div>
  );
}
