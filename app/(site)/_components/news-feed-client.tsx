'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { NewsItem } from '@/lib/data/news';
import {
  getSmartFeaturedUrl,
  getSmartGridUrl,
  getSmartMobileUrl,
} from '@/lib/smartImage';

interface NewsFeedClientProps {
  initialItems: NewsItem[];
}

interface ApiNewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  sourceName: string;
  sources?: string[];
  image: string;
  publishedAt: string;
  publishedTs: number;
  dateLabel?: string;
}

function normalizeApiItem(item: ApiNewsItem): NewsItem {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    url: item.url,
    sourceName: item.sourceName,
    sources: item.sources?.length ? item.sources : [item.sourceName],
    image: item.image || '/favicon.svg',
    publishedAt: item.publishedAt,
    publishedTs: item.publishedTs || Date.parse(item.publishedAt) || 0,
    dateLabel: item.dateLabel ?? '',
  };
}

function hasImage(url: string | null | undefined): boolean {
  return Boolean(url && url.trim());
}

interface NewsCardMediaProps {
  src: string;
  alt: string;
  sizes: string;
}

function NewsCardMedia({ src, alt, sizes }: NewsCardMediaProps) {
  if (!hasImage(src)) {
    return (
      <div className="card-image-wrap news-image-fallback" aria-hidden>
        <span className="news-image-fallback-icon" />
      </div>
    );
  }

  return (
    <div className="card-image-wrap">
      <Image src={src} alt={alt} fill sizes={sizes} />
    </div>
  );
}

export function NewsFeedClient({ initialItems }: NewsFeedClientProps) {
  const [items, setItems] = useState<NewsItem[]>(initialItems);
  const [activeItem, setActiveItem] = useState<NewsItem | null>(null);
  const [summaryByUrl, setSummaryByUrl] = useState<Record<string, string | null>>({});
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let active = true;
    const sync = async (): Promise<void> => {
      try {
        const response = await fetch('/api/news', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as ApiNewsItem[];
        if (!active || !Array.isArray(payload) || payload.length === 0) return;
        setItems(payload.map(normalizeApiItem).sort((a, b) => b.publishedTs - a.publishedTs));
      } catch {
        // Keep existing server data when polling fails.
      }
    };

    const timer = window.setInterval(sync, 5 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 768px)');
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!activeItem) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveItem(null);
    };
    document.addEventListener('keydown', onEscape);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEscape);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeItem]);

  const fetchSummaryForItem = async (item: NewsItem): Promise<void> => {
    if (Object.prototype.hasOwnProperty.call(summaryByUrl, item.url)) return;

    setLoadingUrl(item.url);
    try {
      const response = await fetch('/api/news/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: item.url,
          title: item.title,
          description: item.summary,
        }),
      });

      if (!response.ok) throw new Error('summary request failed');

      const payload = (await response.json()) as { summary?: unknown };
      const summary =
        typeof payload.summary === 'string' && payload.summary.trim()
          ? payload.summary.trim()
          : null;

      setSummaryByUrl((prev) => ({ ...prev, [item.url]: summary }));
    } catch {
      setSummaryByUrl((prev) => ({ ...prev, [item.url]: null }));
    } finally {
      setLoadingUrl((prev) => (prev === item.url ? null : prev));
    }
  };

  const openStory = (item: NewsItem): void => {
    setActiveItem(item);
    void fetchSummaryForItem(item);
  };

  const featured = items[0];
  const remaining = useMemo(() => items.slice(1), [items]);

  if (!featured) {
    return <p style={{ color: 'var(--text-muted)' }}>No news available.</p>;
  }

  const activeSummaryReady =
    activeItem !== null && Object.prototype.hasOwnProperty.call(summaryByUrl, activeItem.url);
  const activeSummary =
    activeItem && activeSummaryReady
      ? (summaryByUrl[activeItem.url] ?? activeItem.summary)
      : activeItem?.summary ?? '';

  return (
    <>
      <article className="card">
        <button
          type="button"
          onClick={() => openStory(featured)}
          style={{ all: 'unset', display: 'block', width: '100%', cursor: 'pointer' }}
          aria-label={`Open summary for ${featured.title}`}
        >
          <NewsCardMedia
            src={getSmartFeaturedUrl(featured.image)}
            alt={featured.title}
            sizes="(max-width: 768px) 100vw, 70vw"
          />
          <div className="card-body">
            <p className="card-kicker">Featured / {featured.sourceName}</p>
            <h3 className="card-title">{featured.title}</h3>
            <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
              {featured.dateLabel || new Date(featured.publishedAt).toLocaleDateString('en-GB')}
            </p>
          </div>
        </button>
      </article>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {remaining.map((item) => (
          <article key={item.id} className="card">
            <button
              type="button"
              onClick={() => openStory(item)}
              style={{ all: 'unset', display: 'block', width: '100%', cursor: 'pointer' }}
              aria-label={`Open summary for ${item.title}`}
            >
              <NewsCardMedia
                src={isMobile ? getSmartMobileUrl(item.image) : getSmartGridUrl(item.image)}
                alt={item.title}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="card-body">
                <p className="card-kicker">News / {item.sourceName}</p>
                <h3 className="card-title">{item.title}</h3>
                {item.dateLabel ? (
                  <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
                    {item.dateLabel}
                  </p>
                ) : null}
              </div>
            </button>
          </article>
        ))}
      </div>

      {activeItem ? (
        <div className="news-summary-overlay" onClick={() => setActiveItem(null)} role="presentation">
          <article
            className="news-summary-panel"
            role="dialog"
            aria-modal="true"
            aria-label="News summary panel"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="news-summary-close"
              onClick={() => setActiveItem(null)}
              aria-label="Close summary panel"
            >
              ×
            </button>
            <NewsCardMedia
              src={getSmartMobileUrl(activeItem.image)}
              alt={activeItem.title}
              sizes="(max-width: 768px) 100vw, 420px"
            />
            <div className="news-summary-body">
              <p className="card-kicker">
                {activeItem.sourceName} /{' '}
                {activeItem.dateLabel || new Date(activeItem.publishedAt).toLocaleDateString('en-GB')}
              </p>
              <h3 className="card-title">{activeItem.title}</h3>
              {loadingUrl === activeItem.url ? (
                <div className="news-summary-skeleton" aria-hidden>
                  <div className="news-summary-skeleton-line shimmer" />
                  <div className="news-summary-skeleton-line shimmer" />
                  <div className="news-summary-skeleton-line shimmer" />
                </div>
              ) : (
                <p className="news-summary-text">{activeSummary}</p>
              )}
              <a
                href={activeItem.url}
                target="_blank"
                rel="noreferrer"
                className="news-summary-ghost-link"
              >
                READ FULL STORY →
              </a>
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}
