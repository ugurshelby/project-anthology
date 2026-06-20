import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { SeasonPills } from '@/components/profile/SeasonPills';
import { RelatedNews } from '@/components/profile/RelatedNews';
import {
  getTeamProfile,
  getTeamSeasons,
  getTeamCareer,
  PROFILE_MIN_SEASON,
} from '@/lib/data/entities';
import { getTeamLore } from '@/data/teams';
import { teamIconSrc, driverIconSrc, carSrc } from '@/lib/assets/f1-icons';
import { getSeasonPalette, teamPaletteCssVars } from '@/config/team-colors';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { SITE_NAME } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ constructorId: string }>;
  searchParams: Promise<{ season?: string }>;
};

function parseSeason(_raw: string | undefined): number {
  return CURRENT_SEASON;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { constructorId } = await params;
  const season = parseSeason((await searchParams).season);
  const profile = await getTeamProfile(constructorId, season);
  if (!profile) return { title: 'Constructor not found' };

  const title = `${profile.constructorName} — ${season}`;
  const description = `${profile.constructorName} in the ${season} F1 season: championship position, points, and driver lineup.`;
  const canonical = `/teams/${constructorId}`;
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

export default async function TeamProfilePage({ params, searchParams }: PageProps) {
  const { constructorId } = await params;
  const season = parseSeason((await searchParams).season);

  const [profile, seasons, career] = await Promise.all([
    getTeamProfile(constructorId, season),
    getTeamSeasons(constructorId),
    getTeamCareer(constructorId),
  ]);

  if (!profile) notFound();

  const lore = getTeamLore(constructorId);
  const palette = getSeasonPalette(profile.constructorId || profile.constructorName, season);
  const emblem = teamIconSrc(profile.constructorName, season);
  const car = carSrc(profile.constructorId, profile.constructorName);
  const seasonOptions = seasons.length > 0 ? seasons : [season];

  return (
    <div
      className="profile-root"
      style={teamPaletteCssVars(palette) as React.CSSProperties}
    >
      {/* Hero */}
      <header className="profile-hero" style={{ minHeight: 380, overflow: 'hidden', position: 'relative' }}>
        <div className="profile-hero-glow" aria-hidden />
        <div className="profile-hero-grain" aria-hidden />

        {/* Takım adı — devasa dekoratif arka plan yazısı */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: '-0.02em',
            bottom: '-0.22em',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(8rem, 22vw, 16rem)',
            lineHeight: 1,
            letterSpacing: '0.02em',
            color: 'transparent',
            WebkitTextStroke: '1px color-mix(in srgb, var(--team-secondary) 18%, transparent)',
            userSelect: 'none',
            zIndex: 0,
            pointerEvents: 'none',
            textTransform: 'uppercase',
          }}
        >
          {profile.constructorName.split(' ')[0]}
        </span>

        <div className="content-wrap relative" style={{ zIndex: 1, paddingBottom: '2.5rem' }}>
          <p className="profile-eyebrow">Constructor · {season}</p>

          {/* Logo + Title row */}
          <div className="mt-4 flex items-center gap-6">
            {emblem ? (
              <div
                style={{
                  width: 'clamp(64px, 10vw, 108px)',
                  height: 'clamp(64px, 10vw, 108px)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid color-mix(in srgb, var(--team-secondary) 30%, transparent)',
                  padding: '0.75rem',
                  background: 'color-mix(in srgb, var(--team-primary) 12%, transparent)',
                }}
              >
                <SafeImage
                  src={emblem}
                  alt={profile.constructorName}
                  width={96}
                  height={96}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            ) : null}
            <h1 className="profile-title">{profile.constructorName}</h1>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="profile-chip">P{profile.position}</span>
            <span className="profile-chip">{profile.points} PTS</span>
            <span className="profile-chip">{profile.wins} WINS</span>
          </div>
        </div>

        {/* Araç — hero içinde altta tam genişlik, hafif saydam */}
        {car ? (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '62%',
              maxWidth: 700,
              pointerEvents: 'none',
              zIndex: 1,
            }}
            aria-hidden
          >
            <SafeImage
              src={car}
              alt=""
              width={700}
              height={220}
              className="w-full object-contain object-right-bottom opacity-80"
              priority
            />
          </div>
        ) : null}
      </header>

      <div className="content-wrap flex flex-col gap-(--section-gap) py-10">
        {/* Season selector */}
        <section>
          <SectionDivider title="Season" />
          <SeasonPills seasons={seasonOptions} active={season} />
        </section>

        {/* Drivers */}
        {profile.drivers.length > 0 ? (
          <section>
            <SectionDivider title={`${season} Drivers`} />
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.drivers.map((d) => {
                const src = driverIconSrc(d.driverCode, d.driverId || d.driverName, season);
                return (
                  <Link
                    key={d.driverId || d.driverName}
                    href={d.driverId ? `/drivers/${d.driverId}?season=${season}` : '#'}
                    className="profile-driver-row"
                    style={{ borderLeftColor: 'var(--team-secondary)' }}
                  >
                    <span className="w-6 shrink-0 font-mono text-xs" style={{ color: 'var(--muted)' }}>
                      {d.position}
                    </span>
                    {src ? (
                      <SafeImage src={src} alt="" width={32} height={32} className="h-8 w-8 shrink-0 object-contain" />
                    ) : null}
                    <span className="min-w-0 flex-1 truncate" style={{ color: 'var(--paper)' }}>
                      {d.driverName}
                    </span>
                    <span className="shrink-0 font-mono text-xs" style={{ color: 'var(--paper)' }}>
                      {d.points}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}


        {/* Career aggregate — only show when there are multiple seasons of data */}
        {career.seasons > 1 ? (
          <section>
            <SectionDivider title="Team Record" />
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCell label="Seasons (archive)" value={String(career.seasons)} />
              <StatCell
                label="Championships"
                value={String(career.championships)}
                accent={career.championships > 0}
              />
              <StatCell label="Wins" value={String(career.wins)} />
              <StatCell
                label="Best Position"
                value={career.bestPosition !== null ? `P${career.bestPosition}` : '—'}
                accent={career.bestPosition === 1}
              />
            </dl>
            <p className="mt-2 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
              Based on {PROFILE_MIN_SEASON}–{CURRENT_SEASON} archive data
            </p>
          </section>
        ) : null}

        {/* HQ map placeholder + biography */}
        {lore ? (
          <section>
            <SectionDivider title="Team" />

            {/* HQ info */}
            <div className="mb-4 flex items-center gap-3 border border-border px-4 py-3" style={{ backgroundColor: 'var(--surface)' }}>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--team-secondary)' }}>
                HQ
              </span>
              <span className="font-condensed text-sm" style={{ color: 'var(--paper)' }}>
                {lore.hq.label}
              </span>
              <span className="ml-auto font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                {lore.hq.lat.toFixed(4)}°, {lore.hq.lng.toFixed(4)}°
              </span>
            </div>

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
        {season === CURRENT_SEASON ? (
          <RelatedNews entityName={profile.constructorName} />
        ) : null}
      </div>
    </div>
  );
}
