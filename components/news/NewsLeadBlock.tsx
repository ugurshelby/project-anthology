import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { ApexImage } from '@/components/media/ApexImage';
import type { NewsItem } from '@/lib/data/types';
import { localizedNewsTitle, localizedNewsSummary } from '@/lib/news/i18n';
import { estimateReadMinutes } from '@/lib/news/categories';
import { hasRealImage } from '@/lib/news/categories';
import { NewsImageFallback } from '@/components/news/NewsImageFallback';

function SecondaryStory({ item }: { item: NewsItem }) {
  const locale = useLocale();
  const hasImage = hasRealImage(item);
  const title = localizedNewsTitle(item, locale);

  return (
    <Link
      href={`/news/${item.id}`}
      className="group relative flex min-h-[200px] flex-1 flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-4 md:min-h-0"
    >
      {hasImage ? (
        <ApexImage
          src={item.image}
          alt=""
          fill
          kind="media"
          sizes="(max-width: 1024px) 92vw, 33vw"
          loading="lazy"
          className="object-cover opacity-55 transition-opacity duration-200 group-hover:opacity-70"
        />
      ) : (
        <NewsImageFallback />
      )}
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/75 to-transparent" />
      <div className="relative z-10 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="data-tabular text-xs uppercase tracking-wider text-text-mid">
            {item.dateLabel} · {item.sourceName}
          </span>
          {item.sources && item.sources.length > 1 ? (
            <span className="label-caps rounded-full border border-white/10 bg-white/5 px-1.5 py-0.2 text-[9px] font-mono text-text-mid">
              {item.sources.length} {locale === 'tr' ? 'kaynak' : 'sources'}
            </span>
          ) : null}
        </div>
        <span
          className="line-clamp-3 font-condensed text-lg font-700 uppercase leading-tight text-text-hi"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {title}
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
  const locale = useLocale();
  const leadTitle = localizedNewsTitle(lead, locale);
  const leadSummary = localizedNewsSummary(lead, locale);
  const readMins = estimateReadMinutes(leadSummary, leadTitle);
  const leadHasImage = hasRealImage(lead);
  const side = secondary.slice(0, 2);
  const leadSourcesCount = lead.sources?.length || lead.sourceLinks?.length || 1;

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5 lg:min-h-[420px]">
      <Link
        href={`/news/${lead.id}`}
        className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-5 sm:min-h-[340px] md:p-8 lg:col-span-8 lg:min-h-[420px]"
      >
        {leadHasImage ? (
          <ApexImage
            src={lead.image}
            alt=""
            fill
            priority
            kind="media"
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover opacity-60 transition-opacity duration-300 group-hover:opacity-75"
          />
        ) : (
          <NewsImageFallback />
        )}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-transparent" />
        <div className="relative z-10 flex max-w-2xl flex-col gap-2 md:gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-caps text-accent">
              {locale === 'tr' ? 'Öne Çıkan Haber' : 'Featured Story'}
            </span>
            {leadSourcesCount > 1 ? (
              <span className="label-caps rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-text-mid">
                {leadSourcesCount} {locale === 'tr' ? 'Kaynak' : 'Sources'}
              </span>
            ) : null}
          </div>
          <h2
            className="line-clamp-3 font-condensed text-2xl font-700 uppercase leading-tight text-text-hi md:text-4xl md:leading-[1.05]"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {leadTitle}
          </h2>
          {leadSummary ? (
            <p className="line-clamp-2 max-w-xl body-md text-text-mid">{leadSummary}</p>
          ) : null}
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="data-tabular text-xs text-text-mid">
              {readMins} MIN READ
            </span>
            <span className="text-text-low">·</span>
            <span className="data-tabular text-xs text-text-mid">
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
