import { useTranslations } from 'next-intl';
import type { CircuitFacts } from '@/data/circuits/facts';

/** Circuit character/lore panel — mirrors mobile's circuit detail "CHARACTER" card (mobile/app/circuit/[id].tsx). */
export function CircuitCharacter({ facts }: { facts: CircuitFacts }) {
  const t = useTranslations('ui.circuit');
  return (
    <div className="flex flex-col gap-4">
      <span className="label-caps text-text-mid">{t('character')}</span>

      <div className="flex flex-wrap gap-6">
        {facts.lengthKm ? (
          <Stat label={t('length')} value={t('km', { value: facts.lengthKm })} />
        ) : null}
        {facts.corners ? <Stat label={t('corners')} value={String(facts.corners)} /> : null}
        {facts.drsZones ? <Stat label={t('drsZones')} value={String(facts.drsZones)} /> : null}
        {facts.firstGp ? <Stat label={t('firstGp')} value={String(facts.firstGp)} /> : null}
      </div>

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

      {facts.lapRecord ? (
        <div className="flex flex-col">
          <span className="label-caps text-text-low">{t('lapRecord')}</span>
          <span className="data-tabular text-text-hi">{facts.lapRecord}</span>
        </div>
      ) : null}

      {facts.note ? <p className="body-md text-text-mid">{facts.note}</p> : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="label-caps text-text-low">{label}</span>
      <span className="data-tabular text-text-hi">{value}</span>
    </div>
  );
}
