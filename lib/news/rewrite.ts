/**
 * AI rewrite of a story cluster into one original EN + TR brief.
 *
 * Providers, tried in order: Vertex AI (VERTEX_API_KEY, paid from the GCP credit,
 * capped per UTC day in Upstash Redis) → Gemini free tier (GEMINI_API_KEY) → Groq
 * (GROQ_API_KEY). A provider without its key is skipped, so without VERTEX_API_KEY the
 * chain is the free one. Called ONLY from the sync-news cron — never per page view.
 * Every accepted brief passes the copy guard and the headline fact guard (lib/news/factGuard.ts).
 * Returns null when no provider is configured/available or the output fails
 * validation; callers then keep the best source's own title/summary.
 */

import { Redis } from '@upstash/redis';
import { headlineFactsInSources } from '@/lib/news/factGuard';
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

// ── Spend limits (OWASP LLM10) ─────────────────────────────────────────────
// Every bound on how much one rewriteBatch call can ask of a provider lives here;
// tests/news-rewrite-limits.test.ts pins them. Stories per request and per run are
// capped by the caller (lib/news/stories.ts).

/** Abort a provider request after this long. */
export const REQUEST_TIMEOUT_MS = 25_000;
/** HTTP requests per Groq model per batch: the first try plus one retry after a short 429. */
export const GROQ_MAX_ATTEMPTS = 2;
/** Longest Groq `retry-after` (seconds) worth waiting for; longer means the daily quota is spent. */
export const GROQ_MAX_RETRY_AFTER_S = 30;
/** Extra wait on top of Groq's `retry-after`. */
export const GROQ_RETRY_PAD_MS = 250;
/** No new provider request starts when fewer than this many ms remain before the deadline. */
export const DEADLINE_MARGIN_MS = 3_000;
/** Longest accepted model output per field (characters); longer output is rejected. */
export const REWRITE_MAX_CHARS = { titleEn: 140, summaryEn: 700, titleTr: 160, summaryTr: 800 } as const;
/**
 * Vertex AI requests per UTC day across all runs. The GCP project is shared with other apps, so the
 * spend guard lives here (DECISIONS 2026-10-27; 9.4 2026-10-28: 2 x the measured peak of ~8-10/day).
 */
export const VERTEX_DAILY_CALL_CAP = 16;
/** Redis key TTL for the daily counter: two days, so yesterday's count is still readable. */
const VERTEX_COUNTER_TTL_S = 172_800;

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
    'Accuracy and language rules (they override style):',
    '- Keep who did what to whom exactly as the sources say; never swap subject and object, never change a number, never add a name the sources do not mention.',
    '- "the sport" means Formula 1: write "Formula 1" / "F1", never "Sport".',
    '- Both headlines use sentence case (only the first word and proper names capitalised), never Title Case.',
    `- Turkish: attach suffixes to foreign names with an apostrophe and vowel harmony as pronounced ("Austin'de", "Perez'in"); translate every English word into Turkish (or explain it briefly). Established F1 terms (pole, pit stop, DRS, FP1) may stay; "qualifying" is "sıralama turları", never "nitelik".`,
    '',
    `There are ${stories.length} independent stories below. Write one brief per story.`,
    'same_story only applies to stories with several sources; for a story with a single source always return true.',
    'Return strict JSON only, an array with exactly one object per story, in order:',
    '[{"story":0,"same_story":true|false,"title_en":"<=90 chars","summary_en":"2-3 sentences","title_tr":"natural Turkish headline","summary_tr":"2-3 Turkish sentences"}]',
    '',
    blocks,
  ].join('\n');
}

/** Thrown when a provider says its free quota is spent (HTTP 429) — skip it for the rest of the run. */
class QuotaError extends Error {}

/** Vertex usage of one rewriteBatch call (the 9.7 cost check reads it from the sync-news response). */
export interface VertexUsage {
  calls: number;
  /** Today's counter after the last claim; null when no claim was made. */
  dayCount: number | null;
  promptTokens: number;
  outputTokens: number;
}

function emptyVertexUsage(): VertexUsage {
  return { calls: 0, dayCount: null, promptTokens: 0, outputTokens: 0 };
}

/**
 * Counts one Vertex request for today (`apex:llm:vertex:<UTC YYYY-MM-DD>`). Not allowed when the
 * count passes VERTEX_DAILY_CALL_CAP, or when Redis is missing or fails: on the paid side the
 * guard fails closed and the free tiers take over.
 */
export async function claimVertexCall(now = new Date()): Promise<{ allowed: boolean; dayCount: number | null }> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return { allowed: false, dayCount: null };
  try {
    const redis = new Redis({ url, token });
    const key = `apex:llm:vertex:${now.toISOString().slice(0, 10)}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, VERTEX_COUNTER_TTL_S);
    return { allowed: count <= VERTEX_DAILY_CALL_CAP, dayCount: count };
  } catch {
    return { allowed: false, dayCount: null };
  }
}

const GEMINI_MODELS = (process.env.GEMINI_NEWS_MODELS?.trim() || 'gemini-3.5-flash-lite,gemini-3.8-flash')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

interface Provider {
  id: string;
  enabled: () => boolean;
  call: (prompt: string, usage: VertexUsage) => Promise<string | null>;
}

// Vertex AI express mode (API key, global endpoint), read 2026-10-28 from Google's express mode
// samples: POST https://aiplatform.googleapis.com/v1/publishers/google/models/<model>:generateContent,
// same body as the Gemini API. The key goes in a header, never in the URL.
const VERTEX_MODELS = (process.env.VERTEX_NEWS_MODELS?.trim() || 'gemini-2.5-flash')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

function vertexProvider(model: string): Provider {
  return {
    id: `vertex:${model}`,
    enabled: () => Boolean(process.env.VERTEX_API_KEY?.trim()),
    call: async (prompt, usage) => {
      const claim = await claimVertexCall();
      usage.dayCount = claim.dayCount;
      if (!claim.allowed) throw new QuotaError(model); // over the daily cap or no counter: skip for the run
      usage.calls += 1;
      const res = await fetch(
        `https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.VERTEX_API_KEY!.trim() },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        },
      );
      if (res.status === 429) throw new QuotaError(model);
      if (!res.ok) {
        // Status only: a 403 here is a key restriction or a disabled API, worth seeing in the logs.
        console.warn(`[rewrite] vertex ${model} HTTP ${res.status}`);
        return null;
      }
      const json = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
      };
      usage.promptTokens += json.usageMetadata?.promptTokenCount ?? 0;
      usage.outputTokens += json.usageMetadata?.candidatesTokenCount ?? 0;
      return json.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    },
  };
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

const GROQ_MODELS = (process.env.GROQ_NEWS_MODELS?.trim() || 'openai/gpt-oss-120b,openai/gpt-oss-20b')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

/** Groq free tier: ~8K tokens/minute per model, 1K requests + 200K tokens per day. */
function groqProvider(model: string): Provider {
  return {
    id: `groq:${model}`,
    enabled: () => Boolean(process.env.GROQ_API_KEY?.trim()),
    call: async (prompt) => {
      for (let attempt = 0; attempt < GROQ_MAX_ATTEMPTS; attempt++) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY!.trim()}` },
          body: JSON.stringify({
            model,
            temperature: 0.4,
            reasoning_effort: 'low',
            response_format: { type: 'json_object' },
            messages: [{ role: 'user', content: prompt }],
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (res.status === 429) {
          // Per-minute token limit resets within seconds → wait once and retry; a long wait means the daily cap.
          const retryAfter = Number(res.headers.get('retry-after'));
          if (
            attempt < GROQ_MAX_ATTEMPTS - 1 &&
            Number.isFinite(retryAfter) &&
            retryAfter > 0 &&
            retryAfter <= GROQ_MAX_RETRY_AFTER_S
          ) {
            await new Promise((r) => setTimeout(r, retryAfter * 1000 + GROQ_RETRY_PAD_MS));
            continue;
          }
          throw new QuotaError(model);
        }
        if (!res.ok) return null;
        const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
        return json.choices?.[0]?.message?.content ?? null;
      }
      return null;
    },
  };
}

/**
 * Provider order (owner decision 2026-10-26, master-plan 9.2): Vertex (paid, capped) -> Gemini free
 * tier -> Groq. Every free model has its OWN quota, so the chain multiplies capacity.
 */
const PROVIDERS: Provider[] = [
  ...VERTEX_MODELS.map(vertexProvider),
  ...GEMINI_MODELS.map(geminiProvider),
  ...GROQ_MODELS.map(groqProvider),
];

export function enabledProviderCount(): number {
  return PROVIDERS.filter((p) => p.enabled()).length;
}

export function aiRewriteConfigured(): boolean {
  return PROVIDERS.some((p) => p.enabled());
}

// ── Copyright guard ────────────────────────────────────────────────────────

const SHINGLE = 7; // 7+ identical consecutive words = copying; shorter runs are names/stock phrases

function words(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

/** True when `out` contains a run of 7+ consecutive words that also appears in any source. */
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
  // A single-source story cannot be "split" — only multi-outlet clusters are checked.
  if (j.same_story === false && sources.length > 1) return 'split';
  const str = (k: string, max: number) =>
    typeof j[k] === 'string' && (j[k] as string).trim().length > 0 && (j[k] as string).length <= max
      ? (j[k] as string).trim()
      : null;
  const titleEn = str('title_en', REWRITE_MAX_CHARS.titleEn);
  const summaryEn = str('summary_en', REWRITE_MAX_CHARS.summaryEn);
  const titleTr = str('title_tr', REWRITE_MAX_CHARS.titleTr);
  const summaryTr = str('summary_tr', REWRITE_MAX_CHARS.summaryTr);
  if (!titleEn || !summaryEn || !titleTr || !summaryTr) return null;
  if (copiesSource(`${titleEn}. ${summaryEn}`, sources)) return null;
  // Fact guard (19.2): a number or F1 name in either headline that the sources lack → reject, next provider tries.
  if (!headlineFactsInSources(titleEn, sources) || !headlineFactsInSources(titleTr, sources)) return null;
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
  vertex: VertexUsage;
}

/**
 * Rewrite several stories in ONE request (free quotas count requests, so batching multiplies
 * capacity). Tries providers in order; a story that fails validation with one provider is retried
 * with the next. `skip` carries providers already known to be out of quota.
 */
export async function rewriteBatch(
  stories: RewriteSource[][],
  skip: Set<string>,
  deadlineMs = Number.POSITIVE_INFINITY,
): Promise<BatchResult> {
  const results: Array<Rewrite | 'split' | null> = stories.map(() => null);
  const vertex = emptyVertexUsage();
  for (const provider of PROVIDERS) {
    if (skip.has(provider.id) || !provider.enabled()) continue;
    if (Date.now() + DEADLINE_MARGIN_MS >= deadlineMs) break; // out of time budget — leave the rest for the next run
    const todo = results.map((r, i) => (r === null ? i : -1)).filter((i) => i >= 0);
    if (todo.length === 0) break;
    try {
      const raw = await provider.call(buildPrompt(todo.map((i) => stories[i])), vertex);
      if (!raw) continue;
      parseBatch(raw, todo.map((i) => stories[i])).forEach((r, k) => {
        if (r) results[todo[k]] = r;
      });
    } catch (err) {
      if (err instanceof QuotaError) skip.add(provider.id);
    }
  }
  return { results, exhausted: [...skip], vertex };
}
