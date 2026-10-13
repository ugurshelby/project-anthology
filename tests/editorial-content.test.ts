import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getDriverLore, type DriverLoreText } from '@/data/drivers';
import { getTeamLore, type TeamLoreText } from '@/data/teams';
import { CIRCUIT_FACTS } from '@/data/circuits/facts';
import { CIRCUIT_FACTS_TR } from '@/data/circuits/facts.tr';
import { CIRCUIT_LORE } from '@/data/circuits/lore';
import { getConstructorRecord, getDriverRecord, resolveConstructorId, resolveDriverId } from '@/lib/history/store';
import { buildTeamDna } from '@/lib/history/dna';
import { CURRENT_SEASON } from '@/lib/f1Calendar';

/**
 * Review gate for the editorial profiles (plan Faz 11, 11.4 "Doğrulanmış Olgu
 * Disiplini"; style guide docs/F1_Anlati_Stil_Kilavuzu.md §9.3 and §16):
 * both languages complete, no cliché / AI-template phrases, direct quotes carry
 * a source, and the hard facts the prose states (birth year, title years, first
 * season) agree with the F1DB history index.
 */

const src = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
const ids = (file: string, key: string) => [...src(file).matchAll(new RegExp(`${key}: '([^']+)'`, 'g'))].map((m) => m[1]);

const DRIVER_IDS = ids('data/drivers/index.ts', 'driverId');
const TEAM_IDS = ids('data/teams/index.ts', 'constructorId');

/** Style guide §9.3 blacklist + AI-template words named in plan Faz 11 "Kritik Kısıtlar". */
const BANNED_EN = [
  /\bdelv(e|es|ed|ing)\b/i,
  /\bshowcas(e|es|ed|ing)\b/i,
  /\btestament to\b/i,
  /\btapestry\b/i,
  /\bembark(s|ed)? on\b/i,
  /\bin the realm of\b/i,
  /\bunleash(es|ed)?\b/i,
  /\bnail-?biting\b/i,
  /\bheart-?wrenching\b/i,
  /\bmade history\b/i,
  /\bstunned (everyone|the world)\b/i,
  /\ba true warrior\b/i,
];
const BANNED_TR = [
  /yürek burkan/i,
  /adeta uçtu/i,
  /tarih yazdı/i,
  /nefesleri kesti/i,
  /efsane geri döndü/i,
  /herkesi şoke etti/i,
  /kalbimizde yaşıyor/i,
  /gerçek bir savaşçı/i,
  /hayal kırıklığı yaşattı/i,
  /pistte şov yaptı/i,
];

function textsOf(t: DriverLoreText | TeamLoreText): string[] {
  return [t.bio, t.lore, ...t.milestones, ...(t.chapters ?? []).flatMap((c) => [c.title, c.text]), t.quote?.text ?? '', t.quote?.context ?? ''];
}

function bannedHits(texts: string[], patterns: RegExp[]): string[] {
  return texts.flatMap((x) => patterns.filter((p) => p.test(x)).map((p) => `${p.source} → "${x.slice(0, 70)}…"`));
}

/**
 * Milestones that present a won world title ("2008: … World Champion …"), with the
 * year they start with. `kind` separates drivers' from constructors' titles.
 * Unicode-aware matching, so Turkish words (Şampiyonluğu) are read correctly.
 */
function claimedTitles(milestones: string[], kind: 'driver' | 'constructor'): Array<{ year: number; text: string }> {
  const out: Array<{ year: number; text: string }> = [];
  for (const m of milestones) {
    const year = /^(\d{4})(?!\d)/.exec(m.trim())?.[1];
    if (!year) continue;
    const claim = /(world champion|world title|drivers['’] (title|championship)|constructors['’] (title|championship)|dünya şampiyon|şampiyonluğ|şampiyonu oldu|şampiyon oldu)/iu.test(m);
    // "lost / missed the title", or a championship position ("fifth in the constructors' championship")
    const negated =
      /(runner-up|lost|miss(es|ed)?|denied|beaten|(second|third|fourth|fifth|sixth|best result)|\d+(st|nd|rd|th)|ikinci|üçüncü|dördüncü|beşinci|kaybet|kaçır|elinden)/iu.test(m);
    const constructors = /(constructors|markalar)/iu.test(m);
    // A range ("2017 to 2021", "2017–2021") is a run of seasons, not one claim; checked year by year.
    const range = /^(\d{4})\s*(?:to|–|-)\s*(\d{4})/.exec(m.trim());
    if (!claim || negated || constructors !== (kind === 'constructor')) continue;
    if (range) for (let y = Number(range[1]); y <= Number(range[2]); y++) out.push({ year: y, text: m });
    else out.push({ year: Number(year), text: m });
  }
  return out;
}

/**
 * A direct quote of a real person must be checkable: a year and an https link to
 * where the words were published (interview, broadcast transcript, book page).
 * A label such as "Post-Race Radio" names a kind of source, not a source.
 */
function quoteSourceProblem(q: { year?: number; context: string; sourceUrl?: string }): string | null {
  if (typeof q.year !== 'number') return 'no year';
  if (!q.sourceUrl || !/^https:\/\/[^\s]+\.[^\s]+/.test(q.sourceUrl)) return `no https sourceUrl (context: "${q.context}")`;
  return null;
}

describe('editorial profiles: drivers', () => {
  it('lists the drivers it covers', () => {
    expect(DRIVER_IDS.length).toBeGreaterThan(0);
  });

  for (const id of DRIVER_IDS) {
    describe(id, () => {
      const en = getDriverLore(id)!;
      const tr = en.tr;

      it('has complete Turkish text with the same structure', () => {
        expect(tr.bio.trim().length).toBeGreaterThan(40);
        expect(tr.lore.trim().length).toBeGreaterThan(20);
        expect(tr.milestones.length).toBe(en.milestones.length);
        expect((tr.chapters ?? []).length).toBe((en.chapters ?? []).length);
        expect(Boolean(tr.quote)).toBe(Boolean(en.quote));
      });

      it('uses no blacklisted phrase', () => {
        expect([...bannedHits(textsOf(en), BANNED_EN), ...bannedHits(textsOf(tr), BANNED_TR)]).toEqual([]);
      });

      it('gives a direct quote a verifiable source (style guide §16: person, outlet, year)', () => {
        if (!en.quote) return;
        expect(quoteSourceProblem(en.quote), `quote "${en.quote.text.slice(0, 50)}…"`).toBeNull();
      });

      it('agrees with F1DB on birth year and title years', () => {
        const rec = getDriverRecord(resolveDriverId(id));
        if (!rec) return; // debutant not yet in the index
        if (rec.b) expect(en.born, 'birth year').toBe(Number(rec.b.slice(0, 4)));
        const titles = new Set(rec.s.filter((s) => s.ch === 1).map((s) => s.y));
        for (const c of [...claimedTitles(en.milestones, 'driver'), ...claimedTitles(tr.milestones, 'driver')]) {
          expect(titles.has(c.year), `driver title claimed for ${c.year}: "${c.text}"`).toBe(true);
        }
        for (const m of en.milestones) {
          const y = Number(/^(\d{4})\b/.exec(m.trim())?.[1]);
          if (y) expect(y, `milestone year in "${m.slice(0, 40)}"`).toBeLessThanOrEqual(CURRENT_SEASON);
        }
      });
    });
  }
});

describe('editorial profiles: teams', () => {
  for (const id of TEAM_IDS) {
    describe(id, () => {
      const en = getTeamLore(id)!;
      const tr = en.tr;

      it('has complete Turkish text with the same structure', () => {
        expect(tr.bio.trim().length).toBeGreaterThan(40);
        expect(tr.milestones.length).toBe(en.milestones.length);
        expect((tr.chapters ?? []).length).toBe((en.chapters ?? []).length);
        expect(Boolean(tr.quote)).toBe(Boolean(en.quote));
      });

      it('uses no blacklisted phrase', () => {
        expect([...bannedHits(textsOf(en), BANNED_EN), ...bannedHits(textsOf(tr), BANNED_TR)]).toEqual([]);
      });

      it('gives a direct quote a verifiable source (style guide §16: person, outlet, year)', () => {
        if (!en.quote) return;
        expect(quoteSourceProblem(en.quote), `quote "${en.quote.text.slice(0, 50)}…"`).toBeNull();
      });

      it('agrees with F1DB on constructor title years (whole lineage: Toleman → Benetton → … → Alpine)', () => {
        const resolved = resolveConstructorId(id, CURRENT_SEASON) ?? resolveConstructorId(id);
        const dna = resolved ? buildTeamDna(resolved) : null;
        if (!dna) return; // new entrant not yet in the index
        const titles = new Set(
          dna.stages.flatMap((st) => (getConstructorRecord(st.constructorId)?.s ?? []).filter((s) => s.ch === 1).map((s) => s.y)),
        );
        for (const c of [...claimedTitles(en.milestones, 'constructor'), ...claimedTitles(tr.milestones, 'constructor')]) {
          expect(titles.has(c.year), `constructors' title claimed for ${c.year}: "${c.text}"`).toBe(true);
        }
      });
    });
  }
});

describe('editorial profiles: circuits', () => {
  const keys = Object.keys(CIRCUIT_FACTS);

  it('every circuit with English prose has Turkish prose', () => {
    const missing = keys.filter((k) => {
      const en = CIRCUIT_FACTS[k];
      const tr = CIRCUIT_FACTS_TR[k];
      return (en.note && !tr?.note) || (en.character && !tr?.character) || (en.signatureCorner && !tr?.signatureCorner);
    });
    expect(missing).toEqual([]);
  });

  it('circuit prose uses no blacklisted phrase', () => {
    const en = keys.flatMap((k) => [CIRCUIT_FACTS[k].note ?? '', CIRCUIT_FACTS[k].character ?? '']);
    const tr = keys.flatMap((k) => [CIRCUIT_FACTS_TR[k]?.note ?? '', CIRCUIT_FACTS_TR[k]?.character ?? '']);
    const lore = Object.values(CIRCUIT_LORE).flat();
    expect([
      ...bannedHits([...en, ...lore.map((m) => m.storyEn)], BANNED_EN),
      ...bannedHits([...tr, ...lore.map((m) => m.storyTr)], BANNED_TR),
    ]).toEqual([]);
  });

  it('first Grand Prix years and lore years are within 1950…current season', () => {
    for (const k of keys) {
      const y = CIRCUIT_FACTS[k].firstGp;
      if (y !== undefined) expect(y, k).toBeGreaterThanOrEqual(1950);
      if (y !== undefined) expect(y, k).toBeLessThanOrEqual(CURRENT_SEASON);
    }
    for (const [k, moments] of Object.entries(CIRCUIT_LORE)) {
      for (const m of moments) {
        expect(m.year, `${k}/${m.id}`).toBeGreaterThanOrEqual(1950);
        expect(m.year, `${k}/${m.id}`).toBeLessThanOrEqual(CURRENT_SEASON);
        expect(m.storyTr.trim().length, `${k}/${m.id} TR`).toBeGreaterThan(40);
        expect(m.titleTr.trim().length, `${k}/${m.id} TR title`).toBeGreaterThan(3);
      }
    }
  });

  it('a lore story that quotes someone links to where the words come from', () => {
    // Quoted speech inside a story needs a published source (style guide §16 Doğruluk): an https `sourceUrl` on the moment.
    const unsourced = Object.entries(CIRCUIT_LORE).flatMap(([k, moments]) =>
      moments
        .filter((m) => /["“][^"”]{20,}["”]/.test(m.storyEn))
        .filter((m) => !/^https:\/\//.test((m as { sourceUrl?: string }).sourceUrl ?? ''))
        .map((m) => `${k}/${m.id}`),
    );
    expect(unsourced).toEqual([]);
  });
});
