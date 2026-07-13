import Link from 'next/link';
import { StatusChip } from '@/components/bento/StatusChip';
import { circuitIconSrc } from '@/lib/assets/f1-icons';
import Image from 'next/image';
import type { CalendarRace } from '@/lib/f1Calendar';
import { isRaceDone, CURRENT_SEASON } from '@/lib/f1Calendar';

function fmtDate(date?: string): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
}

/**
 * Season calendar list (design.md §3.3). Each round shows status (DONE/NEXT/
 * UPCOMING); the NEXT round gets a thin accent left bar.
 */
export function CalendarList({ races, nextRound }: { races: CalendarRace[]; nextRound?: string }) {
  return (
    <div className="flex flex-col">
      {races.map((race) => {
        const round = String(race.round ?? '');
        const done = isRaceDone(race);
        const isNext = !done && round === nextRound;
        const status = done ? 'done' : isNext ? 'next' : 'upcoming';
        const svg = circuitIconSrc(race.Circuit?.circuitId);
        const href = `/season/${CURRENT_SEASON}/round/${round}`;
        return (
          <Link
            key={round}
            href={href}
            className={[
              'group flex items-center gap-4 border-b border-hairline py-4 pl-4 transition-opacity duration-150 will-change-[opacity] last:border-b-0 hover:opacity-80',
              isNext ? 'border-l-2 border-l-accent bg-surface-raised/40' : 'border-l-2 border-l-transparent',
            ].join(' ')}
          >
            <span className="data-tabular w-8 text-text-mid">R{round}</span>
            <span className="relative hidden h-14 w-20 shrink-0 sm:block">
              {svg ? (
                <Image
                  src={svg}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain opacity-95 [filter:drop-shadow(0_0_1px_rgba(255,255,255,0.15))]"
                />
              ) : null}
            </span>
            <span className="flex-1 truncate">
              <span className="font-condensed block text-lg font-600 uppercase leading-tight text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                {race.raceName}
              </span>
              <span className="data-tabular text-text-low">{race.Circuit?.circuitName}</span>
            </span>
            <span className="data-tabular hidden text-text-mid md:block">{fmtDate(race.date)}</span>
            <StatusChip status={status} />
          </Link>
        );
      })}
    </div>
  );
}
