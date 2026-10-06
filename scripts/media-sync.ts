/**
 * Local dry run of the media sync. Talks to the REAL Jolpica/Wikimedia APIs but
 * writes nothing to Supabase: results stay in memory and the re-encoded WebP
 * variants (optional) go to a local folder for eyeballing. Loads no env file.
 *
 *   npx tsx scripts/media-sync.ts --seasons 2025-2025 --only driver:norris,team:ferrari --out /tmp/media-out
 *
 * Flags: --seasons MIN-MAX  --only type:key,...  --budget SECONDS  --out DIR  --report FILE
 *        --passes N   repeat the run N times on the same in-memory repo (each pass discovers two more older
 *                     seasons, exactly like successive hourly cron runs)
 */
import { writeFile } from 'node:fs/promises';
import { createMemoryRepo } from '@/lib/media/repo';
import { runMediaSync } from '@/lib/media/sync';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main(): Promise<void> {
  const [min, max] = (arg('seasons') ?? '').split('-').map(Number);
  const only = arg('only')
    ?.split(',')
    .map((p) => ({ type: p.slice(0, p.indexOf(':')), key: p.slice(p.indexOf(':') + 1) }));
  const repo = createMemoryRepo(arg('out'));
  const passes = Number(arg('passes') ?? 1);
  const items: Awaited<ReturnType<typeof runMediaSync>>['items'] = [];
  const total = { discoveredSeasons: [] as number[], newEntities: 0, due: 0, resolved: 0, unchanged: 0, missing: 0, errors: 0, durationMs: 0 };
  for (let pass = 1; pass <= passes; pass++) {
    const report = await runMediaSync({
      repo,
      budgetMs: Number(arg('budget') ?? 600) * 1000,
      minSeason: Number.isFinite(min) ? min : undefined,
      maxSeason: Number.isFinite(max) ? max : undefined,
      only,
      maxDue: 2000,
      log: (m) => console.log(`  ! ${m}`),
    });
    console.log(`-- pass ${pass}/${passes}: seasons ${report.discoveredSeasons.join(',')} due ${report.due} resolved ${report.resolved} missing ${report.missing} errors ${report.errors} (${Math.round(report.durationMs / 1000)}s)`);
    items.push(...report.items);
    total.discoveredSeasons.push(...report.discoveredSeasons);
    total.newEntities = Math.max(total.newEntities, report.newEntities);
    for (const k of ['due', 'resolved', 'unchanged', 'missing', 'errors', 'durationMs'] as const) total[k] += report[k];
  }
  for (const it of items) console.log(`${it.outcome.padEnd(9)} ${it.type}:${it.key}  ${it.detail ?? ''}`);
  const summary = total;
  console.log('\nSUMMARY', JSON.stringify(summary));
  const out = arg('report');
  if (out) {
    await writeFile(
      out,
      JSON.stringify({ summary, items, records: Array.from(repo.records.values()) }, null, 2),
    );
    console.log(`report -> ${out}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
