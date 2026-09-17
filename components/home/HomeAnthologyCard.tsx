import Link from 'next/link';
import type { Story } from '@/lib/data/stories';
import { truncateToWord } from '@/lib/text/truncateToWord';
import { ApexImage } from '@/components/media/ApexImage';

export function HomeAnthologyCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/anthology/${story.slug}`}
      className="group relative flex h-full min-h-[320px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)]"
    >
      <ApexImage
        src={story.heroImage}
        alt=""
        fill
        kind="media"
        sizes="(max-width: 1024px) 85vw, 33vw"
        className="object-cover opacity-60 transition-opacity duration-200 group-hover:opacity-75"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-bg from-30% via-bg/85 via-60% to-transparent"
      />
      <div className="relative z-10 flex flex-col gap-2 p-5">
        <span className="label-caps text-accent">
          Anthology{story.year ? ` · ${story.year}` : ''}
        </span>
        <h2
          className="font-condensed text-2xl font-700 uppercase italic leading-tight text-text-hi"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {story.title}
        </h2>
        {story.subtitle ? (
          <p className="line-clamp-2 body-md text-text-mid">{truncateToWord(story.subtitle, 140)}</p>
        ) : null}
      </div>
    </Link>
  );
}
