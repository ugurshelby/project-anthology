import { describe, expect, it } from 'vitest';
import { evaluateCandidate, MIN_SCORE, nameTokens, type EvalContext } from '@/lib/media/score';
import { makeFile } from './media-helpers';

const ctx = (over: Partial<EvalContext>): EvalContext => ({
  type: 'car',
  displayName: 'McLaren',
  nameHints: [],
  season: 2025,
  source: 'commons-search',
  curated: false,
  ...over,
});

describe('nameTokens', () => {
  it('drops generic motorsport words and diacritics', () => {
    expect(nameTokens('Haas F1 Team')).toEqual(['haas']);
    expect(nameTokens('Autodromo Nazionale di Monza')).toEqual(['monza']);
    expect(nameTokens('Nürburgring')).toEqual(['nurburgring']);
    expect(nameTokens('Red Bull')).toEqual(['red', 'bull']);
  });
});

describe('evaluateCandidate — shared gates', () => {
  it('rejects non-allow-listed licenses and unsupported formats', () => {
    const nc = makeFile({ title: 'File:2025 McLaren MCL39.jpg', licenseCode: 'cc-by-nc-4.0', licenseShortName: 'CC BY-NC 4.0', categories: ['McLaren'] });
    expect(evaluateCandidate(nc, ctx({})).ok).toBe(false);
    const gif = makeFile({ title: 'File:2025 McLaren MCL39.gif', mime: 'image/gif', categories: ['McLaren'] });
    expect(evaluateCandidate(gif, ctx({})).ok).toBe(false);
  });
  it('rejects maps, scans, toys', () => {
    for (const title of ['File:Suzuka circuit map.png', 'File:2025 McLaren toy model car.jpg', 'File:2025 McLaren poster.jpg']) {
      expect(evaluateCandidate(makeFile({ title, categories: ['McLaren'] }), ctx({})).ok).toBe(false);
    }
  });
  it('curated files only face license/format/size gates', () => {
    const f = makeFile({ title: 'File:Anything goes.jpg' });
    expect(evaluateCandidate(f, ctx({ curated: true, source: 'curated' }))).toMatchObject({ ok: true, score: 100 });
    const tiny = makeFile({ width: 300, height: 200 });
    expect(evaluateCandidate(tiny, ctx({ curated: true, source: 'curated' })).ok).toBe(false);
  });
});

describe('evaluateCandidate — car (season gate)', () => {
  const good = makeFile({ title: 'File:2025 Japan GP - McLaren - MCL39 - FP1.jpg', width: 4408, height: 2480, categories: ['McLaren MCL39'] });
  it('accepts the right season + constructor', () => {
    const v = evaluateCandidate(good, ctx({}));
    expect(v.ok).toBe(true);
    expect(v.score).toBeGreaterThanOrEqual(MIN_SCORE.car);
  });
  it('never accepts another season’s car', () => {
    expect(evaluateCandidate(good, ctx({ season: 2024 })).ok).toBe(false);
    expect(evaluateCandidate(good, ctx({ season: 2026 })).ok).toBe(false);
  });
  it('requires the constructor name', () => {
    expect(evaluateCandidate(good, ctx({ displayName: 'Ferrari' })).ok).toBe(false);
  });
  it('a team word in a generic category is not enough; a car-specific category is (engine suppliers, sponsors)', () => {
    const generic = makeFile({ title: 'File:2018 Chinese Grand Prix FP1 Stoffel Vandoorne (41555017701).jpg', categories: ['Renault in Formula One', '2018 Chinese Grand Prix'] });
    expect(evaluateCandidate(generic, ctx({ displayName: 'Renault', season: 2018 })).ok).toBe(false);
    const specific = makeFile({ title: 'File:2023 Austrian Grand Prix Nr. 44 (Post-Race).jpg', categories: ['Mercedes-AMG F1 W14 E Performance'], width: 4000, height: 2250 });
    expect(evaluateCandidate(specific, ctx({ displayName: 'Mercedes', season: 2023 })).ok).toBe(true);
  });
  it('rejects heritage, exhibition and non-car subjects that happen to name the team and year (real misses)', () => {
    const miss = (title: string, season: number, displayName: string, categories: string[] = []) =>
      evaluateCandidate(makeFile({ title: `File:${title}`, width: 4000, height: 2500, categories }), ctx({ displayName, season })).ok;
    expect(miss('John Watson McLaren MP4 1 2019 Silverstone Classic.jpg', 2019, 'McLaren')).toBe(false);
    expect(miss('Ilham Aliyev watched the opening ceremony of the 2019 Formula-1 Azerbaijan Grand Prix.jpg', 2019, 'Racing Point', ['Racing Point'])).toBe(false);
    expect(miss('Alpine F1 steering wheel.jpg', 2021, 'Alpine')).toBe(false);
    expect(miss('Visa; Partner booth; Web Summit 2024.jpg', 2024, 'RB')).toBe(false);
    expect(miss('McLaren MP4-2C 1X7A6546.jpg', 2023, 'McLaren', ['McLaren MP4/2', 'Historic Formula One cars'])).toBe(false);
    expect(miss('Lewis Hamilton 2021 Silverstone Win.jpg', 2021, 'Mercedes', ['Mercedes'])).toBe(false);
    // MP4-x is McLaren 1981–2016: a classic car at a 2018 parade passes the year gate but is not the 2018 car
    expect(miss('John Watson McLaren MP4-1B 2018 British Grand Prix.jpg', 2018, 'McLaren', ['McLaren MP4/1'])).toBe(false);
    expect(miss('McLaren MP4-25.jpg', 2019, 'McLaren', ['McLaren MP4-25'])).toBe(false);
    expect(evaluateCandidate(makeFile({ title: 'File:2015 Hungarian Grand Prix McLaren MP4-30.jpg', width: 4000, height: 2500, categories: ['McLaren MP4-30'] }), ctx({ displayName: 'McLaren', season: 2015 })).ok).toBe(true);
  });
  it('falls back to metadata year only with an event or car signal', () => {
    const withEvent = makeFile({ title: 'File:McLaren MCL39 testing Barcelona.jpg', year: 2025, categories: ['McLaren'], width: 4000, height: 2250 });
    expect(evaluateCandidate(withEvent, ctx({})).ok).toBe(true);
    expect(evaluateCandidate({ ...withEvent, year: 2023 }, ctx({})).ok).toBe(false);
    expect(evaluateCandidate({ ...withEvent, year: null }, ctx({})).ok).toBe(false);
    const noSignal = makeFile({ title: 'File:McLaren side view.jpg', year: 2025, categories: ['McLaren'], width: 4000, height: 2250 });
    expect(evaluateCandidate(noSignal, ctx({})).ok).toBe(false);
  });
  it('rejects other series, low resolution, portrait crops and non-car shots', () => {
    expect(evaluateCandidate({ ...good, title: 'File:2025 McLaren Formula 2 car.jpg' }, ctx({})).ok).toBe(false);
    expect(evaluateCandidate({ ...good, width: 900, height: 500 }, ctx({})).ok).toBe(false);
    expect(evaluateCandidate({ ...good, width: 2000, height: 4000 }, ctx({})).ok).toBe(false);
    expect(evaluateCandidate({ ...good, title: 'File:2025 McLaren helmet Norris.jpg' }, ctx({})).ok).toBe(false);
  });
  it('ranks on-track action above a pit-garage walk', () => {
    const track = evaluateCandidate(good, ctx({}));
    const garage = evaluateCandidate({ ...good, title: 'File:2025 Japan GP - McLaren - MCL39 - Thursday.jpg' }, ctx({}));
    expect(track.ok && garage.ok).toBe(true);
    expect(track.score).toBeGreaterThan(garage.score);
  });
});

describe('evaluateCandidate — circuit (the Silverstone P18 trap)', () => {
  const c = (over: Parameters<typeof makeFile>[0], source: EvalContext['source'] = 'wikidata-p18') =>
    evaluateCandidate(makeFile(over), ctx({ type: 'circuit', displayName: 'Silverstone Circuit', nameHints: ['Silverstone'], season: null, source }));
  it('accepts an aerial circuit photo', () => {
    const v = c({ title: 'File:Silverstone Circuit aerial 2019.jpg', categories: ['Silverstone Circuit'] });
    expect(v.ok && v.score >= MIN_SCORE.circuit).toBe(true);
  });
  it('a car shot tagged with the circuit is pushed below the threshold', () => {
    const v = c({ title: 'File:McLaren MP4-16A 2015 McLaren MP4-16A shakedown (21219267118).jpg', categories: ['Silverstone Circuit'] });
    expect(!v.ok || v.score < MIN_SCORE.circuit).toBe(true);
  });
  it('rejects non-venue photos that merely contain the place name (real misses from the 2025 dry run)', () => {
    const hotel = c({ title: 'File:Donington Park Farmhouse Hotel, Isley Walton - panoramio.jpg', categories: ['Donington Park'] }, 'commons-search');
    expect(hotel.ok).toBe(false); // 'panoramio' is a photo site, not a panorama; no racing context; a hotel
    const city = evaluateCandidate(
      makeFile({ title: 'File:Aerial View of Baku, May 2012.jpg', categories: ['Baku', 'Aerial photographs of Azerbaijan'] }),
      ctx({ type: 'circuit', displayName: 'Baku City Circuit', nameHints: ['Baku'], season: null, source: 'commons-search' }),
    );
    expect(city.ok).toBe(false);
    const wrongLongBeach = evaluateCandidate(
      makeFile({ title: 'File:Long Beach, NY aerial from the west 01.jpg', categories: ['Long Beach, New York'] }),
      ctx({ type: 'circuit', displayName: 'Long Beach', nameHints: ['California'], season: null, source: 'commons-search' }),
    );
    expect(wrongLongBeach.ok).toBe(false);
  });
  it('rejects PNG diagrams and a Wikidata P18 that is not about the venue (real misses)', () => {
    expect(c({ title: 'File:Hard Rock Stadium Circuit 2022 circuit layout.png', mime: 'image/png', categories: ['Miami International Autodrome'] }, 'commons-search').ok).toBe(false);
    expect(c({ title: 'File:Autodromo circuit with Foro Sol.png', mime: 'image/png', categories: ['Silverstone Circuit'] }).ok).toBe(false);
    // NASCAR driver portrait set as the Wikidata image of the circuit: no venue name in title, no racing context
    const portrait = evaluateCandidate(
      makeFile({ title: 'File:Austin cindric (51370767098).jpg', categories: ['Austin Cindric', 'Watkins Glen International'] }),
      ctx({ type: 'circuit', displayName: 'Watkins Glen', nameHints: [], season: null, source: 'wikidata-p18' }),
    );
    expect(portrait.ok).toBe(false);
    // P18 that names the venue in its title is still trusted even without racing words
    const named = evaluateCandidate(
      makeFile({ title: 'File:Hungaroring.jpg', categories: ['Hungaroring'] }),
      ctx({ type: 'circuit', displayName: 'Hungaroring', nameHints: [], season: null, source: 'wikidata-p18' }),
    );
    expect(named.ok).toBe(true);
  });
  it('the title must name the venue or a racing word — categories alone are not enough (real Watkins Glen / Kyalami misses)', () => {
    const portrait = evaluateCandidate(
      makeFile({ title: 'File:Austin cindric (51370767098).jpg', categories: ['Austin Cindric', 'NASCAR Cup Series at Watkins Glen International', 'Racing'] }),
      ctx({ type: 'circuit', displayName: 'Watkins Glen', nameHints: ['watkins glen'], season: null, source: 'wikidata-p18' }),
    );
    expect(portrait.ok).toBe(false);
    const layout = evaluateCandidate(
      makeFile({ title: 'File:Kyalami circuit 1968 - 1987.jpg', categories: ['Kyalami'] }),
      ctx({ type: 'circuit', displayName: 'Kyalami', nameHints: [], season: null, source: 'wikidata-p18' }),
    );
    expect(layout.ok).toBe(false);
  });
  it('understands German/Portuguese venue words and does not let locality words match other places', () => {
    const ring = evaluateCandidate(
      makeFile({ title: 'File:Nürburgring Nordschleife Karussell.jpg', categories: ['Nürburgring'] }),
      ctx({ type: 'circuit', displayName: 'Nürburgring', nameHints: [], season: null, source: 'commons-search' }),
    );
    expect(ring.ok && ring.score >= MIN_SCORE.circuit).toBe(true);
    // locality ('Berlin') alone must not make a Berlin tower look like the AVUS circuit
    const tower = evaluateCandidate(
      makeFile({ title: 'File:Funkturm Berlin View 14.jpg', categories: ['Berlin', 'Racing'] }),
      ctx({ type: 'circuit', displayName: 'AVUS', nameHints: [], localityHints: ['Berlin'], season: null, source: 'commons-search' }),
    );
    expect(tower.ok).toBe(false);
    // 'rodriguez' only appears in the Jolpica id → used as a name hint
    const mx = evaluateCandidate(
      makeFile({ title: 'File:Autodromo Hermanos Rodriguez main grandstand.jpg', categories: [] }),
      ctx({ type: 'circuit', displayName: 'Autódromo Hermanos Rodríguez', nameHints: ['rodriguez'], season: null, source: 'commons-search' }),
    );
    expect(mx.ok && mx.score >= MIN_SCORE.circuit).toBe(true);
  });
  it('ranks an event photo (race day, championship round) below a plain venue photo', () => {
    const venue = c({ title: 'File:Silverstone Circuit grandstand.jpg', categories: ['Silverstone Circuit'] }, 'commons-search');
    const event = c({ title: 'File:Silverstone Circuit race day.jpg', categories: ['Silverstone Circuit'] }, 'commons-search');
    expect(venue.ok && event.ok).toBe(true);
    expect(venue.score - event.score).toBeGreaterThanOrEqual(20);
  });
  it('"Racing" in the title is not a venue word (Daytona prototype at Watkins Glen), series photos drop below the bar', () => {
    const proto = evaluateCandidate(
      makeFile({ title: 'File:-60 Michael Shank Racing Ford Riley Daytona Prototype (6060835571).jpg', categories: ['Watkins Glen International', 'Racing'] }),
      ctx({ type: 'circuit', displayName: 'Watkins Glen', nameHints: [], season: null, source: 'wikidata-p18' }),
    );
    expect(proto.ok).toBe(false);
    const series = evaluateCandidate(
      makeFile({ title: 'File:United Autosports ELMS Red Bull Ring 2017-218.jpg', categories: ['Red Bull Ring'] }),
      ctx({ type: 'circuit', displayName: 'Red Bull Ring', nameHints: [], season: null, source: 'commons-search' }),
    );
    expect(!series.ok || series.score < MIN_SCORE.circuit).toBe(true);
  });
  it('rejects a city view and a traffic scene that carry the venue name (real Baku / Nürburgring misses)', () => {
    const baku = evaluateCandidate(
      makeFile({ title: 'File:Aerial View of Baku, May 2012.jpg', categories: ['Baku', 'Baku City Circuit'] }),
      ctx({ type: 'circuit', displayName: 'Baku City Circuit', nameHints: ['baku'], season: null, source: 'wikidata-p18' }),
    );
    expect(baku.ok).toBe(false);
    const jam = evaluateCandidate(
      makeFile({ title: 'File:File op de Nürburgring Nordschleife (7638844772).jpg', categories: ['Nürburgring Nordschleife'] }),
      ctx({ type: 'circuit', displayName: 'Nürburgring', nameHints: [], season: null, source: 'commons-search' }),
    );
    expect(jam.ok).toBe(false);
    const speedway = evaluateCandidate(
      makeFile({ title: 'File:Indianapolis Motor Speedway Aerial August 2018.jpg', categories: ['Indianapolis Motor Speedway'] }),
      ctx({ type: 'circuit', displayName: 'Indianapolis Motor Speedway', nameHints: [], season: null, source: 'commons-search' }),
    );
    expect(speedway.ok).toBe(true);
  });
  it('recognises Spanish/German/French/Italian aerial views', () => {
    const aerial = evaluateCandidate(
      makeFile({ title: 'File:Vista aérea del Autódromo Hermanos Rodríguez 03.jpg', categories: ['Autódromo Hermanos Rodríguez'] }),
      ctx({ type: 'circuit', displayName: 'Autódromo Hermanos Rodríguez', nameHints: ['rodriguez'], season: null, source: 'commons-search' }),
    );
    expect(aerial.ok && aerial.score >= 70).toBe(true);
  });
  it('accepts a real venue photo found through its racing categories', () => {
    const v = evaluateCandidate(
      makeFile({ title: 'File:Hungaroring from the grandstand.jpg', categories: ['Hungaroring'] }),
      ctx({ type: 'circuit', displayName: 'Hungaroring', nameHints: [], season: null, source: 'commons-search' }),
    );
    // no racing word in title/categories ('grandstand' is in the title) -> context satisfied
    expect(v.ok && v.score >= MIN_SCORE.circuit).toBe(true);
  });
  it('requires the circuit/locality to be named', () => {
    expect(c({ title: 'File:Random racetrack.jpg', categories: [] }, 'commons-search').ok).toBe(false);
  });
});

describe('evaluateCandidate — driver', () => {
  const d = (over: Parameters<typeof makeFile>[0], source: EvalContext['source']) =>
    evaluateCandidate(makeFile(over), ctx({ type: 'driver', displayName: 'Lando Norris', season: null, source }));
  it('trusts Wikidata P18, demands the name for search hits', () => {
    const portrait = { title: 'File:Portrait cropped.jpg', width: 1200, height: 1500 };
    expect(d(portrait, 'wikidata-p18')).toMatchObject({ ok: true });
    expect(d(portrait, 'commons-search').ok).toBe(false);
    const named = { ...portrait, title: 'File:Lando Norris 2024 cropped.jpg' };
    const v = d(named, 'commons-search');
    expect(v.ok && v.score >= MIN_SCORE.driver).toBe(true);
  });
  it('penalises group and podium shots as single portraits', () => {
    const solo = d({ title: 'File:Lando Norris 2024.jpg', width: 1200, height: 1500 }, 'commons-search');
    const group = d({ title: 'File:Lando Norris, Oscar Piastri & Zak Brown take the podium.jpg', width: 1200, height: 1500 }, 'commons-search');
    expect(solo.ok && group.ok).toBe(true);
    expect(solo.score - group.score).toBeGreaterThanOrEqual(30);
  });
  it('penalises helmets and memorabilia', () => {
    const v = d({ title: 'File:Lando Norris Helmet at Exhibition.jpg', width: 1200, height: 1500 }, 'commons-search');
    expect(!v.ok || v.score < MIN_SCORE.driver).toBe(true);
  });
});

describe('evaluateCandidate — team logo', () => {
  const t = (over: Parameters<typeof makeFile>[0], source: EvalContext['source'] = 'commons-search') =>
    evaluateCandidate(makeFile({ copyrighted: false, licenseCode: 'pd', licenseShortName: 'Public domain', ...over }), ctx({ type: 'team', displayName: 'McLaren', season: null, source }));
  it('accepts an SVG logo and prefers the newest, colored one', () => {
    const newest = t({ title: 'File:McLaren Racing logo (2024).svg', mime: 'image/svg+xml', width: 512, height: 512 });
    const older = t({ title: 'File:McLaren Racing logo (2015).svg', mime: 'image/svg+xml', width: 512, height: 512 });
    const white = t({ title: 'File:McLaren Speedmark (white).svg', mime: 'image/svg+xml', width: 512, height: 512 });
    expect(newest.ok && older.ok && white.ok).toBe(true);
    expect(newest.score).toBeGreaterThan(older.score);
    expect(newest.score).toBeGreaterThan(white.score);
  });
  it('rejects non-logo files and SVGs for photo types', () => {
    expect(t({ title: 'File:McLaren MCL39 side view.jpg' }).ok).toBe(false);
    const svgCar = evaluateCandidate(makeFile({ mime: 'image/svg+xml', title: 'File:2025 McLaren.svg', categories: ['McLaren'] }), ctx({}));
    expect(svgCar.ok).toBe(false);
  });
  it('rejects a road-car badge and a theme park that share the brand name (real misses)', () => {
    expect(t({ title: 'File:Ferrari F430 Scuderia 16M logo.jpg', mime: 'image/jpeg', width: 4288, height: 2848 }, 'commons-search').ok).toBe(false);
    expect(t({ title: 'File:Ferrari World Abu Dhabi logo.svg', mime: 'image/svg+xml', width: 512, height: 512 }, 'commons-search').ok).toBe(false);
  });
  it('rejects a photo of car advertising that merely says "logo" (real Ferrari miss)', () => {
    expect(t({ title: 'File:New logo of Scuderia Ferrari, Marlboro subliminal advertising (cropped).jpg', mime: 'image/jpeg', width: 652, height: 400 }, 'commons-search').ok).toBe(false);
  });
  it('rejects a junior-series logo that shares the team name (real Renault miss)', () => {
    expect(t({ title: 'File:2016 Formula Renault 2.0 NEC logo.svg', mime: 'image/svg+xml', width: 512, height: 512 }, 'commons-search').ok).toBe(false);
  });
  it('prefers a recent logo over a pre-2012 one', () => {
    const recent = t({ title: 'File:McLaren Racing logo (2022).png', width: 800, height: 400 });
    const ancient = t({ title: 'File:McLaren Racing - 2005 Logo.png', width: 800, height: 400 });
    expect(recent.score).toBeGreaterThan(ancient.score);
  });
  it('uses Wikipedia-title hints when the Jolpica name is cryptic (RB F1 Team → Racing Bulls)', () => {
    const f = makeFile({ title: 'File:Racing Bulls logo.svg', mime: 'image/svg+xml', copyrighted: false, licenseCode: 'pd', licenseShortName: 'Public domain' });
    const base = ctx({ type: 'team', displayName: 'RB F1 Team', season: null, source: 'commons-search' });
    expect(evaluateCandidate(f, { ...base, nameHints: ['Racing Bulls'] }).ok).toBe(true);
  });
  it('requires the team name', () => {
    expect(t({ title: 'File:Ferrari logo.svg', mime: 'image/svg+xml' }).ok).toBe(false);
  });
});
