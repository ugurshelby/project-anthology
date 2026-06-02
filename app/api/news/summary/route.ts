import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateNewsSummary } from '@/lib/newsSummary';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface SummaryRequestBody {
  url?: unknown;
  title?: unknown;
  description?: unknown;
}

function toSafeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getClientIP(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

function isAllowedByRateLimit(ip: string): boolean {
  const now = Date.now();

  if (rateLimitStore.size > 1000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetAt <= now) rateLimitStore.delete(key);
    }
  }

  const existing = rateLimitStore.get(ip);
  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (existing.count >= RATE_LIMIT_MAX) return false;
  existing.count += 1;
  return true;
}

function inferSourceName(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<{ summary: string | null }>> {
  try {
    const ip = getClientIP(req);
    if (!isAllowedByRateLimit(ip)) {
      return NextResponse.json({ summary: null }, { status: 200 });
    }

    const body = (await req.json()) as SummaryRequestBody;
    const url = toSafeString(body.url);
    const title = toSafeString(body.title);
    const description = toSafeString(body.description);

    if (!url) {
      return NextResponse.json({ summary: null }, { status: 200 });
    }

    const { data: cached, error: cachedError } = await supabaseAdmin
      .from('news_cache')
      .select('summary')
      .eq('url', url)
      .not('summary', 'is', null)
      .maybeSingle();

    if (!cachedError && cached?.summary) {
      return NextResponse.json({ summary: cached.summary }, { status: 200 });
    }

    const summary = await generateNewsSummary(title, description);

    if (summary !== null) {
      await supabaseAdmin.from('news_cache').upsert(
        {
          url,
          title: title || 'Untitled',
          source: inferSourceName(url),
          description: description || null,
          summary,
        },
        { onConflict: 'url' },
      );
    }

    return NextResponse.json({ summary }, { status: 200 });
  } catch {
    return NextResponse.json({ summary: null }, { status: 200 });
  }
}
