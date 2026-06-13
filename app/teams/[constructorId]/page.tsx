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
  PROFILE_MIN_SEASON,
} from '@/lib/data/entities';
import { teamIconSrc, driverIconSrc } from '@/lib/assets/f1-icons';
import { getSeasonPalette, teamPaletteCssVars } from '@/config/team-colors';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { SITE_NAME } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ constructorId: string }>;
  searchParams: Promise<{ season?: string }>;
};

function parseSeason(raw: string | undefined): number {
  const n = Number(raw);
  if (Number.isFinite(n) && n >= PROFILE_MIN_SEASON && n <= CURRENT_SEASON) {
    return Math.trunc(n);
  }
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

export default async function TeamProfilePage({ params, searchParams }: PageProps) {
  const { constructorId } = await params;
  const season = parseSeason((await searchParams).season);

  const [profile, seasons] = await Promise.all([
    getTeamProfile(constructorId, season),
    getTeamSeasons(constructorId),
  ]);

  if (!profile) notFound();

  const palette = getSeasonPalette(profile.constructorId || profile.constructorName, season);
  const emblem = teamIconSrc(profile.constructorName, season);
  const seasonOptions = seasons.length > 0 ? seasons : [season];

  return (
    <div
      className="profile-root"
      style={teamPaletteCssVars(palette) as React.CSSProperties}
    >
      {/* Hero */}
      <header className="profile-hero">
        <div className="profile-hero-glow" aria-hidden />
        <div className="profile-hero-grain" aria-hidden />
        <div className="content-wrap relative">
          <p className="profile-eyebrow">Constructor · {season}</p>
          <div className="mt-3 flex items-center gap-5">
            {emblem ? (
              <SafeImage
                src={emblem}
                alt=""
                width={72}
                height={72}
                className="h-16 w-16 shrink-0 object-contain sm:h-[72px] sm:w-[72px]"
              />
            ) : null}
            <h1 className="profile-title">{profile.constructorName}</h1>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="profile-chip">P{profile.position}</span>
            <span className="profile-chip">{profile.points} PTS</span>
            <span className="profile-chip">{profile.wins} WINS</span>
          </div>
        </div>
      </header>

      <div className="content-wrap flex flex-col gap-[var(--section-gap)] py-10">
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

        {/* Related news — current season only */}
        {season === CURRENT_SEASON ? (
          <RelatedNews entityName={profile.constructorName} />
        ) : null}
      </div>
    </div>
  );
}
