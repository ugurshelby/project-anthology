import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterAll, describe, expect, it } from 'vitest';
import { buildPrompt, CRITERIA, listTargets, parseArgs, pickProvider, reportPath } from '../scripts/audit-screenshots';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-shots-'));
for (const page of ['b-page', 'a-page']) {
  fs.mkdirSync(path.join(tmp, page));
  for (const d of ['desktop', 'tablet', 'mobile']) {
    fs.writeFileSync(path.join(tmp, page, `${d}-viewport.png`), '');
    fs.writeFileSync(path.join(tmp, page, `${d}-full.png`), '');
  }
}
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe('audit-screenshots helpers', () => {
  it('lists only viewport files, sorted by page', () => {
    const t = listTargets(tmp);
    expect(t).toHaveLength(6);
    expect(t[0]).toMatchObject({ pageId: 'a-page', device: 'desktop' });
    expect(t.every((x) => x.file.endsWith('-viewport.png'))).toBe(true);
  });

  it('filters by page and tolerates a missing dir', () => {
    expect(listTargets(tmp, 'b-page')).toHaveLength(3);
    expect(listTargets(path.join(tmp, 'nope'))).toEqual([]);
  });

  it('builds a prompt covering all four criteria', () => {
    const p = buildPrompt('01-ana-sayfa', 'mobile');
    expect(p).toContain('01-ana-sayfa');
    expect(p).toContain('mobile');
    for (const c of CRITERIA) expect(p).toContain(c.label);
  });

  it('resolves the report path per page', () => {
    expect(reportPath('x', tmp)).toBe(path.join(tmp, 'x', 'audit-report.md'));
  });

  it('parses flags with a default cap of 48', () => {
    expect(parseArgs([])).toEqual({ dryRun: false, maxRequests: 48 });
    expect(parseArgs(['--dry-run', '--page', 'p', '--max-requests', '5'])).toEqual({
      dryRun: true,
      page: 'p',
      maxRequests: 5,
    });
    expect(() => parseArgs(['--max-requests', 'x'])).toThrow();
  });
});

describe('pickProvider', () => {
  it('prefers the Vertex key, falls back to Gemini, else null', () => {
    const v = pickProvider({ VERTEX_API_KEY: ' v ', GEMINI_API_KEY: 'g' });
    expect(v?.name).toBe('vertex');
    expect(v?.key).toBe('v');
    expect(v?.url).toBe('https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash:generateContent');
    expect(pickProvider({ VERTEX_API_KEY: 'v', VERTEX_AUDIT_MODEL: 'gemini-x' })?.model).toBe('gemini-x');
    expect(pickProvider({ GEMINI_API_KEY: 'g' })?.name).toBe('gemini');
    expect(pickProvider({ VERTEX_API_KEY: '  ' })).toBeNull();
  });
});
