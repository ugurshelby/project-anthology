import { useLocale, useTranslations } from 'next-intl';
import { raceName } from '@/lib/i18n/format';
import type { CalendarRace } from '@/lib/f1Calendar';
import { isRaceDone } from '@/lib/f1Calendar';

/**
 * Horizontal season progress rail — completed rounds as solid accent segments,
 * next round as pulsing dot, remainder as faint ticks.
 */
export function SeasonTimeline({
  races,
  nextRound,
}: {
  races: CalendarRace[];
  nextRound?: string;
}) {
  const t = useTranslations('ui.season');
  const locale = useLocale();
  const total = races.length;

  return (
    <div className="mb-6 flex w-full max-w-full min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="label-caps text-text-mid">{t('timeline')}</span>
        <span className="data-tabular text-text-low">
          {t('roundsProgress', { done: races.filter((r) => isRaceDone(r)).length, total })}
        </span>
      </div>
      <div className="relative flex h-8 w-full max-w-full min-w-0 items-center gap-0.5 overflow-x-auto pb-1">
        {races.map((race) => {
          const round = String(race.round ?? '');
          const done = isRaceDone(race);
          const isNext = !done && round === nextRound;
          return (
            <div key={round} className="group relative flex min-w-[10px] flex-1 flex-col items-center gap-1">
              <span
                className={[
                  'block h-1.5 w-full rounded-full transition-colors',
                  done ? 'bg-accent' : isNext ? 'bg-accent animate-pulse' : 'bg-white/10',
                ].join(' ')}
              />
              <span
                className={[
                  'absolute -bottom-0.5 h-2 w-2 rounded-full',
                  isNext ? 'bg-accent shadow-[0_0_8px_var(--accent)]' : 'bg-transparent',
                ].join(' ')}
              />
              <span className="sr-only">
                {t('roundState', { round, name: raceName(race.raceName, locale), state: done ? t('stateDone') : isNext ? t('stateNext') : t('stateUpcoming') })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
