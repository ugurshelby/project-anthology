import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { ApexImage } from '@/components/media/ApexImage';
import type { NewsItem } from '@/lib/data/types';
import { localizedNewsTitle, localizedNewsSummary } from '@/lib/news/i18n';
import { hasRealImage, estimateReadMinutes } from '@/lib/news/categories';

/**
 * A single wire item — cover image when available, else a clean editorial row without placeholder noise.
 * Links to our own /news/[id] detail page rather than the external source.
 */
export function WireItem({ item }: { item: NewsItem }) {
  const locale = useLocale();
  const hasImage = hasRealImage(item);
  const title = localizedNewsTitle(item, locale);

  return (
    <Link
      href={`/news/${item.id}`}
      className="group flex flex-col gap-2 border-b border-hairline py-3.5 last:border-b-0 md:flex-row md:items-center md:gap-4 transition-colors hover:bg-white/[0.02] px-2 rounded-[var(--radius-chip)]"
    >
      {hasImage ? (
        <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-[var(--radius-chip)] md:h-16 md:w-24 bg-surface">
          <ApexImage
            src={item.image}
            alt=""
            fill
            kind="media"
            sizes="(max-width: 768px) 400px, 96px"
            loading="lazy"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="hidden md:flex h-16 w-1.5 shrink-0 rounded-full bg-hairline group-hover:bg-accent transition-colors" />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="data-tabular text-xs uppercase tracking-wider text-text-mid font-mono">
            {item.dateLabel} · {item.sourceName}
          </span>
          {item.sources && item.sources.length > 1 ? (
            <span className="label-caps rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-text-mid">
              {item.sources.length} {locale === 'tr' ? 'kaynak' : 'sources'}
            </span>
          ) : null}
        </div>
        <span
          className="line-clamp-2 font-condensed text-lg font-700 leading-tight text-text transition-colors group-hover:text-text-hi break-words"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {title}
        </span>
      </div>
    </Link>
  );
}

/** "THE WIRE" list. Prefer real covers; keep imageless rows cleanly styled without fake graphics. */
export function NewsList({ items, heading }: { items: NewsItem[]; heading?: string }) {
  const locale = useLocale();
  const defaultHeading = locale === 'tr' ? 'TELGRAF AKIŞI' : 'THE WIRE';
  const label = heading ?? defaultHeading;

  return (
    <div className="flex flex-col gap-2">
      <span className="label-caps text-text-mid font-mono">{label}</span>
      {items.length === 0 ? (
        <p className="body-md py-4 text-text-mid">
          {locale === 'tr' ? 'Şu anda gösterilecek haber bulunmuyor.' : 'No headlines available right now.'}
        </p>
      ) : (
        <div className="flex flex-col">
          {items.map((item) => (
            <WireItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

/** @deprecated Prefer NewsLeadBlock on /news — kept for any residual callers. */
export function NewsHero({ item }: { item: NewsItem }) {
  const locale = useLocale();
  const hasImage = hasRealImage(item);
  const title = localizedNewsTitle(item, locale);

  return (
    <Link
      href={`/news/${item.id}`}
      className={`group relative flex min-h-64 flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-hairline p-6 md:p-8 transition-colors ${
        hasImage ? 'bg-surface' : 'bg-surface-raised border-l-4 border-l-accent'
      }`}
    >
      {hasImage ? (
        <>
          <ApexImage
            src={item.image}
            alt=""
            fill
            kind="media"
            sizes="(max-width: 768px) 100vw, 768px"
            loading="lazy"
            className="object-cover opacity-50 transition-opacity group-hover:opacity-60"
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        </>
      ) : null}
      <div className="relative z-10 flex flex-col gap-2">
        <span className="data-tabular text-xs uppercase tracking-wider text-text-mid font-mono">
          {item.dateLabel} · {item.sourceName}
        </span>
        <h2 className="headline-lg line-clamp-3 text-text-hi break-words">{title}</h2>
      </div>
    </Link>
  );
}

/** Grid card for the /news listing — desktop 3-col grid item, mobile full-width stack. */
export function NewsCard({ item }: { item: NewsItem }) {
  const locale = useLocale();
  const hasImage = hasRealImage(item);
  const title = localizedNewsTitle(item, locale);
  const summary = localizedNewsSummary(item, locale);
  const readMins = estimateReadMinutes(summary, title);

  if (hasImage) {
    return (
      <Link
        href={`/news/${item.id}`}
        className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-5 transition-all duration-200 hover:border-white/20"
      >
        <ApexImage
          src={item.image}
          alt=""
          fill
          kind="media"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          loading="lazy"
          className="object-cover opacity-60 transition-all duration-300 group-hover:scale-[1.02] group-hover:opacity-75"
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-transparent" />
        <div className="relative z-10 flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="data-tabular text-xs uppercase tracking-wider text-text-mid font-mono">
              {item.dateLabel} · {item.sourceName}
            </span>
            {item.sources && item.sources.length > 1 ? (
              <span className="label-caps rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-text-mid">
                {item.sources.length} {locale === 'tr' ? 'kaynak' : 'sources'}
              </span>
            ) : null}
          </div>
          <span
            className="line-clamp-3 font-condensed text-xl font-700 uppercase leading-tight text-text-hi group-hover:text-white break-words"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {title}
          </span>
        </div>
      </Link>
    );
  }

  // Pure editorial card when no cover image exists — NO fake placeholder images produced.
  return (
    <Link
      href={`/news/${item.id}`}
      className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border border-hairline border-l-2 border-l-accent/80 bg-surface/80 p-5 transition-all duration-200 hover:border-white/20 hover:border-l-accent hover:bg-surface-raised"
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <span className="data-tabular text-xs uppercase tracking-wider text-text-mid font-mono">
            {item.dateLabel} · {item.sourceName}
          </span>
          {item.sources && item.sources.length > 1 ? (
            <span className="label-caps rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-text-mid">
              {item.sources.length} {locale === 'tr' ? 'kaynak' : 'sources'}
            </span>
          ) : null}
        </div>
        <span
          className="line-clamp-3 font-condensed text-xl font-700 uppercase leading-tight text-text-hi group-hover:text-white break-words"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {title}
        </span>
        {summary ? (
          <p className="line-clamp-3 text-xs leading-relaxed text-text-mid font-normal">
            {summary}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-hairline/60 pt-2.5 text-[11px] text-text-low font-mono">
        <span>{readMins} MIN READ</span>
        <span className="text-text-mid transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white">
          ↗
        </span>
      </div>
    </Link>
  );
}
