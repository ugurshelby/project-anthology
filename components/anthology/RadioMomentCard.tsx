import type { RadioMomentRow } from '@/types/database';

/**
 * Radio moment card — a transcribed team-radio snippet (anthology hub).
 * Mono metadata, condensed driver, the transcript as a pull-quote.
 */
export function RadioMomentCard({ moment }: { moment: RadioMomentRow }) {
  return (
    <article className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-hairline bg-surface p-6">
      <span className="label-caps text-text-low">
        {[moment.gp_name, moment.year].filter(Boolean).join(' · ')}
      </span>
      {moment.transcript ? (
        <blockquote className="border-l-2 border-hairline pl-4">
          <p className="font-condensed text-2xl font-500 leading-tight text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
            “{moment.transcript}”
          </p>
        </blockquote>
      ) : null}
      <span className="data-tabular text-text-mid">
        {[moment.driver, moment.team].filter(Boolean).join(' — ')}
      </span>
    </article>
  );
}
