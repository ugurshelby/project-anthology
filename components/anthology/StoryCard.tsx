import Link from 'next/link';
import Image from 'next/image';
import type { Story } from '@/lib/data/stories';
import { truncateToWord } from '@/lib/text/truncateToWord';

/** Anthology hub story card — hero image, condensed title, category/year mono. */
export function StoryCard({ story, wide = false }: { story: Story; wide?: boolean }) {
  return (
    <Link
      href={`/anthology/${story.slug}`}
      className={[
        'group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-6',
        wide ? 'md:min-h-72' : '',
      ].join(' ')}
    >
      <Image
        src={story.heroImage}
        alt=""
        fill
        sizes={wide ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
        className="object-cover opacity-45 transition-opacity duration-150 group-hover:opacity-60"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
      <div className="relative z-10 flex flex-col gap-1">
        <span className="label-caps text-text-mid">
          {story.category}
          {story.year ? ` · ${story.year}` : ''}
        </span>
        <h3 className={[wide ? 'headline-lg' : 'headline-md', 'uppercase text-text-hi'].join(' ')}>
          {story.title}
        </h3>
        {story.subtitle ? (
          <p className="body-md mt-1 line-clamp-2 text-text-mid">
            {truncateToWord(story.subtitle, wide ? 160 : 100)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
