import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Spend limits for the news rewrite (OWASP LLM10, master-plan 14.4). Raising any bound
// here is a deliberate spend decision: change the constant and this test together.

type RewriteModule = typeof import('@/lib/news/rewrite');

const GROQ_MODELS = 2; // default GROQ_NEWS_MODELS
const GEMINI_MODELS = 2; // default GEMINI_NEWS_MODELS

async function load(): Promise<RewriteModule> {
  vi.resetModules();
  return import('@/lib/news/rewrite');
}

const story = [[{ source: 'a', title: 'Title', summary: 'Summary' }]];

beforeEach(() => {
  vi.stubEnv('GROQ_NEWS_MODELS', '');
  vi.stubEnv('GEMINI_NEWS_MODELS', '');
  vi.stubEnv('GROQ_API_KEY', 'test');
  vi.stubEnv('GEMINI_API_KEY', 'test');
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('news rewrite spend limits', () => {
  it('keeps every limit at or under its pinned bound', async () => {
    const m = await load();
    expect(m.REQUEST_TIMEOUT_MS).toBeLessThanOrEqual(25_000);
    expect(m.GROQ_MAX_ATTEMPTS).toBeLessThanOrEqual(2);
    expect(m.GROQ_MAX_RETRY_AFTER_S).toBeLessThanOrEqual(30);
    expect(m.GROQ_RETRY_PAD_MS).toBeLessThanOrEqual(250);
    expect(m.DEADLINE_MARGIN_MS).toBeGreaterThanOrEqual(3_000);
    expect(m.REWRITE_MAX_CHARS.titleEn).toBeLessThanOrEqual(140);
    expect(m.REWRITE_MAX_CHARS.summaryEn).toBeLessThanOrEqual(700);
    expect(m.REWRITE_MAX_CHARS.titleTr).toBeLessThanOrEqual(160);
    expect(m.REWRITE_MAX_CHARS.summaryTr).toBeLessThanOrEqual(800);
    expect(m.enabledProviderCount()).toBe(GROQ_MODELS + GEMINI_MODELS);
  });

  it('makes one request per provider when every provider fails', async () => {
    const m = await load();
    const fetchMock = vi.fn(async () => new Response('err', { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);
    await m.rewriteBatch(story, new Set());
    expect(fetchMock).toHaveBeenCalledTimes(GROQ_MODELS + GEMINI_MODELS);
  });

  it('caps one batch at GROQ_MAX_ATTEMPTS per Groq model plus one per Gemini model', async () => {
    vi.useFakeTimers();
    const m = await load();
    const fetchMock = vi.fn(
      async () => new Response('quota', { status: 429, headers: { 'retry-after': '1' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const run = m.rewriteBatch(story, new Set());
    await vi.runAllTimersAsync();
    const { exhausted } = await run;
    const max = GROQ_MODELS * m.GROQ_MAX_ATTEMPTS + GEMINI_MODELS;
    expect(max).toBe(6);
    expect(fetchMock).toHaveBeenCalledTimes(max);
    expect(exhausted).toHaveLength(GROQ_MODELS + GEMINI_MODELS);
  });

  it('skips providers already out of quota and makes no request past the deadline', async () => {
    const m = await load();
    const fetchMock = vi.fn(async () => new Response('err', { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);
    await m.rewriteBatch(story, new Set(), Date.now() + m.DEADLINE_MARGIN_MS - 1);
    expect(fetchMock).not.toHaveBeenCalled();
    const skip = new Set(['groq:openai/gpt-oss-120b', 'groq:openai/gpt-oss-20b']);
    await m.rewriteBatch(story, skip);
    expect(fetchMock).toHaveBeenCalledTimes(GEMINI_MODELS);
  });
});
