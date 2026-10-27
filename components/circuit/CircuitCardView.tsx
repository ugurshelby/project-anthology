import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { countryName, formatDate } from '@/lib/i18n/format';
import Image from 'next/image';
import { ApexFallback } from '@/components/media/ApexFallback';
import { MediaAssetView } from '@/components/media/MediaAssetView';
import type { CircuitCard } from '@/lib/data/circuits';
import type { CircuitFacts } from '@/data/circuits/facts';
import type { MediaResult } from '@/lib/media/read';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { StatusChip } from '@/components/bento/StatusChip';

function formatRaceDate(date: string, locale: string): string {
  if (!date || date === '—') return '';
  const t = Date.parse(`${date}T12:00:00Z`);
  if (!Number.isFinite(t)) return date;
  return formatDate(t, locale, { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

export interface CircuitCardViewProps {
  card: CircuitCard;
  status: 'done' | 'next' | 'upcoming';
  media?: MediaResult | null;
  facts?: CircuitFacts | null;
  compact?: boolean;
}

/**
 * Apple WWDC & F1 Telemetry Circuit Card:
 * Features verified venue photography (or CAD fallback), multi-layer atmospheric
 * gradient scrim, luminescent floating track geometry watermark, and high-density
 * telemetry specs. Built with tactile spring feedback (active:scale-[0.985]) and
 * hairline specular top highlights.
 */
export function CircuitCardView({
  card,
  status,
  media,
  facts,
  compact = false,
}: CircuitCardViewProps) {
  const locale = useLocale();
  const t = useTranslations('ui.circuit');

  if (compact) {
    return (
      <Link
        href={`/circuits/${card.circuitId}`}
        className="group relative flex min-h-14 items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-surface/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-surface/80 active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-xs text-text-low shrink-0 w-8">R{card.round}</span>
          <CountryFlag country={card.country} className="h-3 w-4 shrink-0 rounded-[2px]" />
          <span
            lang="en"
            className="truncate font-condensed text-base font-700 uppercase tracking-tight text-text-hi group-hover:text-white transition-colors"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {card.circuitName}
          </span>
          <span className="hidden sm:inline-block text-xs font-mono text-text-low truncate">
            {countryName(card.country, locale)}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {card.date && card.date !== '—' ? (
            <span className="hidden md:inline-block text-xs font-mono text-text-low tabular-nums">
              {formatRaceDate(card.date, locale)}
            </span>
          ) : null}
          <StatusChip status={status === 'next' ? 'next' : status} />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/circuits/${card.circuitId}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/60 backdrop-blur-sm min-h-[260px] sm:min-h-[290px] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/[0.22] hover:shadow-[0_20px_48px_rgba(0,0,0,0.7)] active:scale-[0.985]"
    >
      {/* Specular Ambient Top-Edge Highlight (Apple HIG physical glass) */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08] z-20" />

      {/* Atmospheric Real Photography Background with Fallback */}
      <div className="absolute inset-0 overflow-hidden bg-surface-raised">
        {media?.status === 'image' ? (
          <MediaAssetView
            type="circuit"
            entityKey={card.circuitId}
            initialResult={media}
            alt={card.circuitName}
            name={card.circuitName}
            objectFit="cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="h-full w-full object-cover [filter:contrast(1.05)_saturate(0.92)] transition-transform duration-700 ease-out group-hover:scale-105"
            showAttribution={false}
          />
        ) : (
          <ApexFallback kind="circuit" label={card.circuitName} />
        )}
      </div>

      {/* Multi-layer Gradient Scrim for Impeccable Text Contrast & Depth */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_top,#0a0a0a_0%,rgba(10,10,10,0.85)_42%,rgba(10,10,10,0.25)_72%,rgba(0,0,0,0.4)_100%)] transition-opacity duration-300 group-hover:opacity-95"
      />

      {/* Floating Track Outline Vector (Luminescent Engineering Blueprint Watermark) */}
      {card.svgSrc ? (
        <div className="pointer-events-none absolute right-3.5 top-3.5 z-20 h-14 w-14 sm:h-16 sm:w-16 opacity-45 transition-all duration-300 group-hover:opacity-90 group-hover:scale-110 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          <Image
            src={card.svgSrc}
            alt=""
            fill
            sizes="64px"
            className="object-contain brightness-0 invert drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]"
          />
        </div>
      ) : null}

      {/* Card Header: Round Badge + Status Chip */}
      <div className="relative z-20 flex items-center justify-between gap-2 p-4 sm:p-5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.1em] text-text-mid backdrop-blur-md shadow-sm">
          <CountryFlag country={card.country} className="h-2.5 w-4 rounded-[2px]" />
          <span>R{card.round}</span>
        </span>
        {status === 'next' ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/20 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-accent backdrop-blur-md">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            {t('next')}
          </span>
        ) : (
          <span className="rounded-[var(--radius-chip)] bg-black/60 backdrop-blur-md">
            <StatusChip status={status} />
          </span>
        )}
      </div>

      {/* Card Footer: Metadata, Title & Fast Specs */}
      <div className="relative z-20 flex flex-col gap-1 p-4 sm:p-5">
        <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.08em] text-text-mid">
          <span>{countryName(card.country, locale)}</span>
          {card.date && card.date !== '—' ? (
            <>
              <span aria-hidden className="text-text-low">·</span>
              <span className="tabular-nums">{formatRaceDate(card.date, locale)}</span>
            </>
          ) : null}
        </div>

        <h3
          lang="en"
          className="font-condensed text-xl sm:text-2xl font-700 leading-[0.98] tracking-tight uppercase text-text-hi transition-colors group-hover:text-white line-clamp-1"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {card.circuitName}
        </h3>

        {/* Telemetry Micro-Bar (Length, Corners, Signature Corner / Lap Record) */}
        {facts ? (
          <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.08] pt-2 text-[11px] font-mono text-text-low">
            <div className="flex items-center gap-3">
              {facts.lengthKm ? (
                <span className="flex items-center gap-1">
                  <span className="text-text-mid tabular-nums font-600">{facts.lengthKm}</span>
                  <span>km</span>
                </span>
              ) : null}
              {facts.corners ? (
                <span className="flex items-center gap-1">
                  <span className="text-text-mid tabular-nums font-600">{facts.corners}</span>
                  <span>{t('cornersShort')}</span>
                </span>
              ) : null}
            </div>
            {facts.signatureCorner ? (
              <span className="truncate max-w-[140px] text-text-low/80 font-normal">
                {facts.signatureCorner}
              </span>
            ) : facts.lapRecord ? (
              <span className="truncate max-w-[140px] text-text-low/80 tabular-nums">
                {facts.lapRecord.split('—')[0]?.trim()}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
