/**
 * Cron: sync-radio (Masterplan Karar B + E)
 *
 * Fetches OpenF1 team_radio for current-year race sessions → upserts into
 * radio_moments with audio_url and source='openf1'.
 *
 * Rate-limit: OpenF1 enforces 3 req/s, 30 req/min.
 * The openf1.ts adapter already enforces a 350 ms inter-request floor,
 * so we process sessions sequentially (not in parallel) to stay within budget.
 *
 * Auth: Authorization: Bearer ${CRON_SECRET} (legacy CRON_SECRET_KEY also accepted)
 *
 * Response shape: { upserted, skipped, errors, sessions, durationMs }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchRaceSessions,
  fetchTeamRadio,
  fetchSessionDrivers,
  fetchMeeting,
  type OpenF1TeamRadio,
  type OpenF1Driver,
} from '@/lib/f1/sources/openf1';
import { isCronAuthorized } from '@/lib/cronAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { RadioMomentInsert } from '@/types/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function authError(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function makeSlug(driver: string, sessionKey: number, idx: number): string {
  return `${driver.toLowerCase().replace(/[^a-z0-9]/g, '-')}-s${sessionKey}-${idx}`;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isCronAuthorized(req)) return authError();

  const startedAt = Date.now();
  const errors: string[] = [];
  let upserted = 0;
  let skipped = 0;
  let sessionsProcessed = 0;

  try {
    const db = getSupabaseAdmin();
    const year = new Date().getUTCFullYear();

    const sessions = await fetchRaceSessions(year);

    for (const session of sessions) {
      sessionsProcessed++;

      // Fetch drivers & radio for this session
      let drivers: OpenF1Driver[] = [];
      let radios: OpenF1TeamRadio[] = [];

      try {
        [drivers, radios] = await Promise.all([
          fetchSessionDrivers(session.session_key),
          fetchTeamRadio(session.session_key),
        ]);
      } catch (err) {
        errors.push(`session ${session.session_key}: ${err instanceof Error ? err.message : String(err)}`);
        continue;
      }

      if (radios.length === 0) {
        skipped++;
        continue;
      }

      // Build driver lookup: number → driver info
      const driverMap = new Map<number, OpenF1Driver>(
        drivers.map((d) => [d.driver_number, d]),
      );

      // Fetch meeting for GP name / round (best-effort)
      let gpName: string = session.location ?? '';
      const round: number | null = null;
      try {
        const meeting = await fetchMeeting(session.meeting_key);
        if (meeting) {
          gpName = meeting.meeting_name ?? gpName;
        }
      } catch {
        /* non-fatal */
      }

      // Upsert each radio moment
      for (let i = 0; i < radios.length; i++) {
        const radio = radios[i];
        const driver = driverMap.get(radio.driver_number);
        const driverCode = driver?.name_acronym ?? String(radio.driver_number);
        const teamName = driver?.team_name ?? null;

        const row: RadioMomentInsert = {
          slug: makeSlug(driverCode, radio.session_key, i),
          driver: driver ? `${driver.broadcast_name}` : driverCode,
          team: teamName,
          constructor_id: teamName?.toLowerCase().replace(/\s+/g, '_') ?? null,
          year,
          round,
          gp_name: gpName,
          transcript: null,
          audio_url: radio.recording_url,
          source: 'openf1',
          published: false,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (db.from('radio_moments') as any).upsert(row, { onConflict: 'slug' });

        if (error) {
          errors.push(`radio ${row.slug}: ${error.message}`);
        } else {
          upserted++;
        }
      }
    }

    return NextResponse.json({
      source: 'openf1',
      year,
      sessions: sessionsProcessed,
      upserted,
      skipped,
      errors,
      durationMs: Date.now() - startedAt,
    });
  } catch (err) {
    // Generic client-facing message; full detail goes to logs/Sentry (B-7).
    console.error('[cron sync-radio] failed:', err);
    return NextResponse.json(
      { error: 'Sync failed', upserted, skipped, errors, durationMs: Date.now() - startedAt },
      { status: 500 },
    );
  }
}
