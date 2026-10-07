/**
 * Audits the story images against their source records and (re)writes the owner's worklist.
 *
 *   npm run stories:credits            print the summary and what is still unverified
 *   npm run stories:credits -- --write also rewrite docs/reference/hikaye-gorselleri-kaynak-listesi.md
 *
 * Read-only apart from that one doc. Loads no env file and needs no network.
 */

import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { storyContent } from '../data/stories/content';
import { STORY_IMAGE_CREDITS } from '../data/stories/image-credits';

const ROOT = process.cwd();
const DOC = join(ROOT, 'docs', 'reference', 'hikaye-gorselleri-kaynak-listesi.md');

interface Slot {
  slug: string;
  title: string;
  role: 'Kapak' | 'Gövde';
  src: string;
  caption: string;
}

function collectSlots(): Slot[] {
  const out: Slot[] = [];
  for (const s of storyContent) {
    out.push({ slug: s.slug, title: s.title, role: 'Kapak', src: s.heroImage, caption: '' });
    for (const b of s.blocks) {
      if (b.type === 'image' && b.src) out.push({ slug: s.slug, title: s.title, role: 'Gövde', src: b.src, caption: b.caption ?? '' });
    }
  }
  return out;
}

function filesOnDisk(): string[] {
  const base = join(ROOT, 'public', 'stories');
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
  return walk(base).map((f) => `/stories/${relative(base, f).split(sep).join('/')}`).sort();
}

function cell(text: string): string {
  return text.replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
}

function renderDoc(slots: Slot[]): string {
  const entries = Object.entries(STORY_IMAGE_CREDITS);
  const unverified = entries.filter(([, c]) => c.status === 'unverified');
  const canva = unverified.filter(([, c]) => /Canva export/.test(c.hint ?? '')).length;
  const raw = unverified.filter(([, c]) => /raw web file/.test(c.hint ?? '')).length;
  const lines: string[] = [
    '# Hikâye görselleri — kaynağı doğrulanacak liste',
    '',
    `Üretildi: \`npm run stories:credits -- --write\` (${new Date().toISOString().slice(0, 10)}). Kaynak kaydı: \`data/stories/image-credits.ts\`.`,
    '',
    `Durum: **${entries.length} görsel, ${entries.length - unverified.length} kaynaklı, ${unverified.length} kaynağı doğrulanmamış.**`,
    '',
    '## Kurallar (sahip kararı, 2026-10-07)',
    '',
    '- Hikâye görselleri **gerçek fotoğraf** olmalı: yapay zekâ ile üretilmiş veya SVG/çizim olamaz.',
    '- Sayfada ticari olmayan, editoryal kullanım belirtilir; kaynağı bilinen görselde kaynak adı yazılır ve görsel özgün sayfaya bağlanır.',
    '- Kaynağı bulunamayan görsel lisansı doğrulanamayan, yani **riskli** görseldir; aşağıdaki listede durur.',
    '',
    '## Elimizdeki bilgi',
    '',
    `- ${canva} görsel Canva dışa aktarımı (Ocak 2026; tasarım adı ve tarih gömülü). Dosyada yazar, kaynak veya lisans yok; asıl fotoğrafın nereden geldiği kayıtlı değil.`,
    `- ${raw} görsel 2026-09-17'de ham web dosyası olarak eklendi; yalnızca özgün dosya adı kayıtlı (arama ipucu). Gömülü üstveri yok.`,
    '- Üstveri taraması (56 dosya, EXIF/IPTC/XMP): telif, kaynak veya lisans alanı yok; tek yazar alanı Canva hesabının adıdır (fotoğrafçı değil).',
    '- Aynı içeriğin iki yolda durduğu 6 çift var (`full/01.png` = `landscape/01.png`); biri doğrulanınca ikisine de yazılır.',
    '',
    '## Nasıl doldurulur',
    '',
    "`data/stories/image-credits.ts` içinde ilgili satırı şu biçime çevirin (ipucu satırı kalabilir), sonra `npm run stories:credits -- --write` ile bu listeyi yenileyin:",
    '',
    '```ts',
    "'/stories/brawn-2009/landscape/01.png': {",
    "  status: 'sourced', sourceUrl: 'https://…', sourceName: 'Wikimedia Commons', author: 'Ad Soyad', license: 'CC BY-SA 4.0',",
    '},',
    '```',
    '',
    'Kaynağı bulunamayan görseli ya yeni bir görselle değiştirin ya da hikâyeden çıkarın; `unverified` olarak kalırsa sayfada kaynak satırı çıkmaz, yalnızca genel editoryal kullanım notu görünür.',
    '',
  ];

  const bySlug = new Map<string, Slot[]>();
  for (const s of slots) bySlug.set(s.slug, [...(bySlug.get(s.slug) ?? []), s]);
  for (const [slug, list] of bySlug) {
    lines.push(`## ${list[0]!.title} (\`${slug}\`)`, '', '| Konum | Dosya | Altyazı | Bilinenler | Durum |', '|---|---|---|---|---|');
    const seen = new Set<string>();
    for (const s of list) {
      if (seen.has(s.src)) continue;
      seen.add(s.src);
      const credit = STORY_IMAGE_CREDITS[s.src];
      const known = credit?.hint ?? '';
      const status = credit?.status === 'sourced' ? `kaynaklı: ${cell(credit.sourceName)}` : '**doğrulanacak**';
      lines.push(`| ${s.role} | \`${s.src.replace('/stories/', '')}\` | ${cell(s.caption) || '—'} | ${cell(known)} | ${status} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function main(): void {
  const slots = collectSlots();
  const used = new Set(slots.map((s) => s.src));
  const disk = filesOnDisk();
  const entries = Object.entries(STORY_IMAGE_CREDITS);
  const problems: string[] = [];
  for (const f of disk) if (!STORY_IMAGE_CREDITS[f]) problems.push(`no credit record: ${f}`);
  for (const [src] of entries) if (!existsSync(join(ROOT, 'public', src))) problems.push(`record without file: ${src}`);
  for (const src of used) if (!existsSync(join(ROOT, 'public', src))) problems.push(`content.ts references a missing file: ${src}`);
  for (const src of used) if (/\.svg$/i.test(src)) problems.push(`story image must be a photograph, not SVG: ${src}`);

  const unverified = entries.filter(([, c]) => c.status === 'unverified');
  console.log(`${entries.length} images on record, ${entries.length - unverified.length} sourced, ${unverified.length} unverified; ${used.size} used by content.ts.`);
  for (const p of problems) console.error(`PROBLEM ${p}`);

  if (process.argv.includes('--write')) {
    writeFileSync(DOC, renderDoc(slots));
    console.log(`wrote ${relative(ROOT, DOC)}`);
  }
  if (problems.length > 0) process.exit(1);
}

main();
