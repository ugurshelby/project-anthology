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

function buildPrompt(sources: RewriteSource[]): string {
  const list = sources
    .map((s, i) => `[${i + 1}] ${s.source}\nTitle: ${s.title}\nSummary: ${s.summary}`)
    .join('\n\n');
  return [
    NEWS_VOICE,
    '',
    'Return strict JSON only:',
    '{"same_story":true|false,"title_en":"<=90 chars","summary_en":"2-3 sentences","title_tr":"natural Turkish headline","summary_tr":"2-3 Turkish sentences"}',
    '',
    'Sources:',
    list,
  ].join('\n');
}

async function callGemini(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  const model = process.env.GEMINI_NEWS_MODEL?.trim() || 'gemini-2.5-flash';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

async function callGroq(prompt: string): Promise<string | null> {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) return null;
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.GROQ_NEWS_MODEL?.trim() || 'llama-3.3-70b-versatile',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? null;
}

export function aiRewriteConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim() || process.env.GROQ_API_KEY?.trim());
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
export function parseRewrite(raw: string, sources: RewriteSource[]): Rewrite | 'split' | null {
  let j: Record<string, unknown>;
  try {
    j = JSON.parse(raw.replace(/^```(?:json)?|```$/gm, '').trim());
  } catch {
    return null;
  }
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

/** Rewrite one story; tries each configured provider once, first valid output wins. */
export async function rewriteStory(sources: RewriteSource[]): Promise<Rewrite | 'split' | null> {
  const prompt = buildPrompt(sources);
  for (const call of [callGemini, callGroq]) {
    try {
      const raw = await call(prompt);
      if (!raw) continue;
      const parsed = parseRewrite(raw, sources);
      if (parsed) return parsed;
    } catch {
      /* try next provider */
    }
  }
  return null;
}
