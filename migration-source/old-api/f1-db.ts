import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../lib/supabase';
import {
  fetchRoundSnapshot,
  fetchSeasonSnapshot,
  hasUsableMrData,
  isValidSeasonResource,
  parseSnapshotData,
} from '../lib/f1Snapshots';
import { asFirstString, getAllowedOrigin } from './proxy-helpers';

export function isRaceWeekendUtc(now: Date = new Date()): boolean {
  const day = now.getUTCDay();
  return day === 5 || day === 6 || day === 0;
}

export function f1DbCacheControl(year: number, ok: boolean, now: Date = new Date()): string {
  if (!ok) return 's-maxage=30, stale-while-revalidate=120';
  const current = now.getFullYear();
  if (year < current) {
    return 'public, s-maxage=604800, stale-while-revalidate=86400';
  }
  if (year === current) {
    if (isRaceWeekendUtc(now)) {
      return 'public, s-maxage=90, stale-while-revalidate=120';
    }
    return 'public, s-maxage=900, stale-while-revalidate=900';
  }
  return 'public, s-maxage=300, stale-while-revalidate=600';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const allowedOrigin = getAllowedOrigin(req);
  if (allowedOrigin) res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const yearRaw = asFirstString(req.query?.year);
  const year = Number(yearRaw);
  if (!Number.isFinite(year) || year < 1950 || year > 2100) {
    return res.status(400).json({ error: 'Invalid year' });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(503).json({ error: 'Database not configured' });
  }

  const roundRaw = asFirstString(req.query?.round);
  const suffix = asFirstString(req.query?.suffix).trim();
  const resource = asFirstString(req.query?.resource).trim();

  try {
    if (roundRaw || suffix) {
      const round = Number(roundRaw);
      if (!Number.isFinite(round) || round < 1 || round > 99) {
        return res.status(400).json({ error: 'Invalid round' });
      }
      if (!suffix || suffix.length > 64 || /[^a-zA-Z0-9_-]/.test(suffix)) {
        return res.status(400).json({ error: 'Invalid suffix' });
      }

      let raw: unknown;
      try {
        raw = await fetchRoundSnapshot(supabase, year, round, suffix);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          console.error('[f1-db] round', msg);
        }
        res.setHeader('Cache-Control', f1DbCacheControl(year, false));
        return res.status(500).json({ error: 'Database read failed' });
      }

      const payload = parseSnapshotData(raw);
      if (!hasUsableMrData(payload)) {
        res.setHeader('Cache-Control', f1DbCacheControl(year, false));
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(404).end('null');
      }

      res.setHeader('Cache-Control', f1DbCacheControl(year, true));
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).end(JSON.stringify(payload));
    }

    if (!resource || !isValidSeasonResource(resource)) {
      return res.status(400).json({
        error: 'Invalid resource; use calendar, driverStandings, or constructorStandings',
      });
    }

    let raw: unknown;
    try {
      raw = await fetchSeasonSnapshot(supabase, year, resource);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[f1-db] season', msg);
      }
      res.setHeader('Cache-Control', f1DbCacheControl(year, false));
      return res.status(500).json({ error: 'Database read failed' });
    }

    const payload = parseSnapshotData(raw);
    if (!hasUsableMrData(payload)) {
      res.setHeader('Cache-Control', f1DbCacheControl(year, false));
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(404).end('null');
    }

    res.setHeader('Cache-Control', f1DbCacheControl(year, true));
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).end(JSON.stringify(payload));
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[f1-db]', msg);
      return res.status(500).json({ error: msg });
    }
    return res.status(500).json({ error: 'Database request failed' });
  }
}
