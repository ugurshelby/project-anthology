/**
 * Audits driver SVG assets for seasons 2018–2026.
 * Run: npx tsx assets/scripts/audit-missing-assets.ts [--generate]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { driverIconSrc } from '../../lib/assets/f1-icons';
import { buildDriverSvg } from './lib/svg-builders.mjs';

const ROOT = process.cwd();
const ROSTERS = JSON.parse(
  readFileSync(join(ROOT, 'assets/data/season-rosters.json'), 'utf8'),
) as Record<
  string,
  {
    season: number;
    drivers: Array<{
      driverId: string;
      code?: string;
      number?: string;
      constructorId: string;
      givenName?: string;
      familyName?: string;
    }>;
  }
>;
const PALETTE = JSON.parse(
  readFileSync(join(ROOT, 'assets/data/constructor-palette.json'), 'utf8'),
);

const SEASONS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026] as const;
const GENERATE = process.argv.includes('--generate');

/** 2026 drivers in f1-icons but not yet in season-rosters.json */
const EXTRA_2026 = [
  { driverId: 'colapinto', code: 'COL', number: '43', constructorId: 'alpine' },
  { driverId: 'lindblad', code: 'LIN', number: '41', constructorId: 'rb' },
];

type AuditRow = {
  driver: string;
  driverId: string;
  expectedPath: string;
  status: 'present' | 'missing';
  points: number;
  critical: boolean;
  note: string;
};

function getPalette(constructorId: string, season: number) {
  const base = PALETTE[constructorId];
  if (!base) {
    return { slug: constructorId.replace(/_/g, '-'), primary: '#333333', accent: '#FFFFFF' };
  }
  let merged = { ...base };
  if (base.eras) {
    const era = base.eras.find(
      (e: { from: number; to: number }) => season >= e.from && season <= e.to,
    );
    if (era) merged = { ...merged, ...era };
  }
  return merged;
}

async function fetchPoints(season: number): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (season >= 2026) return map;
  try {
    const url = `https://api.jolpi.ca/ergast/f1/${season}/driverStandings.json?limit=100`;
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) return map;
    const json = await res.json();
    const list = json.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
    for (const row of list) {
      const id = row.Driver?.driverId;
      const pts = parseFloat(row.points ?? '0');
      if (id) map.set(id, pts);
    }
  } catch {
    /* offline — points default to 0 */
  }
  return map;
}

function driverLabel(d: { driverId: string; givenName?: string; familyName?: string }) {
  if (d.givenName && d.familyName) return `${d.givenName} ${d.familyName}`;
  return d.driverId.replace(/_/g, ' ');
}

function generateSvg(
  season: number,
  d: { driverId: string; code?: string; number?: string; constructorId: string },
) {
  const palette = getPalette(d.constructorId, season);
  const slug = driverIconSrc(d.code, d.driverId, season)?.split('/').pop()?.replace('.svg', '');
  if (!slug) return;
  const clipId = `c-${season}-${slug}-${palette.slug}`.replace(/[^a-zA-Z0-9_-]/g, '-');
  const abbr = (d.code ?? d.driverId.slice(0, 3)).toUpperCase().padEnd(3, 'X').slice(0, 3);
  const svg = buildDriverSvg({
    clipId,
    abbr,
    number: d.number ?? '0',
    primary: palette.primary,
    accent: palette.accent,
  });
  const relPath = `/drivers/${season}/${slug}.svg`;
  const absPath = join(ROOT, 'public', relPath);
  mkdirSync(join(ROOT, 'public/drivers', String(season)), { recursive: true });
  writeFileSync(absPath, svg, 'utf8');
  console.log(`Generated ${relPath}`);
}

async function main() {
  const allRows: Record<number, AuditRow[]> = {};
  let totalPresent = 0;
  let totalMissing = 0;
  let totalCriticalMissing = 0;
  const generated: string[] = [];

  for (const season of SEASONS) {
    const roster = ROSTERS[String(season)];
    if (!roster) continue;

    const drivers = [...roster.drivers];
    if (season === 2026) {
      for (const extra of EXTRA_2026) {
        if (!drivers.some((d) => d.driverId === extra.driverId)) drivers.push(extra);
      }
    }

    const points = await fetchPoints(season);
    const rows: AuditRow[] = [];

    for (const d of drivers) {
      const expected = driverIconSrc(d.code, d.driverId, season);
      const pts = points.get(d.driverId) ?? 0;
      const critical = pts > 0;

      if (!expected) {
        rows.push({
          driver: driverLabel(d),
          driverId: d.driverId,
          expectedPath: '(unresolved)',
          status: 'missing',
          points: pts,
          critical,
          note: critical ? 'CRITICAL — no slug' : 'AssetFallback OK',
        });
        totalMissing++;
        if (critical) totalCriticalMissing++;
        continue;
      }

      const absPath = join(ROOT, 'public', expected);
      const present = existsSync(absPath);
      let note = present ? '' : critical ? 'CRITICAL — generate' : 'AssetFallback OK';

      if (!present) {
        totalMissing++;
        if (critical) totalCriticalMissing++;
        if (GENERATE && critical) {
          generateSvg(season, d);
          generated.push(expected);
          note = 'generated';
        }
      } else {
        totalPresent++;
      }

      rows.push({
        driver: driverLabel(d),
        driverId: d.driverId,
        expectedPath: expected,
        status: present ? 'present' : 'missing',
        points: pts,
        critical,
        note,
      });
    }

    allRows[season] = rows;
  }

  const lines: string[] = [
    '# Missing Driver Assets Audit (2018–2026)',
    '',
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    '',
    'Paths resolved via `driverIconSrc()` from `lib/assets/f1-icons.ts`.',
    'Critical = driver scored championship points that season.',
    '',
    '## Summary',
    '',
    `| Metric | Count |`,
    `| --- | ---: |`,
    `| Seasons audited | ${SEASONS.length} |`,
    `| Total roster entries | ${totalPresent + totalMissing} |`,
    `| Present | ${totalPresent} |`,
    `| Missing | ${totalMissing} |`,
    `| Critical missing | ${totalCriticalMissing} |`,
    '',
  ];

  if (generated.length) {
    lines.push('## Generated this run', '', ...generated.map((p) => `- \`${p}\``), '');
  }

  for (const season of SEASONS) {
    const rows = allRows[season];
    if (!rows?.length) continue;
    const missing = rows.filter((r) => r.status === 'missing');
    lines.push(`## ${season}`, '');
    lines.push(
      `| Driver | Expected path | Status | Points | Note |`,
      `| --- | --- | --- | ---: | --- |`,
    );
    for (const r of rows) {
      const note = r.note || (r.status === 'present' ? '—' : r.critical ? 'CRITICAL' : 'AssetFallback OK');
      lines.push(
        `| ${r.driver} | \`${r.expectedPath}\` | ${r.status} | ${r.points} | ${note} |`,
      );
    }
    if (!missing.length) lines.push('', '_All assets present._', '');
    lines.push('');
  }

  const outPath = join(ROOT, 'MISSING_ASSETS.md');
  writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`Wrote ${outPath}`);
  console.log(
    JSON.stringify({ totalPresent, totalMissing, totalCriticalMissing, generated }, null, 2),
  );
}

main();
