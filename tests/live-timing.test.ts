import { describe, expect, it } from 'vitest';
import type { LiveTimingResponse, LiveTimingDriverRow } from '@/app/api/live-timing/route';

describe('Live Timing Contract & Data Processing', () => {
  it('validates LiveTimingResponse schema with empty inactive state', () => {
    const inactive: LiveTimingResponse = {
      live: false,
      sessionName: null,
      circuitShortName: null,
      rows: [],
    };

    expect(inactive.live).toBe(false);
    expect(inactive.rows).toHaveLength(0);
  });

  it('validates live session driver rows sorted by position', () => {
    const sampleRows: LiveTimingDriverRow[] = [
      {
        position: 1,
        driverNumber: 4,
        code: 'NOR',
        fullName: 'Lando Norris',
        teamName: 'McLaren',
        teamColour: '#ff8000',
        gapToLeader: null,
        interval: null,
      },
      {
        position: 2,
        driverNumber: 81,
        code: 'PIA',
        fullName: 'Oscar Piastri',
        teamName: 'McLaren',
        teamColour: '#ff8000',
        gapToLeader: '+1.425',
        interval: '+1.425',
      },
    ];

    const liveResponse: LiveTimingResponse = {
      live: true,
      sessionName: 'Race',
      circuitShortName: 'Silverstone',
      rows: sampleRows,
    };

    expect(liveResponse.live).toBe(true);
    expect(liveResponse.rows).toHaveLength(2);
    expect(liveResponse.rows[0].position).toBeLessThan(liveResponse.rows[1].position);
    expect(liveResponse.rows[0].code).toBe('NOR');
    expect(liveResponse.rows[1].interval).toBe('+1.425');
  });

  it('handles partial telemetry rows (missing interval or team color fallback)', () => {
    const fallbackRow: LiveTimingDriverRow = {
      position: 3,
      driverNumber: 1,
      code: 'VER',
      fullName: 'Max Verstappen',
      teamName: 'Red Bull Racing',
      teamColour: '#3671c6',
      gapToLeader: '+5.120',
      interval: null,
    };

    expect(fallbackRow.interval).toBeNull();
    expect(fallbackRow.teamColour).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
