import { useLocale, useTranslations } from 'next-intl';
import { formatNumber } from '@/lib/i18n/format';

/** "1:12.909 — Hamilton (2021)" → parts; null when the text has another shape. */
export function parseLapRecord(text: string | undefined | null): { time: string; holder: string; year: string | null } | null {
  const m = /^\s*(\d+:\d{2}\.\d{3})\s*[—–-]\s*(.+?)\s*(?:\((\d{4})\))?\s*$/.exec(text ?? '');
  return m ? { time: m[1], holder: m[2], year: m[3] ?? null } : null;
}

/**
 * Fast facts strip (plan 13.5): lap length, corners, race laps and distance, and the
 * outright lap record. Laps come from this season's classified result, so they and
 * the distance appear once the race has been run; nothing is estimated. Telemetry
 * purple is reserved for the lap record (component rules §9).
 */
export function CircuitFactsRibbon({
  lengthKm,
  corners,
  laps,
  lapRecord,
}: {
  lengthKm: number | null;
  corners: number | null;
  laps: number | null;
  lapRecord: string | null;
}) {
  const t = useTranslations('ui.circuit');
  const locale = useLocale();
  const record = parseLapRecord(lapRecord);
  const distance = lengthKm != null && laps != null ? formatNumber(lengthKm * laps, locale, 3) : null;

  const tiles: Array<{ id: string; label: string; value: string; sub?: string; record?: boolean }> = [];
  if (lengthKm != null) tiles.push({ id: 'length', label: t('lapLength'), value: formatNumber(lengthKm, locale, 3), sub: 'km' });
  if (corners != null) tiles.push({ id: 'corners', label: t('corners'), value: String(corners) });
  if (laps != null) tiles.push({ id: 'laps', label: t('laps'), value: String(laps) });
  if (distance) tiles.push({ id: 'distance', label: t('raceDistance'), value: distance, sub: t('distanceNote') });
  if (record) {
    tiles.push({
      id: 'record',
      label: t('lapRecord'),
      value: record.time,
      sub: record.year ? `${record.holder} · ${record.year}` : record.holder,
      record: true,
    });
  }
  if (tiles.length === 0) return null;

  return (
    <section aria-label={t('data')} className="mb-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={[
              'relative flex flex-col overflow-hidden rounded-2xl border bg-surface p-4',
              tile.record ? 'col-span-2 border-[#b356fe]/35 sm:col-span-1' : 'border-hairline/80',
            ].join(' ')}
          >
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-low">{tile.label}</span>
            <div className="mt-2 flex min-w-0 items-baseline gap-2">
              <span
                className={[
                  'font-condensed block text-3xl font-700 tabular-nums tracking-tight sm:text-4xl',
                  tile.record ? 'text-[#b356fe]' : 'text-text-hi',
                ].join(' ')}
                style={{ fontFamily: 'var(--font-condensed)' }}
              >
                {tile.value}
              </span>
              {tile.sub === 'km' ? <span className="font-mono text-xs text-text-mid">km</span> : null}
            </div>
            {tile.sub && tile.sub !== 'km' ? (
              <span lang={tile.record ? 'en' : undefined} className="mt-1 truncate font-mono text-xs text-text-mid">
                {tile.sub}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
