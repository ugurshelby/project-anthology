import type { Story } from '@/lib/data/stories';

function tokensFromHints(hints: Array<string | null | undefined> | string | null | undefined): string[] {
  const raw = Array.isArray(hints) ? hints.filter(Boolean).join(' ') : (hints ?? '');
  return raw
    .toLowerCase()
    .replace(/grand prix/g, ' ')
    .split(/[\s/-]+/)
    .filter((t) => t.length >= 4);
}

/** Prefer a long-read that mentions the upcoming race or circuit; else the first published story. */
export function pickWeekendStory(
  stories: Story[],
  hints?: Array<string | null | undefined> | string | null,
): Story | null {
  if (stories.length === 0) return null;
  const tokens = tokensFromHints(hints);
  if (tokens.length > 0) {
    const hit = stories.find((s) => {
      const hay = `${s.title} ${s.subtitle} ${s.slug}`.toLowerCase();
      return tokens.some((t) => hay.includes(t));
    });
    if (hit) return hit;
  }
  return stories[0] ?? null;
}
