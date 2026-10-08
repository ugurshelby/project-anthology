'use client';

import { useState, useEffect, useId } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { MediaEntityType } from '@/lib/media/types';
import type { MediaResult } from '@/lib/media/read';
import { loadMedia, peekMedia } from '@/lib/media/client';
import { CircuitPlaceholder } from './placeholders/CircuitPlaceholder';
import { TeamPlaceholder } from './placeholders/TeamPlaceholder';
import { CarPlaceholder } from './placeholders/CarPlaceholder';
import { DriverPlaceholder } from './placeholders/DriverPlaceholder';

export interface MediaAssetViewProps {
  type: MediaEntityType;
  entityKey: string;
  initialResult?: MediaResult | null;
  alt: string;
  name?: string;
  teamColor?: string;
  /** Second livery colour for the car placeholder (two-tone). */
  teamAccent?: string;
  driverNumber?: number | string;
  driverCode?: string;
  season?: number | string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  aspectRatio?: string;
  showAttribution?: boolean;
}

/**
 * Universal Media Asset Component:
 * Adheres strictly to `docs/reference/media-sistemi.md` Section 8 & 9.
 *
 * 1. Checks `status === 'image'` -> renders license-checked WebP with srcSet, blurDataURL, and dominantColor.
 * 2. While the lookup is still pending (no server result), shows a neutral surface, never the SVG:
 *    the placeholder appears only once we know there is no image, or the image fails to load.
 * 3. Never queries Wikimedia directly; only reads our DB / CDN storage (batched via lib/media/client).
 * 4. Displays verified CC-BY / Wikimedia attribution safely as plain text.
 */
export function MediaAssetView({
  type,
  entityKey,
  initialResult,
  alt,
  name,
  teamColor,
  teamAccent,
  driverNumber,
  driverCode,
  season,
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  className = '',
  aspectRatio,
  showAttribution = true,
}: MediaAssetViewProps) {
  const [fetchedResult, setFetchedResult] = useState<MediaResult | null>(() =>
    initialResult ? null : (peekMedia(type, entityKey) ?? null),
  );
  const [imageError, setImageError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const t = useTranslations('ui.media');
  const infoId = useId();

  // A result fetched for an earlier key never stands in for the current one.
  const current = fetchedResult && fetchedResult.key === entityKey.toLowerCase() ? fetchedResult : null;
  const result = initialResult ?? current;

  // No server result: ask /api/media (batched and cached per page).
  useEffect(() => {
    if (initialResult) return;
    let cancelled = false;
    void loadMedia(type, entityKey).then((loaded) => {
      if (!cancelled) setFetchedResult(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [type, entityKey, initialResult]);

  // Render SVG Placeholder helper
  const renderPlaceholder = () => {
    switch (type) {
      case 'circuit':
        return <CircuitPlaceholder seed={entityKey} name={name} className="h-full w-full" />;
      case 'team':
        return <TeamPlaceholder seed={entityKey} name={name} teamColor={teamColor} className="h-full w-full" />;
      case 'car':
        return (
          <CarPlaceholder
            seed={entityKey}
            name={name}
            teamColor={teamColor}
            accentColor={teamAccent}
            season={season}
            className="h-full w-full"
          />
        );
      case 'driver':
      default:
        return (
          <DriverPlaceholder
            seed={entityKey}
            name={name}
            driverCode={driverCode}
            driverNumber={driverNumber}
            teamColor={teamColor}
            className="h-full w-full"
          />
        );
    }
  };

  // Lookup still pending: a quiet neutral surface, so the SVG never flashes before a real photo.
  if (!result) {
    return (
      <div
        aria-busy="true"
        aria-label={alt}
        role="img"
        className={`relative overflow-hidden rounded-[var(--radius-md)] bg-surface-raised motion-safe:animate-pulse ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
      />
    );
  }

  // No licensed image (or it failed to load): the type-specific SVG placeholder.
  if (result.status !== 'image' || imageError) {
    return (
      <div
        className={`relative overflow-hidden rounded-[var(--radius-md)] ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        {renderPlaceholder()}
      </div>
    );
  }

  const { image, attribution } = result;

  return (
    <div
      className={`group relative overflow-hidden rounded-[var(--radius-md)] ${className}`}
      style={{
        aspectRatio: aspectRatio || `${image.width} / ${image.height}`,
        backgroundColor: image.dominantColor || '#0c1017',
      }}
    >
      {/* Real Verified WebP Image */}
      <Image
        src={image.src}
        alt={alt}
        width={image.width}
        height={image.height}
        unoptimized={true}
        priority={priority}
        sizes={sizes}
        placeholder={image.blurDataURL ? 'blur' : 'empty'}
        blurDataURL={image.blurDataURL ?? undefined}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        onError={() => setImageError(true)}
      />

      {/* Attribution Overlay Badge (CC BY / CC BY-SA compliance) */}
      {showAttribution && attribution?.text ? (
        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1">
          {/* Visible credit pill */}
          <span className="hidden sm:inline-block max-w-[200px] truncate rounded-full bg-black/60 px-2 py-0.5 text-[9px] text-white/75 backdrop-blur-sm border border-white/10 font-sans">
            {attribution.text}
          </span>

          {/* Info trigger button */}
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            title={attribution.text}
            aria-label={t('licenseAria', { text: attribution.text })}
            aria-expanded={showInfo}
            aria-controls={showInfo ? infoId : undefined}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white/70 border border-white/10 transition-colors hover:bg-black/90 hover:text-white"
          >
            ⓘ
          </button>

          {/* Expanded or hover attribution popover */}
          {showInfo ? (
            <div
              id={infoId}
              className="absolute bottom-6 right-0 w-64 rounded-lg border border-white/15 bg-black/90 p-2.5 text-[11px] text-text-mid shadow-2xl backdrop-blur-md"
            >
              <span className="block font-semibold text-text-hi mb-1">
                {attribution.trademark ? t('fairUseMark') : t('verifiedLicense')}
              </span>
              <p className="text-[10px] leading-tight text-white/80">
                {attribution.text}
              </p>
              {attribution.sourceUrl ? (
                <a
                  href={attribution.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('sourceAria')}
                  className="mt-1.5 inline-block text-[10px] text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {t('source')} →
                </a>
              ) : null}
              {attribution.trademark ? (
                <span className="mt-1 block text-[9px] text-text-low italic">
                  {t('trademarkNote')}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
