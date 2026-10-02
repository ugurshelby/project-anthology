import { useLocale, useTranslations } from 'next-intl';
import { BentoCard } from '@/components/bento/BentoCard';
import { Link } from '@/i18n/routing';
import type { DnaStage, TeamDna } from '@/lib/history/dna';
import { paletteForConstructorId } from '@/lib/history/palette';

interface Props {
  dna: TeamDna;
  /** Season currently shown on the page; its chapter is highlighted. */
  selectedYear: number;
  /** URL id of the team page (lineage head). */
  teamId: string;
}

/**
 * Team DNA: how the team entered Formula 1 and every name it has raced under.
 * A tick per season shows continuity at a glance; chapters below tell the story
 * name by name. Founding teams that never missed a season get a stronger frame.
 */
export function TeamDnaSection({ dna, selectedYear, teamId }: Props) {
  const t = useTranslations('history.dna');
  const locale = useLocale();
  const note = dna.note ? (locale === 'tr' ? dna.note.tr : dna.note.en) : null;

  const first = dna.firstSeason;
  const last = Math.max(dna.lastSeason, selectedYear);
  const stageByYear = new Map<number, DnaStage>();
  for (const s of dna.stages) {
    const end = s.to ?? last;
    for (let y = s.from; y <= end; y += 1) stageByYear.set(y, s);
  }
  const ticks: number[] = [];
  for (let y = first; y <= last; y += 1) ticks.push(y);

  const selectedStage = [...dna.stages, ...dna.priorSpells].find((s) => selectedYear >= s.from && selectedYear <= (s.to ?? last));
  const multi = dna.stages.length > 1;
  const yearsText = (s: DnaStage): string => (s.to === s.from ? String(s.from) : t('years', { from: s.from, to: s.to ?? t('now') }));
  const founder = dna.founder;
  const accent = dna.stages[dna.stages.length - 1].palette.ui;

  return (
    <BentoCard span={12} className={founder ? 'ring-1 ring-inset ring-white/10' : ''}>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ backgroundColor: 'var(--team-secondary)', opacity: 0.7 }} />
      {founder ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 12% 0%, color-mix(in srgb, ${accent} 16%, transparent), transparent 55%)` }}
        />
      ) : null}

      <div className="relative">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="label-caps text-text-mid">{t('heading')}</p>
          {founder ? (
            <span className="label-caps rounded-full border px-3 py-1 text-[10px] tracking-[0.2em]" style={{ borderColor: accent, color: accent }}>
              {t('founderBadge')}
            </span>
          ) : null}
        </div>

        <h2 className={`${founder ? 'display-hero text-[clamp(36px,6.5vw,76px)]' : 'headline-lg'} mt-3 max-w-4xl text-balance text-text-hi`}>
          {founder ? t('founderLine', { year: first }) : t('enteredLine', { year: first })}
        </h2>

        {note ? <p className="body-lg mt-5 max-w-3xl text-text-mid">{note}</p> : <p className="body-md mt-4 max-w-3xl text-text-mid">{t('lead')}</p>}

        {/* continuity strip: one tick per season */}
        <figure className="mt-8" aria-label={t('ticksLabel')}>
          <div className="flex h-9 items-end gap-px" role="img" aria-label={t('ticksLabel')}>
            {ticks.map((y) => {
              const st = stageByYear.get(y);
              const prior = !st ? dna.priorSpells.find((p) => y >= p.from && y <= (p.to ?? last)) : null;
              const champion = (st ?? prior)?.titles.includes(y) ?? false;
              const ui = st ? paletteForConstructorId(st.constructorId, y).ui : prior ? paletteForConstructorId(prior.constructorId, y).ui : null;
              const isSelected = y === selectedYear;
              return (
                <span
                  key={y}
                  title={ui ? t('tickTitle', { year: y, name: (st ?? prior)!.name }) : String(y)}
                  className="min-w-[2px] flex-1 rounded-[1px] transition-opacity duration-200"
                  style={{
                    height: champion ? '100%' : ui ? '58%' : '14%',
                    backgroundColor: ui ?? 'var(--hairline)',
                    opacity: ui ? (isSelected ? 1 : champion ? 0.95 : 0.6) : 0.5,
                    outline: isSelected ? '1px solid #fff' : undefined,
                    outlineOffset: isSelected ? 2 : undefined,
                  }}
                />
              );
            })}
          </div>
          <figcaption className="data-tabular mt-2 flex justify-between text-xs text-text-low">
            <span>{first}</span>
            <span>{dna.active ? t('now') : last}</span>
          </figcaption>
        </figure>

        {/* chapters */}
        <ol className="relative mt-8 grid gap-3 md:grid-flow-col md:auto-cols-fr md:gap-4 [&>li]:min-w-0">
          {dna.stages.map((s, i) => {
            const current = selectedStage === s;
            const later = s.from > selectedYear;
            const target = Math.min(Math.max(selectedYear, s.from), s.to ?? last);
            return (
              <li key={`${s.constructorId}-${s.from}`} className="reveal-up" style={{ ['--i' as string]: i }}>
                <Link
                  href={`/teams/${teamId}?season=${target}`}
                  scroll={false}
                  aria-current={current ? 'true' : undefined}
                  className={[
                    'relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[var(--radius-lg)] border p-4 transition-[border-color,opacity,background-color] duration-300 md:p-5',
                    current ? 'border-[color:var(--stage)]' : 'border-hairline hover:border-white/25',
                    later && !current ? 'opacity-60 hover:opacity-100' : '',
                  ].join(' ')}
                  style={
                    {
                      '--stage': s.palette.ui,
                      backgroundColor: `color-mix(in srgb, ${s.palette.ui} ${current ? 16 : 7}%, var(--surface))`,
                    } as React.CSSProperties
                  }
                >
                  <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: s.palette.ui }} />
                  <span className="label-caps flex items-center justify-between gap-2 text-text-low">
                    {multi ? t('chapter', { n: i + 1 }) : <span aria-hidden>&nbsp;</span>}
                    {current ? <span style={{ color: s.palette.ui }}>{t('current')}</span> : later ? <span>{t('later')}</span> : null}
                  </span>
                  <span className="headline-md mt-2 block text-text-hi">{s.name}</span>
                  <span className="data-tabular mt-1 block text-sm text-text-mid">{yearsText(s)}</span>

                  {s.entrants.length > 0 ? <span className="body-sm mt-3 block text-text-mid">{t('entrants', { names: s.entrants.join(', ') })}</span> : null}
                  {s.engines.length > 0 ? <span className="body-sm mt-1 block text-text-low">{t('engines', { names: s.engines.join(', ') })}</span> : null}

                  <span className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 data-tabular text-xs text-text-mid">
                    <span>{t('seasons', { count: s.seasons })}</span>
                    {s.wins > 0 ? <span>{t('wins', { count: s.wins })}</span> : null}
                    {s.titles.length > 0 ? <span style={{ color: s.palette.ui }}>{t('titles', { count: s.titles.length })}</span> : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        {dna.priorSpells.length > 0 ? (
          <div className="mt-6 border-t border-hairline pt-5">
            <p className="label-caps text-text-mid">{t('priorHeading')}</p>
            <ul className="mt-2 space-y-1">
              {dna.priorSpells.map((s) => (
                <li key={`${s.constructorId}-${s.from}`} className="body-sm text-text-mid">
                  {t('priorLine', { name: s.name, from: s.from, to: s.to ?? last })}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-hairline pt-6 sm:max-w-xl">
          <div>
            <dt className="label-caps text-text-mid">{t('totalSeasons')}</dt>
            <dd className="hero-number text-[clamp(28px,3.4vw,44px)] text-text-hi">{dna.totals.seasons}</dd>
          </div>
          <div>
            <dt className="label-caps text-text-mid">{t('totalWins')}</dt>
            <dd className="hero-number text-[clamp(28px,3.4vw,44px)] text-text-hi">{dna.totals.wins}</dd>
          </div>
          {dna.totals.titles.length > 0 ? (
            <div>
              <dt className="label-caps text-text-mid">{t('totalTitles')}</dt>
              <dd className="hero-number text-[clamp(28px,3.4vw,44px)]" style={{ color: accent }}>
                {dna.totals.titles.length}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </BentoCard>
  );
}
