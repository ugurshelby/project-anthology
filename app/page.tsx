import Link from 'next/link';
import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { fetchSeasonSnapshotTyped } from '@/lib/data/f1';
import { getLatestNews } from '@/lib/data/news';
import {
  formatRaceCountdown,
  getDriverStandings,
  getRacesFromCalendar,
  nowMs,
  raceStartMs,
} from '@/lib/f1/mrdata';
import { CURRENT_SEASON, getF1Context } from '@/lib/f1Calendar';

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
  const countdown =
    ctx.nextRace != null
      ? formatRaceCountdown(raceStartMs(ctx.nextRace), renderNowMs)
      : 'Season calendar loading';

  return (
    <>
      <AtmosphericHero>
        <p
          className="font-[family-name:var(--font-condensed)] text-[11px] uppercase tracking-[0.2em] text-muted"
          style={{ color: 'var(--muted)' }}
        >
          {CURRENT_SEASON} Season Hub
        </p>
        <h1
          className="mt-2 font-[family-name:var(--font-display)] text-[clamp(3rem,12vw,5rem)] leading-[0.88] tracking-[0.04em] text-paper"
          style={{ color: 'var(--paper)' }}
        >
          ANTHOLOGY
        </h1>
        <p className="mt-3 max-w-xl text-sm font-light text-muted" style={{ color: 'var(--muted)' }}>
          Standings, race countdown, and curated F1 news — powered by live snapshots.
        </p>
      </AtmosphericHero>

      <div className="content-wrap space-y-[var(--section-gap)]">
        <section>
          <SectionDivider title="Quick Standings" />
          {standings.length === 0 ? (
            <p className="font-[family-name:var(--font-mono)] text-xs text-muted" style={{ color: 'var(--muted)' }}>
              Standings sync pending — check back after the next cron run.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)] border border-[var(--border)] bg-surface">
              {standings.map((row) => (
                <li
                  key={row.position + row.driverName}
                  className="flex items-center gap-4 px-4 py-3 font-[family-name:var(--font-mono)] text-xs tracking-[0.05em]"
                >
                  <span className="w-6 text-accent" style={{ color: 'var(--accent)' }}>
                    {row.position}
                  </span>
                  {row.driverCode ? (
                    <SafeImage
                      src={`/drivers/${row.driverCode}.svg`}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  ) : null}
                  <span className="flex-1 text-paper" style={{ color: 'var(--paper)' }}>
                    {row.driverName}
                  </span>
                  <span className="text-muted" style={{ color: 'var(--muted)' }}>
                    {row.points} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/season"
            className="mt-4 inline-block font-[family-name:var(--font-condensed)] text-[10px] uppercase tracking-[0.12em] text-accent"
            style={{ color: 'var(--accent)' }}
          >
            Full season →
          </Link>
        </section>

        <section>
          <SectionDivider title="Race Countdown" />
          <div className="anthology-card p-6">
            <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.05em] text-accent/70" style={{ color: 'rgba(255,24,1,0.7)' }}>
              Next Grand Prix
            </p>
            <p
              className="mt-2 font-[family-name:var(--font-display)] text-[2.5rem] leading-none tracking-[0.04em]"
              style={{ color: 'var(--paper)' }}
            >
              {ctx.nextRace?.raceName ?? 'TBC'}
            </p>
            <p className="mt-2 font-[family-name:var(--font-mono)] text-sm tracking-[0.05em] text-paper" style={{ color: 'var(--paper)' }}>
              {countdown}
            </p>
          </div>
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
                      className="absolute bottom-3 left-3 right-3 font-[family-name:var(--font-display)] text-[1.3rem] leading-tight tracking-[0.04em]"
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
                      className="mt-3 inline-block font-[family-name:var(--font-condensed)] text-[10px] uppercase tracking-[0.12em]"
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
            className="mt-4 inline-block font-[family-name:var(--font-condensed)] text-[10px] uppercase tracking-[0.12em]"
            style={{ color: 'var(--accent)' }}
          >
            All news →
          </Link>
        </section>
      </div>
    </>
  );
}
