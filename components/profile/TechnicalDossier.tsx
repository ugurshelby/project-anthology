export interface DossierEntry {
  label: string;
  value: string;
}

/** Technical dossier (design.md §3.3) — mono key/value list, right-aligned values. */
export function TechnicalDossier({ entries }: { entries: DossierEntry[] }) {
  return (
    <dl className="flex flex-col">
      {entries.map((e) => (
        <div
          key={e.label}
          className="flex items-center justify-between border-b border-hairline py-2.5 last:border-b-0"
        >
          <dt className="label-caps text-text-mid">{e.label}</dt>
          <dd className="data-tabular text-text-hi">{e.value}</dd>
        </div>
      ))}
    </dl>
  );
}
