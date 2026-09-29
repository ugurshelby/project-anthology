import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import type { Story } from '@/lib/data/stories';
import { truncateToWord } from '@/lib/text/truncateToWord';
import { ApexImage } from '@/components/media/ApexImage';

/** Anthology hub story card — hero image, condensed title, category/year mono. */
export function StoryCard({ story, wide = false }: { story: Story; wide?: boolean }) {
  const locale = useLocale();
  const isTr = locale === 'tr';
  const title = isTr && story.titleTr ? story.titleTr : story.title;
  const subtitle = isTr && story.subtitleTr ? story.subtitleTr : story.subtitle;

  return (
    <Link
      href={`/anthology/${story.slug}`}
      className={[
        'group relative flex min-h-[280px] sm:min-h-[320px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out hover:border-white/20 active:scale-[0.99]',
        wide ? 'md:min-h-[360px]' : '',
      ].join(' ')}
    >
      <ApexImage
        src={story.heroImage}
        alt=""
        fill
        kind="media"
        sizes={wide ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
        className="object-cover opacity-80 transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-95"
      />
      {/* Top subtle vignette */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent"
      />
      {/* Bottom gradient protecting typography */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/70 via-40% to-transparent"
      />
      <div className="relative z-10 flex flex-col gap-1.5">
        <span className="label-caps flex items-center gap-1.5 text-text-mid">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {story.category}
          {story.year ? ` · ${story.year}` : ''}
        </span>
        <h3 className={[wide ? 'headline-lg' : 'headline-md', 'uppercase text-text-hi transition-colors duration-200 group-hover:text-white'].join(' ')}>
          {title}
        </h3>
        {subtitle ? (
          <p className="body-md mt-0.5 line-clamp-2 text-text-mid/90">
            {truncateToWord(subtitle, wide ? 160 : 100)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
