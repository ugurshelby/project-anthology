'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { MediaEntityType } from '@/lib/media/types';
import type { MediaResult } from '@/lib/media/read';
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
 * 2. Fallbacks gracefully to type-specific parametric SVG placeholder if missing, pending, or on error.
 * 3. Never queries Wikimedia directly; only reads our DB / CDN storage.
 * 4. Displays verified CC-BY / Wikimedia attribution safely as plain text.
 */
export function MediaAssetView({
  type,
  entityKey,
  initialResult,
  alt,
  name,
  teamColor,
  driverNumber,
  driverCode,
  season,
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  className = '',
  aspectRatio,
  showAttribution = true,
}: MediaAssetViewProps) {
  const [fetchedResult, setFetchedResult] = useState<MediaResult | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const result = initialResult ?? fetchedResult;

  // If no initialResult provided in client render, fetch from /api/media
  useEffect(() => {
    if (initialResult) return;

    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/media?type=${type}&keys=${encodeURIComponent(entityKey)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.items?.[entityKey]) {
          setFetchedResult(data.items[entityKey]);
        }
      } catch {
        // Fallback remains active on network failure
      }
    }

    load();
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
        return <CarPlaceholder seed={entityKey} name={name} teamColor={teamColor} season={season} className="h-full w-full" />;
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

  // If missing or errored, render the custom SVG placeholder immediately
  if (!result || result.status !== 'image' || imageError) {
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
            aria-label={`Image license: ${attribution.text}`}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white/70 border border-white/10 transition-colors hover:bg-black/90 hover:text-white"
          >
            ⓘ
          </button>

          {/* Expanded or hover attribution popover */}
          {showInfo ? (
            <div className="absolute bottom-6 right-0 w-64 rounded-lg border border-white/15 bg-black/90 p-2.5 text-[11px] text-text-mid shadow-2xl backdrop-blur-md">
              <span className="block font-semibold text-text-hi mb-1">
                {attribution.trademark ? 'Fair Use Mark' : 'Verified License'}
              </span>
              <p className="text-[10px] leading-tight text-white/80">
                {attribution.text}
              </p>
              {attribution.sourceUrl ? (
                <a
                  href={attribution.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-block text-[10px] text-accent hover:underline"
                >
                  Wikimedia Commons Source →
                </a>
              ) : null}
              {attribution.trademark ? (
                <span className="mt-1 block text-[9px] text-text-low italic">
                  Unofficial fan project. Trademarks belong to their respective owners.
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
