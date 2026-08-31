/**
 * Integration tests for entity API routes — slug validation gate.
 *
 * Invalid slugs must be rejected with 400 before any data-layer work runs.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/data/circuits', () => ({
  getCircuitDetail: vi.fn(async () => {
    throw new Error('should not be called for invalid slug');
  }),
}));

vi.mock('@/lib/data/entities', () => ({
  getDriverCareer: vi.fn(async () => {
    throw new Error('should not be called for invalid slug');
  }),
  getTeamCareer: vi.fn(async () => {
    throw new Error('should not be called for invalid slug');
  }),
}));

vi.mock('@/data/drivers', () => ({
  getDriverLore: () => null,
}));

vi.mock('@/data/teams', () => ({
  getTeamLore: () => null,
}));

const { GET: getCircuit } = await import('@/app/api/circuits/[id]/route');
const { GET: getDriverCareer } = await import('@/app/api/drivers/[driverId]/career/route');
const { GET: getTeamCareer } = await import('@/app/api/teams/[constructorId]/career/route');

function getRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost${path}`);
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('entity routes — slug validation', () => {
  it('/api/circuits rejects invalid slug with 400', async () => {
    const res = await getCircuit(getRequest('/test'), {
      params: Promise.resolve({ id: '../monaco' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });

  it('/api/drivers rejects invalid slug with 400', async () => {
    const res = await getDriverCareer(getRequest('/test'), {
      params: Promise.resolve({ driverId: 'HAMILTON' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });

  it('/api/teams rejects invalid slug with 400', async () => {
    const res = await getTeamCareer(getRequest('/test'), {
      params: Promise.resolve({ constructorId: 'red bull' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });
});
