import Link from 'next/link';
import Image from 'next/image';
import type { Story } from '@/lib/data/stories';
import { truncateToWord } from '@/lib/text/truncateToWord';

export function HomeAnthologyCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/anthology/${story.slug}`}
      className="group relative flex h-full min-h-[320px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)]"
    >
      <Image
        src={story.heroImage}
        alt=""
        fill
        sizes="(max-width: 1024px) 85vw, 33vw"
        className="object-cover opacity-50 transition-opacity duration-200 group-hover:opacity-65"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
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
          <p className="line-clamp-3 body-md text-zinc-400">{truncateToWord(story.subtitle, 140)}</p>
        ) : null}
      </div>
    </Link>
  );
}
