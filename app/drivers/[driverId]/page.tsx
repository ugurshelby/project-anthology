import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { SeasonPills } from '@/components/profile/SeasonPills';
import { RelatedNews } from '@/components/profile/RelatedNews';
import {
  getDriverProfile,
  getDriverSeasons,
  getDriverCareer,
} from '@/lib/data/entities';
import { getDriverLore } from '@/data/drivers';
import { driverIconSrc, teamIconSrc, carSrc } from '@/lib/assets/f1-icons';
import { getSeasonPalette, teamPaletteCssVars } from '@/config/team-colors';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { SITE_NAME } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ driverId: string }>;
  searchParams: Promise<{ season?: string }>;
};

function parseSeason(_raw: string | undefined): number {
  return CURRENT_SEASON;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { driverId } = await params;
  const season = parseSeason((await searchParams).season);
  const profile = await getDriverProfile(driverId, season);
  if (!profile) return { title: 'Driver not found' };

  const title = `${profile.driverName} — ${season}`;
  const description = `${profile.driverName} in the ${season} F1 season with ${profile.constructorName}: championship position, points, wins, and podiums.`;
  const canonical = `/drivers/${driverId}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: `${title} — ${SITE_NAME}`, description, url: canonical, type: 'profile' },
    twitter: { card: 'summary_large_image', title: `${title} — ${SITE_NAME}`, description },
  };
}

function StatCell({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-border px-3 py-3" style={{ backgroundColor: 'var(--surface)' }}>
      <dt className="font-condensed text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>
        {label}
      </dt>
      <dd
        className="mt-1 font-mono text-lg tracking-[0.05em]"
        style={{ color: accent ? 'var(--team-secondary)' : 'var(--paper)' }}
      >
        {value}
      </dd>
    </div>
  );
}

export default async function DriverProfilePage({ params, searchParams }: PageProps) {
  const { driverId } = await params;
  const season = parseSeason((await searchParams).season);

  const [profile, seasons, career] = await Promise.all([
    getDriverProfile(driverId, season),
    getDriverSeasons(driverId),
    getDriverCareer(driverId),
  ]);

  if (!profile) notFound();

  const lore = getDriverLore(driverId);
  const palette = getSeasonPalette(profile.constructorId || profile.constructorName, season);
  const bust = driverIconSrc(profile.driverCode, profile.driverId || profile.driverName, season);
  const teamSrc = teamIconSrc(profile.constructorName, season);
  const car = carSrc(profile.constructorId, profile.constructorName);
  const seasonOptions = seasons.length > 0 ? seasons : [season];
  const driverNumber = lore?.number ?? null;

  return (
    <div className="profile-root" style={teamPaletteCssVars(palette) as React.CSSProperties}>
      {/* Hero */}
      <header className="profile-hero" style={{ minHeight: 340, overflow: 'hidden', position: 'relative' }}>
        <div className="profile-hero-glow" aria-hidden />
        <div className="profile-hero-grain" aria-hidden />

        {/* Devasa neon sürücü numarası — viewport dışına taşan, sinematik */}
        {driverNumber !== null ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              right: '-0.05em',
              bottom: '-0.18em',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(14rem, 38vw, 26rem)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: 'transparent',
              WebkitTextStroke: '1.5px color-mix(in srgb, var(--team-secondary) 45%, transparent)',
              userSelect: 'none',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          >
            {driverNumber}
          </span>
        ) : null}

        <div
          className="profile-hero-content content-wrap relative"
          style={{
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'flex-end',
            gap: '1.5rem',
            paddingBottom: '2.5rem',
          }}
        >
          <div>
            <p className="profile-eyebrow">
              Driver{profile.constructorName && profile.constructorName !== '—' ? ` · ${profile.constructorName}` : ''} · {season}
            </p>
            <h1 className="profile-title mt-3">{profile.driverName}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="profile-chip">P{profile.position}</span>
              <span className="profile-chip">{profile.points} PTS</span>
              {driverNumber !== null ? (
                <span
                  className="profile-chip font-display text-lg"
                  style={{ color: 'var(--team-secondary)', borderColor: 'var(--team-secondary)' }}
                >
                  #{driverNumber}
                </span>
              ) : null}
              {teamSrc ? (
                <SafeImage src={teamSrc} alt="" width={28} height={28} className="h-7 w-7 object-contain opacity-90" />
              ) : null}
            </div>
          </div>

          {/* Pilot portresi — hero sağı, alt hizalı, ekrandan taşan */}
          {bust ? (
            <div
              aria-hidden
              style={{
                position: 'relative',
                width: 'clamp(160px, 22vw, 280px)',
                height: 'clamp(200px, 28vw, 340px)',
                flexShrink: 0,
                marginBottom: '-2.5rem',
              }}
            >
              <SafeImage
                src={bust}
                alt=""
                fill
                sizes="(max-width:768px) 160px, 280px"
                className="object-contain object-bottom"
                priority
              />
            </div>
          ) : null}
        </div>
      </header>

      {/* Araç görseli — hero hemen altı, tam genişlik, sinematik bant */}
      {car ? (
        <div
          style={{
            background: 'linear-gradient(180deg, color-mix(in srgb, var(--team-primary) 12%, #0a0a0a) 0%, #0a0a0a 100%)',
            borderBottom: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <div
            className="content-wrap"
            style={{ paddingTop: '2rem', paddingBottom: '2rem', position: 'relative' }}
          >
            <p
              className="font-condensed text-[10px] uppercase tracking-[0.18em] mb-3"
              style={{ color: 'var(--muted)' }}
            >
              {season} Car · {profile.constructorName}
            </p>
            <SafeImage
              src={car}
              alt={`${profile.constructorName} ${season} car`}
              width={900}
              height={280}
              className="w-full max-h-44 object-contain object-left"
              priority
            />
          </div>
        </div>
      ) : null}

      <div className="content-wrap flex flex-col gap-(--section-gap) py-10">
        {/* Season selector */}
        <section>
          <SectionDivider title="Season" />
          <SeasonPills seasons={seasonOptions} active={season} />
        </section>

        {/* Season stats */}
        <section>
          <SectionDivider title={`${season} Season`} />
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCell label="Position" value={`P${profile.position}`} accent={profile.position === '1'} />
            <StatCell label="Points" value={profile.points} />
            <StatCell label="Wins" value={String(profile.wins)} />
            <StatCell label="Podiums" value={String(profile.podiums)} />
          </dl>
          <div className="mt-4">
            {profile.constructorId ? (
              <Link
                href={`/teams/${profile.constructorId}?season=${season}`}
                className="font-condensed text-[11px] uppercase tracking-[0.15em]"
                style={{ color: 'var(--team-secondary)' }}
              >
                {profile.constructorName} →
              </Link>
            ) : null}
          </div>
        </section>

        {/* Career aggregate — only show when there are multiple seasons */}
        {career.seasons > 1 ? (
          <section>
            <SectionDivider title="Career" />
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCell label="Seasons" value={String(career.seasons)} />
              <StatCell
                label="Championships"
                value={String(career.championships)}
                accent={career.championships > 0}
              />
              <StatCell label="Wins" value={String(career.wins)} />
              <StatCell label="Podiums" value={String(career.podiums)} />
            </dl>
            {career.points > 0 ? (
              <p className="mt-3 font-mono text-xs" style={{ color: 'var(--muted)' }}>
                {career.points.toLocaleString()} career points
              </p>
            ) : null}

            {/* Teams timeline */}
            {career.teams.length > 1 ? (
              <div className="mt-6">
                <p className="mb-3 font-condensed text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>
                  Teams
                </p>
                <div className="flex flex-wrap gap-2">
                  {groupTeamSpans(career.teams).map((span) => (
                    <Link
                      key={`${span.constructorId}-${span.from}`}
                      href={`/teams/${span.constructorId}`}
                      className="border border-border px-3 py-1 font-condensed text-[11px] uppercase tracking-[0.1em] transition-colors"
                      style={{ color: 'var(--muted)' }}
                    >
                      {span.constructorName}
                      <span className="ml-1 font-mono text-[10px]" style={{ color: 'var(--border-hover)' }}>
                        {span.from === span.to ? span.from : `${span.from}–${span.to}`}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Biography & Lore */}
        {lore ? (
          <section>
            <SectionDivider title="Profile" />
            <div className="max-w-2xl space-y-4">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {lore.bio}
              </p>

              {lore.milestones.length > 0 ? (
                <ul className="mt-4 space-y-2 border-l-2 pl-4" style={{ borderColor: 'var(--team-secondary)' }}>
                  {lore.milestones.map((m) => (
                    <li key={m} className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                      {m}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="border border-border p-4" style={{ backgroundColor: 'var(--surface)' }}>
                <p className="mb-1 font-condensed text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--team-secondary)' }}>
                  Technical Note
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {lore.lore}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {/* Related news — current season only */}
        {season === CURRENT_SEASON ? <RelatedNews entityName={profile.driverName} /> : null}
      </div>
    </div>
  );
}

interface TeamSpan {
  constructorId: string;
  constructorName: string;
  from: number;
  to: number;
}

function groupTeamSpans(
  teams: Array<{ season: number; constructorId: string; constructorName: string }>,
): TeamSpan[] {
  const spans: TeamSpan[] = [];
  for (const t of teams) {
    const last = spans[spans.length - 1];
    if (last && last.constructorId === t.constructorId && last.to === t.season - 1) {
      last.to = t.season;
    } else {
      spans.push({ constructorId: t.constructorId, constructorName: t.constructorName, from: t.season, to: t.season });
    }
  }
  return spans;
}
