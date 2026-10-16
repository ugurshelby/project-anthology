import { useTranslations } from 'next-intl';

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
  chapters,
  quote,
}: {
  heading: string;
  bio: string;
  milestones: string[];
  lore: string;
  /** Optional key/value facts row above the bio (e.g. nationality/born, or country/founded). */
  facts?: Array<{ label: string; value: string }>;
  /** Multi-era deep narrative chapters (Hamilton, Alonso, Verstappen, Ferrari, etc.). */
  chapters?: Array<{ title: string; text: string; era?: string }>;
  /** Verified primary source quote carrying the subject's voice. */
  quote?: { text: string; context: string; year?: number; sourceUrl?: string };
}) {
  const t = useTranslations('ui.profile');
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

      {quote ? (
        <blockquote
          className="relative my-0.5 rounded-[var(--radius)] border border-hairline border-l-2 bg-white/[0.02] p-4 text-text-hi"
          style={{ borderLeftColor: 'var(--team-accent, var(--color-accent))' }}
        >
          <p className="body-md italic leading-relaxed text-text-hi">
            &ldquo;{quote.text}&rdquo;
          </p>
          <footer className="mt-2 text-right font-mono text-xs text-text-low">
            — {quote.context} {quote.year ? `(${quote.year})` : ''}
            {quote.sourceUrl ? (
              <a
                href={quote.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="ml-2 inline-flex items-center text-text-low hover:text-text-mid transition-colors underline decoration-dotted underline-offset-2"
                title={quote.sourceUrl}
              >
                ↗
              </a>
            ) : null}
          </footer>
        </blockquote>
      ) : null}

      <p className="body-md leading-relaxed text-text md:line-clamp-none">{bio}</p>

      {chapters && chapters.length > 0 ? (
        <div className="flex flex-col gap-3.5 pt-1">
          {chapters.map((ch, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-1.5 rounded-[var(--radius)] border border-hairline bg-surface/50 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  lang="en"
                  className="font-condensed text-base font-700 uppercase tracking-tight text-text-hi"
                  style={{ fontFamily: 'var(--font-condensed)' }}
                >
                  {ch.title}
                </span>
                {ch.era ? (
                  <span className="data-tabular font-mono text-[11px] font-semibold tracking-wider text-text-low">
                    {ch.era}
                  </span>
                ) : null}
              </div>
              <p className="body-md leading-relaxed text-text-mid">{ch.text}</p>
            </div>
          ))}
        </div>
      ) : null}

      {milestones.length > 0 ? (
        <ul className="flex flex-col gap-2.5">
          {milestones.map((m, i) => (
            <li key={i} className={['flex items-start gap-3', i > 1 ? 'hidden md:flex' : ''].join(' ')}>
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              <span className="body-md text-text-mid">{m}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {lore ? (
        <div className="rounded-[var(--radius)] border border-hairline border-l-[3px] bg-surface p-4" style={{ borderLeftColor: 'var(--team-secondary, #d4a441)' }}>
          <span className="label-caps mb-2 block" style={{ color: 'var(--team-secondary, #d4a441)' }}>{t('deepCut')}</span>
          <p className="body-md italic text-text-mid">{lore}</p>
        </div>
      ) : null}
    </div>
  );
}
