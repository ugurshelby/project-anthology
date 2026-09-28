'use client';

import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import type { Story } from '@/lib/data/stories';
import { truncateToWord } from '@/lib/text/truncateToWord';
import { ApexImage } from '@/components/media/ApexImage';

export function HomeAnthologyCard({ story }: { story: Story }) {
  const locale = useLocale();
  const isTr = locale === 'tr';
  const title = isTr && story.titleTr ? story.titleTr : story.title;
  const subtitle = isTr && story.subtitleTr ? story.subtitleTr : story.subtitle;

  return (
    <Link
      href={`/anthology/${story.slug}`}
      className="group relative flex h-full min-h-[340px] flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-surface shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7)] transition-all duration-300 ease-out hover:border-white/20 active:scale-[0.98]"
    >
      {/* Background Image with Apple-grade smooth zoom */}
      <ApexImage
        src={story.heroImage}
        alt=""
        fill
        kind="media"
        sizes="(max-width: 1024px) 85vw, 33vw"
        className="object-cover opacity-55 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-70"
      />

      {/* Top ambient vignette */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent"
      />

      {/* Bottom deep gradient for immaculate text contrast */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/80 via-45% to-transparent"
      />

      {/* Top Floating Glass Badge */}
      <div className="relative z-10 flex items-center justify-between p-4 sm:p-5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white shadow-sm backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {isTr ? 'Antoloji' : 'Anthology'}{story.year ? ` · ${story.year}` : ''}
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.08] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-hi/80 backdrop-blur-sm">
          {isTr ? 'Derin Okuma' : 'Long Read'}
        </span>
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 flex flex-col gap-2 p-5 sm:p-6">
        <h2
          className="font-condensed text-2xl font-700 uppercase italic leading-tight tracking-tight text-white transition-colors duration-200 group-hover:text-accent sm:text-3xl"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {title}
        </h2>

        {subtitle ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-text-mid/90">
            {truncateToWord(subtitle, 140)}
          </p>
        ) : null}

        <div className="mt-1 flex items-center gap-1 font-mono text-xs font-semibold uppercase tracking-wider text-accent transition-colors duration-150 group-hover:text-white">
          <span>{isTr ? 'Hikâyeyi Oku' : 'Read Story'}</span>
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
