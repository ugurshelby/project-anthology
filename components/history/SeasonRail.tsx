'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export interface RailYear {
  year: number;
  /** Team colour for this season (UI colour on the dark surface). */
  ui: string;
  /** Team name that season; spoken by screen readers. */
  label?: string;
  champion?: boolean;
}

interface Props {
  years: RailYear[];
  selected: number;
  /** Link target with a `{year}` placeholder, e.g. "/drivers/lewis-hamilton?season={year}". */
  hrefTemplate: string;
  className?: string;
}

function href(template: string, year: number): string {
  return template.replace('{year}', String(year));
}

/**
 * Chronological season picker. Years are grouped by decade, coloured by the
 * team of that season, and the selected year is centred on load. Plain links:
 * works without scripting, keyboard reachable, 44px touch targets.
 */
export function SeasonRail({ years, selected, hrefTemplate, className = '' }: Props) {
  const t = useTranslations('history.rail');
  const scroller = useRef<HTMLDivElement>(null);
  const active = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const box = scroller.current;
    const el = active.current;
    if (!box || !el) return;
    // centre the selected year inside the rail only (never scroll the page)
    const centre = () => {
      box.scrollLeft = el.offsetLeft - (box.clientWidth - el.clientWidth) / 2;
    };
    centre();
    const raf = requestAnimationFrame(centre);
    return () => cancelAnimationFrame(raf);
  }, [selected]);

  const index = years.findIndex((y) => y.year === selected);
  const prev = index > 0 ? years[index - 1] : null;
  const next = index >= 0 && index < years.length - 1 ? years[index + 1] : null;

  const decades: { decade: number; items: RailYear[] }[] = [];
  for (const y of years) {
    const decade = Math.floor(y.year / 10) * 10;
    const last = decades[decades.length - 1];
    if (last && last.decade === decade) last.items.push(y);
    else decades.push({ decade, items: [y] });
  }

  const stepClass =
    'flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius)] border border-hairline text-text-mid transition-colors duration-200 hover:border-white/30 hover:text-text-hi';

  return (
    <nav aria-label={t('label')} className={`flex items-stretch gap-2 ${className}`.trim()}>
      {prev ? (
        <Link href={href(hrefTemplate, prev.year)} aria-label={`${t('prev')}: ${prev.year}`} className={stepClass} scroll={false}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
      ) : (
        <span aria-hidden className="h-11 w-11 shrink-0" />
      )}

      <div
        ref={scroller}
        className="relative flex min-w-0 flex-1 gap-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {decades.map((group) => (
          <div key={group.decade} className="flex shrink-0 flex-col gap-1">
            <span className="label-caps text-[10px] text-text-low">{t('decade', { decade: group.decade })}</span>
            <ol className="flex gap-1">
              {group.items.map((y) => {
                const isActive = y.year === selected;
                return (
                  <li key={y.year}>
                    <Link
                      ref={isActive ? active : undefined}
                      href={href(hrefTemplate, y.year)}
                      scroll={false}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={y.label ? `${y.year} · ${y.label}${y.champion ? ` · ${t('champion')}` : ''}` : String(y.year)}
                      className={[
                        'relative flex h-11 min-w-[3.25rem] cursor-pointer items-center justify-center rounded-[var(--radius)] border px-2 transition-[color,background-color,border-color] duration-200',
                        'data-tabular',
                        isActive
                          ? 'border-[color:var(--chip)] text-text-hi'
                          : 'border-transparent text-text-mid hover:border-white/20 hover:text-text-hi',
                      ].join(' ')}
                      style={
                        {
                          '--chip': y.ui,
                          backgroundColor: isActive ? 'color-mix(in srgb, var(--chip) 18%, transparent)' : undefined,
                        } as React.CSSProperties
                      }
                    >
                      <span
                        aria-hidden
                        className="absolute inset-x-2 top-0 h-0.5 rounded-full transition-opacity duration-200"
                        style={{ backgroundColor: y.ui, opacity: isActive ? 1 : 0.55 }}
                      />
                      {y.year}
                      {y.champion ? (
                        <span
                          aria-hidden
                          className="absolute right-1 top-1.5 h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: y.ui, boxShadow: '0 0 0 2px var(--surface, #141414)' }}
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>

      {next ? (
        <Link href={href(hrefTemplate, next.year)} aria-label={`${t('next')}: ${next.year}`} className={stepClass} scroll={false}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span aria-hidden className="h-11 w-11 shrink-0" />
      )}
    </nav>
  );
}
