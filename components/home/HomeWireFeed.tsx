'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import type { NewsItem } from '@/lib/data/types';
import { localizedNewsTitle } from '@/lib/news/i18n';
import { detectTeamTag, formatWireTime, hasRealImage } from '@/lib/news/categories';
import { resolveTeamUiColor } from '@/config/team-colors';
import { HOME_NEWS_COUNT } from '@/lib/home/homeLayout';

function WireThumbnail({
  src,
  teamColor,
}: {
  src?: string | null;
  teamColor?: string;
}) {
  const [error, setError] = useState(false);
  const showImage = Boolean(src) && src !== '/placeholder.svg' && !error;

  return (
    <div
      className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-white/[0.08] bg-white/[0.02] shadow-sm transition-colors duration-150 group-hover:border-white/20"
      style={
        teamColor
          ? {
              background: `radial-gradient(circle at center, color-mix(in srgb, ${teamColor} 16%, transparent), transparent 85%)`,
            }
          : undefined
      }
    >
      {showImage ? (
        <Image
          src={src as string}
          alt=""
          fill
          unoptimized
          sizes="64px"
          loading="lazy"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          onError={() => setError(true)}
        />
      ) : (
        <svg
          className="h-4 w-4 text-text-low/70 transition-colors duration-150 group-hover:text-text-hi"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 0 0 6-6M6 12.75a6 6 0 0 0 6 6"
          />
        </svg>
      )}
    </div>
  );
}

export function HomeWireFeed({ items, season }: { items: NewsItem[]; season?: number }) {
  const locale = useLocale();
  const tNav = useTranslations('nav');
  const feed = items.slice(0, HOME_NEWS_COUNT);

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header with live pulse indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <h2 className="label-caps tracking-wider text-text-mid font-mono">
            {tNav('news')}
          </h2>
        </div>
        <Link
          href="/news"
          className="group/link inline-flex items-center gap-1 font-mono text-xs font-semibold uppercase tracking-wider text-text-mid transition-colors duration-150 hover:text-white active:scale-95"
        >
          <span>{locale === 'tr' ? 'Tüm Haberler' : 'All News'}</span>
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-150 ease-out group-hover/link:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>

      {feed.length === 0 ? (
        <p className="body-md text-text-mid font-mono">
          {locale === 'tr' ? 'Şu anda yeni haber yok.' : 'No news right now.'}
        </p>
      ) : (
        <ul className="flex flex-1 flex-col divide-y divide-hairline/60">
          {feed.map((item) => {
            const title = localizedNewsTitle(item, locale);
            const team = detectTeamTag(item.title, item.summary);
            const teamColor = team ? resolveTeamUiColor(undefined, team, season) : undefined;
            const thumb = hasRealImage(item) ? item.image : null;
            const rawTime = formatWireTime(item.publishedTs).replace(' UTC', '');

            return (
              <li key={item.id} className="flex flex-1 items-center">
                <Link
                  href={`/news/${item.id}`}
                  className="group flex w-full items-center gap-4 rounded-[var(--radius-chip)] px-2 py-3 transition-all duration-150 ease-out hover:bg-white/[0.03] active:scale-[0.99]"
                >
                  <WireThumbnail src={thumb} teamColor={teamColor} />

                  <div className="min-w-0 flex-1">
                    {/* Sleek Apple-style metadata chips */}
                    <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-text-low">
                      <span className="tabular-nums text-text-mid/90 font-medium">
                        {rawTime}
                      </span>
                      <span className="text-white/20">·</span>
                      {team ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 font-bold tracking-widest text-[10px]"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${teamColor} 14%, transparent)`,
                            color: teamColor,
                          }}
                        >
                          <span
                            className="h-1 w-1 rounded-full"
                            style={{ backgroundColor: teamColor }}
                          />
                          {team}
                        </span>
                      ) : (
                        <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-text-mid">
                          {item.sourceName.toUpperCase().slice(0, 12)}
                        </span>
                      )}
                    </div>

                    {/* Headline */}
                    <span className="mt-1.5 line-clamp-3 block text-[15px] font-medium leading-snug text-text-hi transition-colors duration-150 group-hover:text-white break-words">
                      {title}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
