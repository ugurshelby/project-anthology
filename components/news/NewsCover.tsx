'use client';

import { useTranslations } from 'next-intl';
import { ApexImage } from '@/components/media/ApexImage';
import { MediaAssetView } from '@/components/media/MediaAssetView';
import type { NewsItem } from '@/lib/data/types';
import { hasRealImage } from '@/lib/news/categories';

function ArchiveCover({
  item,
  sizes,
  className,
  showLabel,
  showCredit,
}: {
  item: NewsItem;
  sizes: string;
  className: string;
  showLabel: boolean;
  showCredit: boolean;
}) {
  const t = useTranslations('ui.news');
  const media = item.fallbackMedia;
  if (!media) return null;
  return (
    <>
      <MediaAssetView
        type={media.type}
        entityKey={media.key}
        initialResult={media.result}
        alt=""
        sizes={sizes}
        className={`h-full w-full ${className}`}
        showAttribution={showCredit}
      />
      {showLabel ? (
        <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full border border-white/15 bg-black/70 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-text-hi">
          {t('archiveImage')}
        </span>
      ) : null}
    </>
  );
}

/**
 * News cover inside a positioned, sized box: the publisher photo; when it is missing or fails
 * to load, the licensed archive image of the story's driver, team car or circuit with an
 * "Archive image" label and its credit (8.10); otherwise nothing (never the APEX wireframe).
 */
export function NewsCover({
  item,
  sizes,
  className = 'object-cover',
  priority = false,
  showLabel = true,
  showCredit = true,
}: {
  item: NewsItem;
  sizes: string;
  className?: string;
  priority?: boolean;
  showLabel?: boolean;
  showCredit?: boolean;
}) {
  const archive = item.fallbackMedia ? (
    <ArchiveCover item={item} sizes={sizes} className={className} showLabel={showLabel} showCredit={showCredit} />
  ) : null;
  if (!hasRealImage(item)) return archive;
  return (
    <ApexImage
      src={item.image}
      alt=""
      fill
      kind="media"
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      className={className}
      fallback={archive}
    />
  );
}
