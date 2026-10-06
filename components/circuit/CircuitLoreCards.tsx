'use client';

import { useLocale } from 'next-intl';
import { getCircuitLoreMoments } from '@/data/circuits/lore';

interface CircuitLoreCardsProps {
  circuitId: string;
}

/**
 * Editorial Lore Cards: Showcases iconic historical moments that define the circuit's mythos.
 */
export function CircuitLoreCards({ circuitId }: CircuitLoreCardsProps) {
  const locale = useLocale();
  const moments = getCircuitLoreMoments(circuitId);

  if (!moments || moments.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[16px] border border-hairline bg-surface p-5 md:p-6">
      {/* Background flare */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/[0.04] blur-3xl"
      />

      {/* Header */}
      <div className="relative z-10 mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="label-caps text-accent text-[11px] tracking-widest font-mono">
              CIRCUIT LORE · PİST EFSANELERİ
            </span>
          </div>
          <h3 className="font-condensed text-xl font-700 uppercase tracking-tight text-text-hi md:text-2xl">
            {locale === 'tr' ? 'Pistin Tarihini Yazan Anlar' : 'Moments That Defined History'}
          </h3>
        </div>
        <span className="font-mono text-xs text-text-low">
          {moments.length} {locale === 'tr' ? 'İkonik Anlatı' : 'Iconic Moments'}
        </span>
      </div>

      {/* Lore Moment Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {moments.map((m) => {
          const title = locale === 'tr' ? m.titleTr : m.titleEn;
          const story = locale === 'tr' ? m.storyTr : m.storyEn;
          const detail = locale === 'tr' ? m.lapOrDetailTr : m.lapOrDetailEn;

          return (
            <div
              key={m.id}
              className="group relative flex flex-col justify-between rounded-[12px] border border-hairline bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.035]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-accent">
                    {m.year} · {m.tag}
                  </span>
                  <span className="font-mono text-xs text-text-mid font-semibold">
                    {m.heroDriver}
                  </span>
                </div>

                <h4 className="mt-2.5 font-condensed text-lg font-700 uppercase leading-snug text-text-hi">
                  {title}
                </h4>

                <p className="mt-2 text-xs leading-relaxed text-text-mid md:text-sm">
                  {story}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-hairline/60 pt-2.5 font-mono text-[11px] text-text-low">
                <span>{detail}</span>
                <span className="text-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  Apex Archive ↗
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
