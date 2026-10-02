/**
 * Editorial livery eras — the main colour and highlight a team is recognised by,
 * per constructor (F1DB id) and period. These are our own approximations of the
 * liveries (hex values are not taken from any official source and no logos are
 * involved); the owner reviews them. Anything not listed here falls back to a
 * national racing colour in lib/history/palette.ts.
 *
 *   [fromYear, toYear | null, main, accent, ui?]
 *
 * `ui` is only needed when `main` is a poor on-screen colour for bars/chips
 * (white or black cars): it is the colour used for timing bars and borders.
 */

export type LiveryEra = readonly [from: number, to: number | null, main: string, accent: string, ui?: string];

const GREEN = '#00573F';
const WHITE = '#F4F4F4';

export const LIVERIES: Readonly<Record<string, readonly LiveryEra[]>> = {
  // --- Ferrari: founding team, in every season since 1950 ---
  ferrari: [
    [1950, 1969, '#C8202B', WHITE],
    [1970, 1996, '#D4222A', WHITE],
    [1997, 2006, '#E3141C', '#FFDD00'],
    [2007, 2017, '#DA0A12', WHITE],
    [2018, 2025, '#DC0000', '#F7D117'],
    [2026, null, '#EE1B22', '#F7D117'],
  ],
  mercedes: [
    [1954, 1955, '#C9CED6', '#1A1A1A'],
    [2010, 2013, '#B7BEC6', '#00A19B', '#B7BEC6'],
    [2014, null, '#00D2BE', '#C0C0C0'],
  ],
  mclaren: [
    [1966, 1967, '#1D5E3A', WHITE],
    [1968, 1971, '#FF7F00', '#1A1A1A'],
    [1972, 1973, WHITE, '#C8102E', '#E04A2F'],
    [1974, 1983, '#D5242B', WHITE],
    [1984, 1996, '#E6E6E6', '#D5242B', '#D5242B'],
    [1997, 2005, '#B9BDC2', '#E10600'],
    [2006, 2007, '#C4C8CC', '#D8212E'],
    [2008, 2013, '#B8BCC0', '#D50000'],
    [2014, 2016, '#8C8F93', '#E8E8E8'],
    [2017, null, '#FF8000', '#47C7FC'],
  ],
  williams: [
    [1978, 1982, '#1A3B8F', WHITE],
    [1983, 1993, '#0D3C97', '#FFD200'],
    [1994, 1999, '#0B3B8E', '#E8E8E8'],
    [2000, 2005, '#1D4F9B', '#E10600'],
    [2006, 2013, '#1B3A78', '#E8E8E8'],
    [2014, 2018, '#1F3C8C', '#E8E8E8'],
    [2019, 2025, '#005AFF', '#041E42'],
    [2026, null, '#0A66FF', '#FFFFFF'],
  ],
  lotus: [
    [1958, 1967, GREEN, '#F4D800'],
    [1968, 1971, '#D3262E', '#C8A646'],
    [1972, 1986, '#161616', '#C8A646', '#C8A646'],
    [1987, 1990, '#F6D400', '#1A1A1A'],
    [1991, 1994, GREEN, '#F4D800'],
  ],
  'lotus-racing': [[2010, 2011, GREEN, '#F4D800']],
  'lotus-f1': [[2012, 2015, '#161616', '#C8A646', '#C8A646']],
  caterham: [[2012, 2014, GREEN, '#F4D800']],
  'red-bull': [
    [2005, 2009, '#1D2C73', '#DB2B2B', '#3A56C8'],
    [2010, 2020, '#1F3A93', '#E1B000', '#3D63D6'],
    [2021, 2025, '#2B4DA6', '#F7C300', '#3671C6'],
    [2026, null, '#3671C6', '#F7C300'],
  ],
  stewart: [[1997, 1999, WHITE, '#2E5BD6']],
  jaguar: [[2000, 2004, '#00613C', '#C9A227']],
  tyrrell: [[1970, 1998, '#0F4C9B', WHITE, '#2F6FD0']],
  brabham: [
    [1962, 1969, '#0B5D3B', '#F2C400'],
    [1970, 1976, '#1B3FA8', WHITE],
    [1977, 1992, '#1B3FA8', WHITE],
  ],
  renault: [
    [1977, 1985, '#FFD500', '#1A1A1A'],
    [2002, 2005, '#1F6FDB', '#FFD500'],
    [2006, 2009, '#FFD500', '#1F6FDB'],
    [2010, 2011, '#161616', '#C8A646', '#C8A646'],
    [2016, 2020, '#FFF500', '#1A1A1A'],
  ],
  alpine: [
    [2021, 2025, '#0A6EFF', '#FF80C7'],
    [2026, null, '#FF80C7', '#0A6EFF'],
  ],
  benetton: [
    [1986, 1994, '#00A0DC', WHITE],
    [1995, 2001, '#0067B1', '#FFD400'],
  ],
  toleman: [[1981, 1985, '#1F4EA3', WHITE]],
  ligier: [[1976, 1996, '#1D4FB0', WHITE]],
  matra: [[1966, 1972, '#1D4FB0', WHITE]],
  gordini: [[1952, 1956, '#1F56C4', WHITE]],
  'simca-gordini': [[1950, 1953, '#1F56C4', WHITE]],
  'talbot-lago': [[1950, 1951, '#1F56C4', WHITE]],
  prost: [[1997, 2001, '#2B4AA3', WHITE]],
  sauber: [
    [1993, 1999, '#1F3B99', '#E8E8E8'],
    [2000, 2005, '#2D3A8C', '#C8CDD3'],
    [2010, 2013, '#BFC3C8', '#1B2A52'],
    [2014, 2017, '#2B4C9C', '#E8E8E8'],
    [2018, 2018, '#A31621', WHITE],
  ],
  'bmw-sauber': [[2006, 2009, WHITE, '#0066B1', '#2F8CDB']],
  'alfa-romeo': [
    [1950, 1951, '#A71B2B', WHITE],
    [1979, 1985, '#B71C26', WHITE],
    [2019, 2023, '#A2121F', WHITE],
  ],
  'kick-sauber': [[2024, 2025, '#52E252', '#0A0A0A']],
  audi: [[2026, null, '#C9CDD2', '#F50537', '#F50537']],
  minardi: [[1985, 2005, '#F5D600', '#1A1A1A']],
  arrows: [
    [1978, 1997, WHITE, '#2A5CAA', '#2A5CAA'],
    [1998, 2002, '#F58220', '#1A1A1A'],
  ],
  footwork: [[1991, 1996, WHITE, '#C8102E', '#C8102E']],
  jordan: [
    [1991, 1995, '#00A650', WHITE],
    [1996, 2005, '#F7D000', '#1A1A1A'],
  ],
  midland: [[2006, 2006, '#C8102E', WHITE]],
  spyker: [[2007, 2007, '#F36F21', '#1A1A1A']],
  'force-india': [
    [2008, 2009, '#E8E8E8', '#FF7A00', '#FF7A00'],
    [2010, 2013, '#FF8A00', '#00A651'],
    [2014, 2017, '#F26B21', '#B0B5BB'],
    [2018, 2018, '#F596C8', '#3A3A8C'],
  ],
  'racing-point': [[2019, 2020, '#F596C8', '#00A0B0']],
  'aston-martin': [
    [1959, 1960, '#006F4A', '#F4D800'],
    [2021, null, '#006F62', '#CEDC00'],
  ],
  'toro-rosso': [
    [2006, 2007, '#1E3A8A', '#C8102E', '#3A5FC8'],
    [2008, 2019, '#2B4B9B', '#C8102E', '#3F6AD0'],
  ],
  alphatauri: [[2020, 2023, '#2B4562', '#E8E8E8', '#5C86B0']],
  rb: [[2024, 2024, '#6692FF', '#E8E8E8']],
  'racing-bulls': [[2025, null, '#1434CB', '#FFFFFF', '#3F5CE0']],
  haas: [
    [2016, 2017, '#B3B6BA', '#C8102E', '#C8102E'],
    [2018, 2019, '#161616', '#C8A646', '#C8A646'],
    [2020, 2022, WHITE, '#C8102E', '#C8102E'],
    [2023, null, WHITE, '#E10600', '#E10600'],
  ],
  bar: [[1999, 2005, '#C8102E', WHITE]],
  honda: [
    [1964, 1968, WHITE, '#C8102E', '#C8102E'],
    [2006, 2008, WHITE, '#2F8F46', '#2F8F46'],
  ],
  brawn: [[2009, 2009, WHITE, '#D4E600', '#D4E600']],
  toyota: [[2002, 2009, WHITE, '#C8102E', '#C8102E']],
  marussia: [[2012, 2015, '#1A1A1A', '#D81E2B', '#D81E2B']],
  manor: [[2016, 2016, '#C21A24', '#1A1A1A']],
  virgin: [[2010, 2011, '#D81E2B', '#1A1A1A']],
  hrt: [[2010, 2012, '#A8A8A8', '#C8102E']],
  'super-aguri': [[2006, 2008, '#C8102E', WHITE]],
  cadillac: [[2026, null, '#161616', '#B40000', '#B40000']],
  cooper: [[1950, 1969, GREEN, WHITE]],
  brm: [[1951, 1977, GREEN, WHITE]],
  vanwall: [[1954, 1960, GREEN, WHITE]],
  connaught: [[1952, 1959, GREEN, WHITE]],
  maserati: [[1950, 1960, '#C8202B', WHITE]],
  lancia: [[1954, 1955, '#C8202B', WHITE]],
  porsche: [[1957, 1964, '#C9CED6', '#C8102E']],
  eagle: [[1966, 1969, '#1B3FA8', WHITE]],
  penske: [[1974, 1977, '#C8102E', WHITE]],
  hesketh: [[1974, 1978, WHITE, '#1F3F8F', '#3A63C8']],
  wolf: [[1977, 1979, '#0F2D5C', '#C8A646', '#C8A646']],
  surtees: [[1970, 1978, WHITE, '#C8102E', '#C8102E']],
  fittipaldi: [[1975, 1982, '#F5D800', '#00A651']],
  'leyton-house': [[1990, 1991, '#00A9E0', WHITE]],
  lola: [[1997, 1997, '#C8102E', WHITE]],
};
