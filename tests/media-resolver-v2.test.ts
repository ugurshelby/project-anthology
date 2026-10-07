import { describe, expect, it } from 'vitest';
import { evaluateCandidate, MIN_SCORE, type EvalContext } from '@/lib/media/score';
import { describeMiss } from '@/lib/media/resolve';
import { makeFile } from './media-helpers';
import type { Candidate, MediaEntity } from '@/lib/media/types';

/** Cases found on 2026-10-07 while looking for the entities that stayed `missing` after the first fill. */

const car = (over: Partial<EvalContext>): EvalContext => ({
  type: 'car',
  displayName: 'Ferrari',
  nameHints: ['Scuderia Ferrari'],
  season: 2020,
  source: 'commons-search',
  curated: false,
  ...over,
});
const circuit = (over: Partial<EvalContext>): EvalContext => ({
  type: 'circuit',
  displayName: 'Kyalami',
  nameHints: [],
  season: null,
  source: 'commons-search',
  curated: false,
  ...over,
});

describe('car — chassis designations of the 2019-2023 cars', () => {
  // The photo title never names the team; the Commons category does ('Ferrari SF1000 of Charles Leclerc').
  const testing = (cat: string, title = 'File:2020 F1 Pre-Season Testing Catalonia (49629079068).jpg') =>
    makeFile({ title, width: 6000, height: 4000, year: 2020, categories: [cat, 'Formula One Catalonia test, 19-21 February 2020'] });

  it.each([
    ['Ferrari', 'Ferrari SF1000 of Charles Leclerc'],
    ['Alfa Romeo', 'Alfa Romeo C39 of Kimi Räikkönen'],
    ['AlphaTauri', 'AlphaTauri AT01 of Pierre Gasly'],
    ['Racing Point', 'Racing Point RP20 of Sergio Pérez'],
    ['Renault', 'Renault R.S.20 of Daniel Ricciardo'],
  ])('%s: accepts a photo identified only by its category (%s)', (displayName, category) => {
    const v = evaluateCandidate(testing(category), car({ displayName, nameHints: [] }));
    expect(v.ok).toBe(true);
    expect(v.score).toBeGreaterThanOrEqual(MIN_SCORE.car);
  });

  it('still rejects a road car that shares the designation', () => {
    const v = evaluateCandidate(
      makeFile({ title: 'File:2020 Ferrari SF90 Stradale Monaco.jpg', width: 6000, height: 4000, year: 2020, categories: ['Ferrari SF90 Stradale'] }),
      car({}),
    );
    expect(v.ok).toBe(false);
  });

  it('a show car filed under the right model but with no event signal is not a race-weekend shot (Honda office AT02)', () => {
    const show = makeFile({
      title: 'File:Honda alphatauri.fasion racing car in Wako 5.jpg',
      width: 4080,
      height: 3072,
      year: 2023,
      categories: ['AlphaTauri AT02', 'Formula One wings in the 2020s', 'Vehicles at Honda Wako Building'],
    });
    expect(evaluateCandidate(show, car({ displayName: 'AlphaTauri', nameHints: ['Scuderia AlphaTauri'], season: 2023 })).ok).toBe(false);
  });

  it('ranks "<model> of <driver>" above a wide view that only carries the model category', () => {
    const base = { title: 'File:2021 United States Grand Prix 03.jpg', width: 8640, height: 4864, year: 2021 };
    const ctxAt = car({ displayName: 'AlphaTauri', nameHints: [], season: 2021 });
    const wide = evaluateCandidate(makeFile({ ...base, categories: ['2021 United States Grand Prix', 'AlphaTauri AT02'] }), ctxAt);
    const portrait = evaluateCandidate(makeFile({ ...base, categories: ['2021 United States Grand Prix', 'AlphaTauri AT02 of Pierre Gasly'] }), ctxAt);
    expect(wide.ok && portrait.ok).toBe(true);
    expect(portrait.score).toBeGreaterThan(wide.score);
  });
});

describe('circuit — venue without a racing word in its name', () => {
  it("accepts an aerial filed under the venue's own Commons category (Red Bull Ring)", () => {
    const v = evaluateCandidate(
      makeFile({ title: 'File:Luftaufnahme (c)Red Bull Ring.jpg', width: 5016, height: 3344, categories: ['Red Bull Ring'] }),
      circuit({ displayName: 'Red Bull Ring', source: 'commons-category' }),
    );
    expect(v.ok && v.score >= MIN_SCORE.circuit).toBe(true);
  });

  it('the same kind of file found by free-text search has no racing context and is rejected', () => {
    const v = evaluateCandidate(
      makeFile({ title: 'File:Kyalami air.jpg', width: 3209, height: 1792, categories: ['Kyalami'] }),
      circuit({ source: 'commons-search' }),
    );
    expect(v.ok).toBe(false);
  });

  it('but through the venue category an "air" view of Kyalami is an aerial', () => {
    const v = evaluateCandidate(
      makeFile({ title: 'File:Kyalami air.jpg', width: 3209, height: 1792, categories: ['Kyalami'] }),
      circuit({ source: 'commons-category' }),
    );
    expect(v.ok && v.score >= MIN_SCORE.circuit).toBe(true);
  });

  it("a team word that is part of the venue's own name is not a racing-action signal", () => {
    const own = evaluateCandidate(
      makeFile({ title: 'File:Red Bull Ring aerial view.jpg', width: 5000, height: 3300, categories: ['Red Bull Ring'] }),
      circuit({ displayName: 'Red Bull Ring', source: 'commons-category' }),
    );
    const other = evaluateCandidate(
      makeFile({ title: 'File:Red Bull Racing Silverstone aerial view.jpg', width: 5000, height: 3300, categories: ['Silverstone Circuit'] }),
      circuit({ displayName: 'Silverstone Circuit', nameHints: ['Silverstone'], source: 'commons-category' }),
    );
    expect(own.ok && own.score >= MIN_SCORE.circuit).toBe(true);
    expect(!other.ok || other.score < own.score).toBe(true);
  });

  it('a "<venue> Grand Prix (123456)" snapshot with no venue part in the title no longer clears the bar by size alone', () => {
    const v = evaluateCandidate(
      makeFile({ title: 'File:Las Vegas Grand Prix (54942342239).jpg', width: 4000, height: 2667, categories: ['2025 Las Vegas Grand Prix'] }),
      circuit({ displayName: 'Las Vegas Strip Street Circuit', nameHints: [], source: 'commons-category' }),
    );
    expect(!v.ok || v.score < MIN_SCORE.circuit).toBe(true);
  });

  it.each([
    ['horse racing at the same place', 'Aintree', 'File:Lord Daresbury Stand, Aintree.jpg', ['Aintree Racecourse', 'Grandstands in England']],
    ['a stamp sheet', 'AVUS', 'File:Avus.jpg', ['AVUS', '1971 Deutsche Bundespost Berlin stamps']],
    ['a trade-fair hall at the venue', 'AVUS', 'File:AVUS-Tribüne with Grüne Woche banner 2025-01-18 01.jpg', ['AVUS', 'Internationale Grüne Woche 2025']],
    ['a mass cycling ride on the same road', 'AVUS', 'File:Fahrradsternfahrt Berlin on AVUS 2026-06-07 01.jpg', ['AVUS', 'Cycling in Berlin']],
  ])('rejects %s', (_label, displayName, title, categories) => {
    const v = evaluateCandidate(makeFile({ title, width: 6000, height: 4000, categories }), circuit({ displayName, source: 'commons-category' }));
    expect(v.ok).toBe(false);
  });
});

describe('describeMiss — near misses are written into the diagnostics', () => {
  const entity: MediaEntity = { type: 'circuit', key: 'miami', displayName: 'Miami International Autodrome' };
  const cand = (title: string, score: number): Candidate => ({
    file: makeFile({ title }),
    license: { ok: true, label: 'CC BY-SA 4.0', attributionRequired: true, shareAlike: true, url: null },
    source: 'commons-search',
    score,
  });

  it('names the best candidates that cleared the gates but not the bar', () => {
    const note = describeMiss(entity, {
      best: null,
      inspected: 3,
      notes: ['commons-search: 3 titles'],
      candidates: [cand('File:A.jpg', 45), cand('File:B.jpg', 30), cand('File:C.jpg', 10)],
    });
    expect(note).toContain('best below bar: A.jpg (45); B.jpg (30)');
    expect(note).not.toContain('C.jpg');
  });

  it('stays unchanged when no candidate cleared the gates', () => {
    const note = describeMiss(entity, { best: null, inspected: 1, notes: ['wikidata-p18: 1 titles, 0 passed'], candidates: [] });
    expect(note).not.toContain('best below bar');
    expect(note).toContain('wikidata-p18: 1 titles, 0 passed');
  });
});
