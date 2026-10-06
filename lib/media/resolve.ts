import { CURRENT_SEASON } from '@/lib/f1Calendar';
import type { FetchOptions } from '@/lib/media/http';
import { classifyLicense } from '@/lib/media/license';
import { evaluateCandidate, MIN_SCORE, nameTokens, pickBest, THUMB_WIDTH } from '@/lib/media/score';
import type { Candidate, MediaEntity, ResolveOutcome } from '@/lib/media/types';
import {
  getCommonsFileInfos,
  listCategoryFiles,
  normalizeFileTitle,
  searchCommonsFiles,
  type WikidataMedia,
} from '@/lib/media/wikimedia';

/**
 * Per-entity resolution: an ordered list of STAGES (sources). Each stage
 * produces candidate file titles, which are fetched in one batch, gated and
 * scored. We stop early at the first stage that yields a candidate clearing the
 * type's MIN_SCORE (cheapest/most trusted source first), otherwise we keep
 * collecting and pick the best overall. Nothing clears the bar -> `best: null`
 * and the entity becomes `missing` (UI placeholder).
 */

export interface ResolveContext {
  /** Wikidata image claims for this entity's QID (undefined when no QID). */
  wikidata?: WikidataMedia;
  fetchOpts: FetchOptions;
}

interface Stage {
  source: Candidate['source'];
  /** Lazily produces titles so later (more expensive) stages only run when needed. */
  titles: () => Promise<string[]>;
  curated?: boolean;
  /** Accept this stage's winner without trying later stages (true, or a predicate on the winner). */
  stopOnHit: boolean | ((winner: Candidate) => boolean);
}

function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function buildStages(entity: MediaEntity, ctx: ResolveContext): Stage[] {
  const name = entity.displayName ?? '';
  const season = entity.season ?? null;
  const extra = entity.extra ?? {};
  const stages: Stage[] = [];

  const curated = asStrings(extra.curatedFiles);
  if (curated.length) {
    stages.push({ source: 'curated', curated: true, stopOnHit: true, titles: async () => curated });
  }

  const wd = ctx.wikidata;
  const search = (queries: string[], limit = 20) => async () => {
    const all: string[] = [];
    for (const q of queries) {
      all.push(...(await searchCommonsFiles(q, limit, ctx.fetchOpts)));
    }
    return all;
  };

  switch (entity.type) {
    case 'driver':
      // Active drivers (raced in the last two seasons): the Wikidata photo only ends the
      // search when it is recent; otherwise we also look for a current-season photo.
      if (wd?.p18.length) {
        const active = season !== null && season >= CURRENT_SEASON - 1;
        stages.push({
          source: 'wikidata-p18',
          stopOnHit: (w) => !active || (w.file.year !== null && w.file.year >= (season ?? 0) - 2),
          titles: async () => wd.p18,
        });
      }
      if (name && season !== null && season >= CURRENT_SEASON - 1) {
        stages.push({ source: 'commons-search', stopOnHit: false, titles: search([`${name} ${season}`, `${name} ${season - 1}`], 20) });
      }
      if (wd?.commonsCategory) {
        const cat = wd.commonsCategory;
        stages.push({ source: 'commons-search', stopOnHit: false, titles: () => listCategoryFiles(cat, 50, ctx.fetchOpts) });
      }
      if (name) stages.push({ source: 'commons-search', stopOnHit: false, titles: search([`${name} Formula 1`, `${name} racing driver`]) });
      break;
    case 'team':
      if (wd?.p154.length) stages.push({ source: 'wikidata-p154', stopOnHit: true, titles: async () => wd.p154 });
      if (name) {
        const extraQueries = asStrings(extra.logoQueries);
        // The Wikipedia title carries the team's real name ('Scuderia AlphaTauri', 'Racing Bulls').
        const hintQueries = asStrings(extra.nameHints).filter((h) => h !== name).map((h) => `${h} logo`);
        stages.push({
          source: 'commons-search',
          stopOnHit: false,
          titles: search([`${name} logo`, `${name} Formula One logo`, ...hintQueries, ...extraQueries], 25),
        });
      }
      break;
    case 'car':
      // Season-specific only. Iconic cars rely on curatedFiles (+ optional curatedQuery).
      if (season && name && !String(entity.key).startsWith('iconic:')) {
        // The Jolpica name can be cryptic ('RB F1 Team'); the Wikipedia title carries the team's real name.
        const names = Array.from(new Set([name, ...asStrings(extra.nameHints)]));
        const queries = names.flatMap((n) => [`${n} ${season} Formula One`, `${season} ${n} F1 car`]);
        stages.push({ source: 'commons-search', stopOnHit: false, titles: search(queries.slice(0, 4), 30) });
      }
      if (typeof extra.curatedQuery === 'string') {
        stages.push({ source: 'commons-search', stopOnHit: false, titles: search([extra.curatedQuery], 25) });
      }
      break;
    case 'circuit':
      if (wd?.p18.length) stages.push({ source: 'wikidata-p18', stopOnHit: true, titles: async () => wd.p18 });
      if (wd?.commonsCategory) {
        const cat = wd.commonsCategory;
        stages.push({ source: 'commons-search', stopOnHit: false, titles: () => listCategoryFiles(cat, 50, ctx.fetchOpts) });
      }
      if (name) stages.push({ source: 'commons-search', stopOnHit: false, titles: search([`${name} aerial`, `${name} circuit`], 20) });
      break;
  }
  return stages;
}

export async function resolveEntity(
  entity: MediaEntity,
  rejectedFiles: string[],
  ctx: ResolveContext,
): Promise<ResolveOutcome> {
  const rejected = new Set(rejectedFiles.map(normalizeFileTitle));
  const stages = buildStages(entity, ctx);
  const seen = new Set<string>();
  const candidates: Candidate[] = [];
  const notes: string[] = [];
  let inspected = 0;

  const hints: string[] = [...asStrings((entity.extra ?? {}).nameHints)];
  // The Jolpica id carries the name people actually use ('interlagos', 'rodriguez', 'villeneuve').
  if (entity.type === 'circuit') hints.push(entity.key.replace(/[_.-]+/g, ' '));
  const locality = (entity.extra ?? {}).locality;
  const localityHints = typeof locality === 'string' ? [locality] : [];

  for (const stage of stages) {
    const titles = (await stage.titles())
      .map(normalizeFileTitle)
      .filter((t) => !seen.has(t) && !rejected.has(t))
      .slice(0, 50);
    if (titles.length === 0) continue;
    titles.forEach((t) => seen.add(t));

    const infos = await getCommonsFileInfos(titles, THUMB_WIDTH[entity.type], ctx.fetchOpts);
    inspected += titles.length;
    const rejections = new Map<string, number>();
    const stageCandidates: Candidate[] = [];
    for (const title of titles) {
      const file = infos.get(title);
      if (!file) continue;
      const verdict = evaluateCandidate(file, {
        type: entity.type,
        displayName: entity.displayName ?? null,
        nameHints: hints,
        localityHints,
        season: entity.season ?? null,
        source: stage.source,
        curated: stage.curated === true,
      });
      if (!verdict.ok) {
        const key = (verdict.reason ?? 'rejected').replace(/\(.*\)/, '').trim();
        rejections.set(key, (rejections.get(key) ?? 0) + 1);
        continue;
      }
      stageCandidates.push({ file, license: classifyLicense(file), source: stage.source, score: verdict.score });
    }
    candidates.push(...stageCandidates);
    const summary = Array.from(rejections.entries()).map(([k, n]) => `${k}×${n}`).join(', ');
    notes.push(`${stage.source}: ${titles.length} titles, ${stageCandidates.length} passed${summary ? `; rejected: ${summary}` : ''}`);

    const winner = pickBest(stageCandidates, entity.type);
    if (winner) {
      const stop = typeof stage.stopOnHit === 'function' ? stage.stopOnHit(winner) : stage.stopOnHit;
      if (stop) return { best: winner, inspected, notes };
    }
  }

  return { best: pickBest(candidates, entity.type), inspected, notes };
}

/** Search-friendly summary of why an entity ended up missing (stored in last_error-less diagnostics). */
export function describeMiss(entity: MediaEntity, outcome: ResolveOutcome): string {
  const tokens = nameTokens(entity.displayName).join('/');
  return `no candidate reached ${MIN_SCORE[entity.type]} for ${entity.type}:${entity.key} [${tokens}] — ${outcome.notes.join(' | ')}`.slice(0, 900);
}
