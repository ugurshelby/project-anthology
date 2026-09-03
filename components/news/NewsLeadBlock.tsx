import Link from 'next/link';
import Image from 'next/image';
import type { NewsItem } from '@/lib/data/types';
import { estimateReadMinutes } from '@/lib/news/categories';
import { hasRealImage } from '@/lib/news/categories';
import { NewsImageFallback } from '@/components/news/NewsImageFallback';

function SecondaryStory({ item }: { item: NewsItem }) {
  const hasImage = hasRealImage(item);
  return (
    <Link
      href={`/news/${item.id}`}
      className="group relative flex min-h-[200px] flex-1 flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-4 md:min-h-0"
    >
      {hasImage ? (
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 92vw, 33vw"
          loading="lazy"
          className="object-cover opacity-55 transition-opacity duration-200 group-hover:opacity-70"
        />
      ) : (
        <NewsImageFallback />
      )}
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/75 to-transparent" />
      <div className="relative z-10 flex flex-col gap-1.5">
        <span className="data-tabular text-[10px] uppercase tracking-wider text-zinc-400">
          {item.dateLabel} · {item.sourceName}
        </span>
        <span
          className="line-clamp-3 font-condensed text-lg font-700 uppercase leading-tight text-text-hi"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {item.title}
        </span>
      </div>
    </Link>
  );
}

/**
 * Asymmetric 1+2 lead block — cinematic featured story (2/3) + stacked
 * secondary focus cards (1/3). Magazine masthead for /news.
 */
export function NewsLeadBlock({
  lead,
  secondary,
}: {
  lead: NewsItem;
  secondary: NewsItem[];
}) {
  const readMins = estimateReadMinutes(lead.summary, lead.title);
  const leadHasImage = hasRealImage(lead);
  const side = secondary.slice(0, 2);

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5 lg:min-h-[420px]">
      <Link
        href={`/news/${lead.id}`}
        className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-5 sm:min-h-[340px] md:p-8 lg:col-span-8 lg:min-h-[420px]"
      >
        {leadHasImage ? (
          <Image
            src={lead.image}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover opacity-60 transition-opacity duration-300 group-hover:opacity-75"
          />
        ) : (
          <NewsImageFallback />
        )}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-transparent" />
        <div className="relative z-10 flex max-w-2xl flex-col gap-2 md:gap-3">
          <span className="label-caps text-accent">Featured Story</span>
          <h2
            className="line-clamp-3 font-condensed text-2xl font-700 uppercase leading-tight text-text-hi md:text-4xl md:leading-[1.05]"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {lead.title}
          </h2>
          {lead.summary ? (
            <p className="line-clamp-2 max-w-xl body-md text-text-mid">{lead.summary}</p>
          ) : null}
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="data-tabular text-xs text-zinc-400">
              {readMins} MIN READ
            </span>
            <span className="text-zinc-600">·</span>
            <span className="data-tabular text-xs text-zinc-400">
              {lead.dateLabel} · {lead.sourceName}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex flex-col gap-4 lg:col-span-4 lg:gap-5">
        {side.map((item) => (
          <SecondaryStory key={item.id} item={item} />
        ))}
        {side.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-hairline p-6 text-center body-md text-text-low">
            More dispatches loading…
          </div>
        ) : null}
      </div>
    </section>
  );
}
