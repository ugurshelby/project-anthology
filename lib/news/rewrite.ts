/**
 * AI rewrite of a story cluster into one original EN + TR brief.
 *
 * Free-tier providers only, tried in order: Gemini (GEMINI_API_KEY) → Groq
 * (GROQ_API_KEY). Called ONLY from the sync-news cron — never per page view.
 * Returns null when no provider is configured/available or the output fails
 * validation; callers then keep the best source's own title/summary.
 */

import { NEWS_VOICE } from '@/lib/news/voice';

export interface RewriteSource {
  source: string;
  title: string;
  summary: string;
}

export interface Rewrite {
  titleEn: string;
  summaryEn: string;
  titleTr: string;
  summaryTr: string;
}

const REQUEST_TIMEOUT_MS = 25_000;

function buildPrompt(stories: RewriteSource[][]): string {
  const blocks = stories
    .map(
      (sources, n) =>
        `=== STORY ${n} ===\n` +
        sources.map((s, i) => `[${i + 1}] ${s.source}\nTitle: ${s.title}\nSummary: ${s.summary}`).join('\n\n'),
    )
    .join('\n\n');
  return [
    NEWS_VOICE,
    '',
    `There are ${stories.length} independent stories below. Write one brief per story.`,
    'Return strict JSON only, an array with exactly one object per story, in order:',
    '[{"story":0,"same_story":true|false,"title_en":"<=90 chars","summary_en":"2-3 sentences","title_tr":"natural Turkish headline","summary_tr":"2-3 Turkish sentences"}]',
    '',
    blocks,
  ].join('\n');
}

/** Thrown when a provider says its free quota is spent (HTTP 429) — skip it for the rest of the run. */
class QuotaError extends Error {}

const GEMINI_MODELS = (process.env.GEMINI_NEWS_MODELS?.trim() || 'gemini-2.5-flash-lite,gemini-2.5-flash')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

interface Provider {
  id: string;
  enabled: () => boolean;
  call: (prompt: string) => Promise<string | null>;
}

function geminiProvider(model: string): Provider {
  return {
    id: `gemini:${model}`,
    enabled: () => Boolean(process.env.GEMINI_API_KEY?.trim()),
    call: async (prompt) => {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY!.trim() },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        },
      );
      if (res.status === 429) throw new QuotaError(model);
      if (!res.ok) return null;
      const json = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      return json.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    },
  };
}

const groqProvider: Provider = {
  id: 'groq',
  enabled: () => Boolean(process.env.GROQ_API_KEY?.trim()),
  call: async (prompt) => {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY!.trim()}` },
      body: JSON.stringify({
        model: process.env.GROQ_NEWS_MODEL?.trim() || 'llama-3.3-70b-versatile',
        temperature: 0.4,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (res.status === 429) throw new QuotaError('groq');
    if (!res.ok) return null;
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return json.choices?.[0]?.message?.content ?? null;
  },
};

/** Provider order: each Gemini model has its OWN free quota, so the chain multiplies daily capacity. */
const PROVIDERS: Provider[] = [...GEMINI_MODELS.map(geminiProvider), groqProvider];

export function aiRewriteConfigured(): boolean {
  return PROVIDERS.some((p) => p.enabled());
}

// ── Copyright guard ────────────────────────────────────────────────────────

const SHINGLE = 5;

function words(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

/** True when `out` contains a run of 5+ consecutive words that also appears in any source. */
export function copiesSource(out: string, sources: RewriteSource[]): boolean {
  const ow = words(out);
  if (ow.length < SHINGLE) return false;
  const seen = new Set<string>();
  for (const s of sources) {
    const sw = words(`${s.title} ${s.summary}`);
    for (let i = 0; i + SHINGLE <= sw.length; i++) seen.add(sw.slice(i, i + SHINGLE).join(' '));
  }
  for (let i = 0; i + SHINGLE <= ow.length; i++) {
    if (seen.has(ow.slice(i, i + SHINGLE).join(' '))) return true;
  }
  return false;
}

/** 'split' = the model says the sources are different events. */
export function parseRewriteItem(j: Record<string, unknown> | undefined, sources: RewriteSource[]): Rewrite | 'split' | null {
  if (!j || typeof j !== 'object') return null;
  if (j.same_story === false) return 'split';
  const str = (k: string, max: number) =>
    typeof j[k] === 'string' && (j[k] as string).trim().length > 0 && (j[k] as string).length <= max
      ? (j[k] as string).trim()
      : null;
  const titleEn = str('title_en', 140);
  const summaryEn = str('summary_en', 700);
  const titleTr = str('title_tr', 160);
  const summaryTr = str('summary_tr', 800);
  if (!titleEn || !summaryEn || !titleTr || !summaryTr) return null;
  if (copiesSource(`${titleEn}. ${summaryEn}`, sources)) return null;
  return { titleEn, summaryEn, titleTr, summaryTr };
}

/** Parse a batch response (JSON array, or a single object for a 1-story batch) into per-story results. */
export function parseBatch(raw: string, stories: RewriteSource[][]): Array<Rewrite | 'split' | null> {
  let j: unknown;
  try {
    j = JSON.parse(raw.replace(/^```(?:json)?|```$/gm, '').trim());
  } catch {
    return stories.map(() => null);
  }
  const arr = Array.isArray(j) ? j : [j];
  return stories.map((sources, n) => {
    const item = (arr.find((x) => (x as { story?: number })?.story === n) ?? arr[n]) as
      | Record<string, unknown>
      | undefined;
    return parseRewriteItem(item, sources);
  });
}

export interface BatchResult {
  results: Array<Rewrite | 'split' | null>;
  /** Providers that reported "quota spent" during this call (they stay skipped for the run). */
  exhausted: string[];
}

/**
 * Rewrite several stories in ONE request (free quotas count requests, so batching multiplies
 * capacity). Tries providers in order; a story that fails validation with one provider is retried
 * with the next. `skip` carries providers already known to be out of quota.
 */
export async function rewriteBatch(stories: RewriteSource[][], skip: Set<string>): Promise<BatchResult> {
  const results: Array<Rewrite | 'split' | null> = stories.map(() => null);
  for (const provider of PROVIDERS) {
    if (skip.has(provider.id) || !provider.enabled()) continue;
    const todo = results.map((r, i) => (r === null ? i : -1)).filter((i) => i >= 0);
    if (todo.length === 0) break;
    try {
      const raw = await provider.call(buildPrompt(todo.map((i) => stories[i])));
      if (!raw) continue;
      parseBatch(raw, todo.map((i) => stories[i])).forEach((r, k) => {
        if (r) results[todo[k]] = r;
      });
    } catch (err) {
      if (err instanceof QuotaError) skip.add(provider.id);
    }
  }
  return { results, exhausted: [...skip] };
}
