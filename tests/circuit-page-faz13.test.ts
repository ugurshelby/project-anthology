/**
 * Circuit page (plan Faz 13): the facts strip only shows numbers we have (laps and
 * distance after the race is run), parses the lap record, and the track outline is
 * read from the licensed SVG path.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import tr from '@/messages/tr.json';
import { CircuitFactsRibbon, parseLapRecord } from '@/components/circuit/CircuitFactsRibbon';
import { trackPathFromSvg } from '@/components/circuit/TrackTrace';

const Provider = NextIntlClientProvider as unknown as React.ComponentType<{
  locale: string;
  messages: unknown;
  timeZone: string;
  children?: React.ReactNode;
}>;

const render = (props: React.ComponentProps<typeof CircuitFactsRibbon>, locale: 'en' | 'tr' = 'en') =>
  renderToStaticMarkup(
    React.createElement(Provider, { locale, messages: locale === 'tr' ? tr : en, timeZone: 'UTC' }, React.createElement(CircuitFactsRibbon, props)),
  );

describe('parseLapRecord', () => {
  it('splits time, holder and year', () => {
    expect(parseLapRecord('1:12.909 — Hamilton (2021)')).toEqual({ time: '1:12.909', holder: 'Hamilton', year: '2021' });
  });
  it('returns null for other shapes', () => {
    expect(parseLapRecord('n/a')).toBeNull();
    expect(parseLapRecord(undefined)).toBeNull();
  });
});

describe('CircuitFactsRibbon', () => {
  it('computes the race distance from laps × length once the race is run (Monaco 78 × 3.337)', () => {
    const html = render({ lengthKm: 3.337, corners: 19, laps: 78, lapRecord: '1:12.909 — Hamilton (2021)' });
    expect(html).toContain('260.286');
    expect(html).toContain('1:12.909');
    expect(html).toContain('Hamilton · 2021');
  });
  it('shows no laps or distance before the race (nothing estimated)', () => {
    const html = render({ lengthKm: 3.337, corners: 19, laps: null, lapRecord: null }, 'tr');
    expect(html).toContain('3.337');
    expect(html).not.toContain('Yarış mesafesi');
    expect(html).not.toContain('Tur Rekoru');
  });
  it('renders nothing without data', () => {
    expect(render({ lengthKm: null, corners: null, laps: null, lapRecord: null })).toBe('');
  });
});

describe('trackPathFromSvg', () => {
  it('reads the single path of a licensed outline file', () => {
    const svg = readFileSync(join(process.cwd(), 'public/circuits/mc-1929.svg'), 'utf8');
    expect(trackPathFromSvg(svg)).toMatch(/^M\d/);
  });
  it('returns null when there is no path', () => {
    expect(trackPathFromSvg('<svg></svg>')).toBeNull();
  });
});
