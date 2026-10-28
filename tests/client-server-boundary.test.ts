import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Structural guard for the service-role client (master-plan "Teknik borç", 2026-10-28). The `server-only`
 * package is not used: the seed scripts import `lib/supabase` under tsx, where it throws. Instead no
 * `'use client'` module may import a module that creates or uses the admin client.
 */
const SERVER_ONLY = [
  '@/lib/supabase',
  '@/lib/f1Ingest',
  '@/lib/f1/provisionalSync',
  '@/lib/media/repo',
  '@/lib/media/sync',
  '@/lib/cron',
  '@/lib/cronAuth',
  '@/lib/news/stories',
  '@/lib/news/rewrite',
  '@/lib/cache/revalidate',
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe('client/server module boundary', () => {
  it('no client component imports a server-only module', () => {
    const offenders = ['app', 'components', 'lib'].flatMap(sourceFiles).flatMap((file) => {
      const text = readFileSync(file, 'utf8');
      if (!/^\s*['"]use client['"]/.test(text)) return [];
      const imports = [...text.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      return imports
        .filter((spec) => SERVER_ONLY.some((s) => spec === s || spec.startsWith(`${s}/`)))
        .map((spec) => `${file} → ${spec}`);
    });
    expect(offenders).toEqual([]);
  });
});
