import type { CircuitFacts } from '@/data/circuits/facts';

/** Circuit character/lore panel — mirrors mobile's circuit detail "CHARACTER" card (mobile/app/circuit/[id].tsx). */
export function CircuitCharacter({ facts }: { facts: CircuitFacts }) {
  return (
    <div className="flex flex-col gap-4">
      <span className="label-caps text-text-mid">Character</span>

      <div className="flex flex-wrap gap-6">
        {facts.lengthKm ? (
          <Stat label="Length" value={`${facts.lengthKm} km`} />
        ) : null}
        {facts.corners ? <Stat label="Corners" value={String(facts.corners)} /> : null}
        {facts.drsZones ? <Stat label="DRS Zones" value={String(facts.drsZones)} /> : null}
        {facts.firstGp ? <Stat label="First GP" value={String(facts.firstGp)} /> : null}
      </div>

      {facts.character ? (
        <div className="flex flex-col">
          <span className="label-caps text-text-low">Character</span>
          <span className="font-condensed text-lg font-600 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
            {facts.character}
          </span>
        </div>
      ) : null}

      {facts.signatureCorner ? (
        <div className="flex flex-col">
          <span className="label-caps text-text-low">Signature Corner</span>
          <span className="data-tabular text-text-hi">{facts.signatureCorner}</span>
        </div>
      ) : null}

      {facts.lapRecord ? (
        <div className="flex flex-col">
          <span className="label-caps text-text-low">Lap Record</span>
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
