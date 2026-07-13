/**
 * Bio + milestones + "deep cut" lore — mirrors mobile's "THE STORY"/"THE TEAM"
 * detail sections (mobile/app/driver/[id].tsx, mobile/app/team/[id].tsx).
 * Ported to web because these driver/team detail pages fetched DriverLore/
 * TeamLore data but never rendered anything beyond the permanent number —
 * the richest authored content on the site was going unused.
 */
export function LoreSection({
  heading,
  bio,
  milestones,
  lore,
  facts,
}: {
  heading: string;
  bio: string;
  milestones: string[];
  lore: string;
  /** Optional key/value facts row above the bio (e.g. nationality/born, or country/founded). */
  facts?: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="flex flex-col gap-5">
      <span className="label-caps text-text-mid">{heading}</span>

      {facts && facts.length > 0 ? (
        <div className="flex flex-wrap gap-6">
          {facts.map((f) => (
            <div key={f.label} className="flex flex-col">
              <span className="label-caps text-text-low">{f.label}</span>
              <span className="data-tabular text-text-hi">{f.value}</span>
            </div>
          ))}
        </div>
      ) : null}

      <p className="body-md text-text">{bio}</p>

      {milestones.length > 0 ? (
        <ul className="flex flex-col gap-2.5">
          {milestones.map((m, i) => (
            <li key={i} className="flex items-start gap-3">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              <span className="body-md text-text-mid">{m}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {lore ? (
        <div className="rounded-[var(--radius)] border border-hairline border-l-[3px] bg-surface p-4" style={{ borderLeftColor: 'var(--team-secondary, #d4a441)' }}>
          <span className="label-caps mb-2 block" style={{ color: 'var(--team-secondary, #d4a441)' }}>Deep Cut</span>
          <p className="body-md italic text-text-mid">{lore}</p>
        </div>
      ) : null}
    </div>
  );
}
