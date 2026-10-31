/**
 * Apex — ekran görüntüsü vision denetimi (master-plan 15.1)
 *
 * 'screenshots/<sayfa-id>/<cihaz>-viewport.png' dosyalarını Vertex AI'a (VERTEX_API_KEY, GCP kredisi) ya da
 * yoksa Gemini API'ye (GEMINI_API_KEY, ücretsiz katman)
 * dört ölçütle (düzen, bileşen, tipografi, görsel kadraj) gönderir ve
 * 'screenshots/<sayfa-id>/audit-report.md' yazar.
 *
 * Kullanım:
 *   npx tsx scripts/audit-screenshots.ts --dry-run
 *   npx tsx --env-file=.env.local scripts/audit-screenshots.ts [--page <id>] [--max-requests 48]
 *
 * tsx `.env.local`'ı kendiliğinden okumaz: anahtar `--env-file` ile gelir. Gerçek koşuyu sahip yapar
 * (ajanlar gerçek env yüklemez). --dry-run env gerektirmez.
 */

import * as fs from 'fs';
import * as path from 'path';

export const SCREENSHOTS_DIR = path.resolve(process.cwd(), 'screenshots');
export const DEFAULT_MAX_REQUESTS = 48;
export const DEVICES = ['desktop', 'tablet', 'mobile'] as const;
export type Device = (typeof DEVICES)[number];
export interface Provider {
  name: 'vertex' | 'gemini';
  model: string;
  url: string;
  key: string;
}

/** Vertex first (credit, 9.4), the free Gemini tier otherwise; null when neither key is set. */
export function pickProvider(env: Record<string, string | undefined>): Provider | null {
  const vertex = env.VERTEX_API_KEY?.trim();
  if (vertex) {
    const model = env.VERTEX_AUDIT_MODEL?.trim() || 'gemini-2.5-flash';
    return { name: 'vertex', model, key: vertex, url: `https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent` };
  }
  const gemini = env.GEMINI_API_KEY?.trim();
  if (gemini) {
    const model = 'gemini-3.8-flash';
    return { name: 'gemini', model, key: gemini, url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent` };
  }
  return null;
}

export const CRITERIA = [
  { id: 'layout', label: 'Düzen', ask: 'grid/hizalama, boşluklar, taşma, kırpılma, görsel hiyerarşi' },
  { id: 'components', label: 'Bileşen', ask: 'kart/buton/gezinme tutarlılığı, boş-hata-yükleniyor durumları, odak görünürlüğü' },
  { id: 'typography', label: 'Tipografi', ask: 'okunabilirlik, boyut ölçeği, satır uzunluğu, kontrast (WCAG AA)' },
  { id: 'image-framing', label: 'Görsel kadraj', ask: 'fotoğraf kadrajı, en-boy oranı, bozulma, kırık veya eksik görsel' },
] as const;

export interface Target {
  pageId: string;
  device: Device;
  file: string;
}

export function reportPath(pageId: string, dir: string = SCREENSHOTS_DIR): string {
  return path.join(dir, pageId, 'audit-report.md');
}

export function listTargets(dir: string = SCREENSHOTS_DIR, onlyPage?: string): Target[] {
  if (!fs.existsSync(dir)) return [];
  const pages = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && (!onlyPage || e.name === onlyPage))
    .map((e) => e.name)
    .sort();
  const out: Target[] = [];
  for (const pageId of pages) {
    for (const device of DEVICES) {
      const file = path.join(dir, pageId, `${device}-viewport.png`);
      if (fs.existsSync(file)) out.push({ pageId, device, file });
    }
  }
  return out;
}

export function buildPrompt(pageId: string, device: Device): string {
  const lines = CRITERIA.map((c, i) => `${i + 1}. ${c.label} (${c.id}): ${c.ask}`);
  return [
    `Bu, Apex (resmî olmayan bir Formula 1 arşiv sitesi) "${pageId}" sayfasının ${device} görünümünün ekran görüntüsüdür.`,
    'Aşağıdaki dört ölçüte göre denetle:',
    ...lines,
    'Her ölçüt için başlık altında en fazla 3 somut bulgu yaz (ne, nerede, önerilen düzeltme); sorun yoksa "Sorun yok" yaz.',
    'Görmediğin şeyi uydurma. Yanıtı Türkçe, Markdown olarak ver.',
  ].join('\n');
}

export interface Args {
  dryRun: boolean;
  page?: string;
  maxRequests: number;
}

export function parseArgs(argv: string[]): Args {
  const args: Args = { dryRun: false, maxRequests: DEFAULT_MAX_REQUESTS };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--page') args.page = argv[++i];
    else if (a === '--max-requests') {
      const n = Number(argv[++i]);
      if (!Number.isInteger(n) || n < 0) throw new Error('--max-requests must be a non-negative integer');
      args.maxRequests = n;
    }
  }
  return args;
}

async function auditOne(target: Target, provider: Provider): Promise<string> {
  const image = fs.readFileSync(target.file).toString('base64');
  const res = await fetch(
    provider.url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': provider.key },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: buildPrompt(target.pageId, target.device) },
              { inlineData: { mimeType: 'image/png', data: image } },
            ],
          },
        ],
      }),
    },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim() || '(boş yanıt)';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const all = listTargets(SCREENSHOTS_DIR, args.page);
  const targets = all.slice(0, args.maxRequests);

  console.log(`${targets.length} hedef (bulunan ${all.length}, tavan ${args.maxRequests})${args.dryRun ? ' [dry-run]' : ''}`);
  if (args.dryRun) {
    for (const t of targets) console.log(`- ${t.pageId}/${t.device}-viewport.png -> ${reportPath(t.pageId)}`);
    return;
  }

  const provider = pickProvider(process.env);
  if (!provider) {
    console.error('VERTEX_API_KEY ya da GEMINI_API_KEY tanımlı değil. Çalıştırma: npx tsx --env-file=.env.local scripts/audit-screenshots.ts');
    process.exitCode = 1;
    return;
  }
  console.log(`Sağlayıcı: ${provider.name} (${provider.model})`);

  const byPage = new Map<string, string[]>();
  let requests = 0;
  for (const t of targets) {
    requests++;
    let body: string;
    try {
      body = await auditOne(t, provider);
    } catch (e) {
      body = `_İstek başarısız: ${e instanceof Error ? e.message : 'bilinmeyen hata'}_`;
    }
    byPage.set(t.pageId, [...(byPage.get(t.pageId) ?? []), `## ${t.device}\n\n${body}\n`]);
    console.log(`${requests}/${targets.length} ${t.pageId} ${t.device}`);
  }
  for (const [pageId, sections] of byPage) {
    fs.writeFileSync(reportPath(pageId), `# Denetim raporu: ${pageId}\n\nModel: ${provider.name} ${provider.model}\n\n${sections.join('\n')}`);
  }
  console.log(`${requests} istek, ${byPage.size} rapor yazıldı.`);
}

if (process.argv[1] && /audit-screenshots\.ts$/.test(process.argv[1].replace(/\\/g, '/'))) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
