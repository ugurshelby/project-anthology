import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDriverProfile, getDriverSeasons, getDriverCareer } from '@/lib/data/entities';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { SITE_NAME } from '@/lib/seo';
import Image from 'next/image';
import { teamThemeVars } from '@/lib/theme';
import { driverIconSrc, carSrc, teamIconSrc } from '@/lib/assets/f1-icons';
import { getDriverLore } from '@/data/drivers';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { StatBlock } from '@/components/bento/StatBlock';
import { StatTrio } from '@/components/bento/StatTrio';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { TechnicalDossier } from '@/components/profile/TechnicalDossier';
import { PageThemeSync } from '@/components/layout/PageThemeSync';

/** Vercel @vercel/next + Next 16 segment SSG packaging bug — force server render. */
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ driverId: string }>;
  searchParams: Promise<{ season?: string }>;
};

/**
 * Only CURRENT_SEASON has profile data today (`profileSeasons()` in
 * lib/data/entities.ts). Requesting anything else is a no-op, so surface that
 * to the caller instead of silently swapping in the current season.
 */
function parseSeason(raw: string | undefined): { season: number; requestedUnsupported: boolean } {
  if (raw === undefined) return { season: CURRENT_SEASON, requestedUnsupported: false };
  const parsed = Number(raw);
  const requestedUnsupported = !Number.isFinite(parsed) || parsed !== CURRENT_SEASON;
  return { season: CURRENT_SEASON, requestedUnsupported };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { driverId } = await params;
  const { season } = parseSeason((await searchParams).season);
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

export default async function DriverProfilePage({ params, searchParams }: PageProps) {
  const { driverId } = await params;
  const { season, requestedUnsupported } = parseSeason((await searchParams).season);

  const [profile, seasons, career] = await Promise.all([
    getDriverProfile(driverId, season),
    getDriverSeasons(driverId),
    getDriverCareer(driverId),
  ]);

  if (!profile) notFound();
  void seasons;

  const theme = teamThemeVars(profile.constructorId, season);
  const lore = getDriverLore(profile.driverId);
  const portrait = driverIconSrc(profile.driverCode, profile.driverId, season);
  const car = carSrc(profile.constructorId, profile.constructorName);
  const teamLogo = teamIconSrc(profile.constructorName);

  const dossier = [
    { label: 'Number', value: lore?.number != null ? String(lore.number) : '—' },
    { label: 'Team', value: profile.constructorName },
    { label: 'GP Starts', value: career.seasons ? String(career.seasons) : '—' },
    { label: 'Career Wins', value: String(career.wins) },
    { label: 'Career Podiums', value: String(career.podiums) },
    { label: 'Best Finish', value: career.bestPosition != null ? `P${career.bestPosition}` : '—' },
  ];

  return (
    <main id="main-content" style={theme as React.CSSProperties} className="mx-auto w-full max-w-[var(--container-max)] flex-1 bg-bg px-5 py-8 md:px-8 lg:px-16 lg:py-12">
      <PageThemeSync vars={theme} />
      {requestedUnsupported ? (
        <p className="label-caps mb-4 rounded-[var(--radius-md)] border border-accent/30 bg-accent/10 px-4 py-2 text-accent">
          Only the {season} season is available right now — showing current data instead.
        </p>
      ) : null}
      <ProfileHero
        kicker={`${profile.constructorName} · ${season}`}
        title={profile.driverName}
        meta={`P${profile.position} · ${profile.points} PTS`}
        bigNumber={lore?.number != null ? String(lore.number) : null}
        imageSrc={portrait}
        imageAlt={profile.driverName}
        imageKind="portrait"
      />

      <div className="mt-6">
        <BentoGrid>
          <BentoCard span={4} className="flex min-h-40 flex-col justify-center">
            <StatTrio
              items={[
                { value: profile.wins, label: 'Wins' },
                { value: profile.podiums, label: 'Podiums' },
                { value: career.championships, label: 'Titles' },
              ]}
            />
          </BentoCard>

          <BentoCard span={4} className="flex min-h-40 flex-col justify-center">
            <StatBlock value={`P${profile.position}`} label="Season Standing" sublabel={`${profile.points} PTS`} size="md" accent />
          </BentoCard>

          <BentoCard span={4} className="flex min-h-40 flex-col justify-center">
            <StatBlock value={career.points} label="Career Points" size="md" />
          </BentoCard>

          <BentoCard span={6}>
            <span className="label-caps mb-3 block text-text-mid">Technical Dossier</span>
            <TechnicalDossier entries={dossier} />
          </BentoCard>

          <BentoCard span={6}>
            <span className="label-caps mb-3 block text-text-mid">Career</span>
            <TechnicalDossier
              entries={[
                { label: 'Seasons', value: String(career.seasons) },
                { label: 'Championships', value: String(career.championships) },
                { label: 'Wins', value: String(career.wins) },
                { label: 'Podiums', value: String(career.podiums) },
              ]}
            />
          </BentoCard>

          {/* 2026 Car — the team machine, a full-width cinematic strip */}
          {car ? (
            <BentoCard span={12} as="div" className="relative flex min-h-48 items-center overflow-hidden">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{ background: 'radial-gradient(120% 120% at 80% 50%, var(--team-secondary), transparent 60%)' }}
              />
              <div className="relative z-10 flex flex-col gap-2">
                {teamLogo ? (
                  <Image src={teamLogo} alt={profile.constructorName} width={48} height={48} className="object-contain" />
                ) : null}
                <span className="label-caps text-text-mid">{season} Machinery</span>
                <span className="font-condensed text-3xl font-700 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                  {profile.constructorName}
                </span>
              </div>
              <Image
                src={car}
                alt={`${profile.constructorName} ${season} car`}
                width={640}
                height={220}
                className="pointer-events-none absolute bottom-0 right-0 w-[58%] object-contain md:w-[55%]"
              />
            </BentoCard>
          ) : null}
        </BentoGrid>
      </div>
    </main>
  );
}
