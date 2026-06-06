import Link from 'next/link';
import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { RaceHeroPanels, type RaceHeroPanel } from '@/components/ui/RaceHeroPanels';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { fetchSeasonSnapshotTyped, fetchRoundSnapshot } from '@/lib/data/f1';
import { getLatestNews } from '@/lib/data/news';
import {
  formatRaceCountdown,
  getDriverStandings,
  getRaceAfter,
  getRaceWinner,
  getRacesFromCalendar,
  nowMs,
  raceStartMs,
} from '@/lib/f1/mrdata';
import { driverIconSrc, teamIconSrc } from '@/lib/assets/f1-icons';
import { CURRENT_SEASON, getF1Context, getLastFinishedRace } from '@/lib/f1Calendar';

// Re-read on each request so the countdown and news highlights stay current
// (the cron updates news_cache / f1_snapshots; a static prerender would freeze them).
export const revalidate = 0;

export default async function HomePage() {
  const [calendarData, standingsData, news] = await Promise.all([
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar'),
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_drivers'),
    getLatestNews(6),
  ]);

  // Capture the clock once at request time via a lib helper (keeps the render
  // body pure — no bare Date.now() for the purity rule to flag).
  const renderNowMs = nowMs();

  const races = getRacesFromCalendar(calendarData);
  const ctx = getF1Context(races);
  const standings = getDriverStandings(standingsData, 5);

  // Hero race hierarchy: previous · next (countdown) · after-next.
  const previousRace = getLastFinishedRace(races);
  const nextRace = ctx.nextRace;
  const afterNextRace = nextRace ? getRaceAfter(races, nextRace.round) : null;

  // The previous race's winner enriches the "Previous" panel (results snapshot).
  const previousRound =
    previousRace?.round != null ? Number(previousRace.round) : null;
  const previousResults =
    previousRound != null && Number.isFinite(previousRound)
      ? await fetchRoundSnapshot(CURRENT_SEASON, previousRound, 'results')
      : null;
  const previousWinner = getRaceWinner(previousResults);

  const countdown =
    nextRace != null
      ? formatRaceCountdown(raceStartMs(nextRace), renderNowMs)
      : 'Season calendar loading';

  const previousPanel: RaceHeroPanel | null = previousRace
    ? {
        race: previousRace,
        role: 'Previous',
        detail: previousWinner ? `Winner · ${previousWinner.driverName}` : undefined,
      }
    : null;
  const nextPanel: RaceHeroPanel | null = nextRace
    ? { race: nextRace, role: 'Next Race', emphasis: true, countdown }
    : null;
  const afterNextPanel: RaceHeroPanel | null = afterNextRace
    ? {
        race: afterNextRace,
        role: 'Then',
        detail: `Round ${afterNextRace.round ?? '—'}`,
      }
    : null;

  return (
    <>
      <AtmosphericHero>
        <p
          className="font-condensed text-[12px] uppercase tracking-[0.42em] text-muted"
          style={{ color: 'var(--muted)' }}
        >
          Formula 1 · {CURRENT_SEASON}
        </p>
        <h1
          className="mt-5 font-display leading-[0.82] tracking-[0.06em] text-[clamp(5.5rem,26vw,20rem)] text-paper"
          style={{
            color: 'var(--paper)',
            textShadow: '0 0 80px rgba(255,24,1,0.18)',
          }}
        >
          ANTHOLOGY
        </h1>
        <p
          className="mt-6 max-w-md font-light text-sm leading-relaxed"
          style={{ color: 'var(--muted)' }}
        >
          A living archive of the championship — standings, circuits, radio and the
          stories that made the sport.
        </p>
        <RaceHeroPanels
          previous={previousPanel}
          next={nextPanel}
          afterNext={afterNextPanel}
        />
      </AtmosphericHero>

      <div className="content-wrap space-y-section-gap">
        <section>
          <SectionDivider title="Quick Standings" />
          {standings.length === 0 ? (
            <p className="font-mono text-xs text-muted" style={{ color: 'var(--muted)' }}>
              Standings sync pending — check back after the next cron run.
            </p>
          ) : (
            <ul className="divide-y divide-border border border-border bg-surface">
              {standings.map((row) => {
                const driverSrc = driverIconSrc(row.driverCode, row.driverName);
                const teamSrc = teamIconSrc(row.constructorName);
                return (
                <li
                  key={row.position + row.driverName}
                  className="flex items-center gap-4 px-4 py-3 font-mono text-xs tracking-wider"
                >
                  <span className="w-6 text-accent" style={{ color: 'var(--accent)' }}>
                    {row.position}
                  </span>
                  {driverSrc ? (
                    <SafeImage
                      src={driverSrc}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  ) : null}
                  <span className="flex-1 text-paper" style={{ color: 'var(--paper)' }}>
                    {row.driverName}
                  </span>
                  {teamSrc ? (
                    <SafeImage
                      src={teamSrc}
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain opacity-90"
                    />
                  ) : null}
                  <span className="text-muted" style={{ color: 'var(--muted)' }}>
                    {row.points} pts
                  </span>
                </li>
              );})}
            </ul>
          )}
          <Link
            href="/season"
            className="mt-4 inline-block font-condensed text-[10px] uppercase tracking-[0.12em] text-accent"
            style={{ color: 'var(--accent)' }}
          >
            Full season →
          </Link>
        </section>

        <section>
          <SectionDivider title="News Highlights" />
          {news.length === 0 ? (
            <p className="text-sm text-muted" style={{ color: 'var(--muted)' }}>
              No cached headlines yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <article key={item.id} className="anthology-card overflow-hidden">
                  <div className="relative aspect-video bg-card">
                    <SafeImage
                      src={item.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)',
                      }}
                    />
                    <h3
                      className="absolute bottom-3 left-3 right-3 font-display text-[1.3rem] leading-tight tracking-[0.04em]"
                      style={{ color: 'var(--paper)' }}
                    >
                      {item.title}
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 text-xs font-light text-muted" style={{ color: 'var(--muted)' }}>
                      {item.summary}
                    </p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block font-condensed text-[10px] uppercase tracking-[0.12em]"
                      style={{ color: 'var(--accent)' }}
                    >
                      Read →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
          <Link
            href="/news"
            className="mt-4 inline-block font-condensed text-[10px] uppercase tracking-[0.12em]"
            style={{ color: 'var(--accent)' }}
          >
            All news →
          </Link>
        </section>
      </div>
    </>
  );
}
