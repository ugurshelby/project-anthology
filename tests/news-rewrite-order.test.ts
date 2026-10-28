import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const incr = vi.fn();
const expire = vi.fn();
vi.mock('@upstash/redis', () => ({
  Redis: class {
    incr = incr;
    expire = expire;
  },
}));

const STORY = [[{ source: 'Motorsport.com', title: 'Antonelli wins in Austin', summary: 'Kimi Antonelli won the race.' }]];

function stubKeys(withVertex: boolean) {
  vi.stubEnv('VERTEX_API_KEY', withVertex ? 'test-vertex' : '');
  vi.stubEnv('GEMINI_API_KEY', 'test-gemini');
  vi.stubEnv('GROQ_API_KEY', 'test-groq');
  vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.test');
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test-token');
}

async function firstCalledHost(): Promise<string[]> {
  const fetchMock = vi.fn(async () => new Response('{}', { status: 500 }));
  vi.stubGlobal('fetch', fetchMock);
  vi.resetModules();
  const { rewriteBatch } = await import('@/lib/news/rewrite');
  await rewriteBatch(STORY, new Set());
  return fetchMock.mock.calls.map((c) => new URL(String((c as unknown[])[0])).host);
}

beforeEach(() => {
  incr.mockReset();
  expire.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('rewrite provider order and Vertex daily cap (9.2)', () => {
  it('calls Vertex first when its key is set and the daily counter allows it', async () => {
    stubKeys(true);
    incr.mockResolvedValue(1);
    const hosts = await firstCalledHost();
    expect(hosts[0]).toBe('aiplatform.googleapis.com');
    expect(hosts[1]).toBe('generativelanguage.googleapis.com');
    expect(expire).toHaveBeenCalledWith(expect.stringMatching(/^apex:llm:vertex:\d{4}-\d{2}-\d{2}$/), 172_800);
  });

  it('starts with Gemini when VERTEX_API_KEY is missing', async () => {
    stubKeys(false);
    const hosts = await firstCalledHost();
    expect(hosts[0]).toBe('generativelanguage.googleapis.com');
    expect(hosts).not.toContain('aiplatform.googleapis.com');
    expect(incr).not.toHaveBeenCalled();
  });

  it('skips Vertex over the daily cap', async () => {
    stubKeys(true);
    const { VERTEX_DAILY_CALL_CAP } = await import('@/lib/news/rewrite');
    incr.mockResolvedValue(VERTEX_DAILY_CALL_CAP + 1);
    const hosts = await firstCalledHost();
    expect(hosts).not.toContain('aiplatform.googleapis.com');
    expect(hosts[0]).toBe('generativelanguage.googleapis.com');
  });

  it('skips Vertex when Redis fails (fails closed on the paid side)', async () => {
    stubKeys(true);
    incr.mockRejectedValue(new Error('redis down'));
    const hosts = await firstCalledHost();
    expect(hosts).not.toContain('aiplatform.googleapis.com');
  });

  it('reports Vertex calls and token usage from usageMetadata', async () => {
    stubKeys(true);
    incr.mockResolvedValue(3);
    const fetchMock = vi.fn(async (url: string) =>
      String(url).includes('aiplatform')
        ? new Response(
            JSON.stringify({
              candidates: [{ content: { parts: [{ text: 'not json' }] } }],
              usageMetadata: { promptTokenCount: 2400, candidatesTokenCount: 1900 },
            }),
            { status: 200 },
          )
        : new Response('{}', { status: 500 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    vi.resetModules();
    const { rewriteBatch } = await import('@/lib/news/rewrite');
    const { vertex } = await rewriteBatch(STORY, new Set());
    expect(vertex).toEqual({ calls: 1, dayCount: 3, promptTokens: 2400, outputTokens: 1900 });
  });
});
