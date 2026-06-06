import type { Metadata } from 'next';
import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { getPublishedRadioMoments } from '@/lib/data/radio';

const TITLE = 'Team Radio';
const DESCRIPTION =
  'Iconic Formula 1 team radio moments — transcripts and audio of the messages that defined races.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} — F1 Moments`,
    description: DESCRIPTION,
    url: '/radio',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} — F1 Moments`, description: DESCRIPTION },
  alternates: { canonical: '/radio' },
};

export default async function RadioPage() {
  const moments = await getPublishedRadioMoments(40);

  return (
    <>
      <AtmosphericHero>
        <p
          className="font-condensed text-[11px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--muted)' }}
        >
          Team Radio
        </p>
        <h1
          className="mt-2 font-display text-[clamp(5rem,16vw,12rem)] leading-[0.88] tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          RADIO
        </h1>
        <p className="mt-2 text-sm text-muted" style={{ color: 'var(--muted)' }}>
          OpenF1 audio moments — player UI placeholder until Phase 5+ polish.
        </p>
      </AtmosphericHero>

      <div className="content-wrap">
        <SectionDivider title="Moments" />
        {moments.length === 0 ? (
          <p className="text-sm text-muted" style={{ color: 'var(--muted)' }}>
            No published radio moments yet. Run sync-radio cron after seeding.
          </p>
        ) : (
          <ul className="space-y-3">
            {moments.map((m) => (
              <li key={m.id} className="anthology-card p-4">
                <p
                  className="font-mono text-[9px] uppercase tracking-wider text-accent/70"
                  style={{ color: 'rgba(255,24,1,0.7)' }}
                >
                  {m.year ?? '—'} · R{m.round ?? '—'} · {m.gp_name ?? 'GP'}
                </p>
                <p
                  className="mt-1 font-display text-[1.3rem] tracking-[0.04em]"
                  style={{ color: 'var(--paper)' }}
                >
                  {m.driver ?? 'Unknown'} — {m.team ?? 'Team'}
                </p>
                {m.transcript ? (
                  <p className="mt-2 line-clamp-2 text-xs font-light text-muted" style={{ color: 'var(--muted)' }}>
                    {m.transcript}
                  </p>
                ) : null}
                <div
                  className="mt-4 flex items-center gap-3 border border-border bg-surface px-3 py-2"
                  aria-label="Audio player placeholder"
                >
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center text-xs"
                    style={{ background: 'var(--accent)', color: 'var(--background)' }}
                  >
                    ▶
                  </span>
                  {m.audio_url ? (
                    <audio controls preload="none" className="h-8 flex-1 max-w-full">
                      <source src={m.audio_url} />
                    </audio>
                  ) : (
                    <span className="font-mono text-[10px] text-muted" style={{ color: 'var(--muted)' }}>
                      Audio URL pending sync
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
