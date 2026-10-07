/**
 * CircuitElevationProfile: UI strings follow the site locale (the EN page used to show
 * Turkish labels), only curated circuits render, and no invented fallback numbers or
 * official-source claim appear.
 */

import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import tr from '@/messages/tr.json';
import { CircuitElevationProfile } from '@/components/circuit/CircuitElevationProfile';
import { getTopographyProfile, hasElevationProfile } from '@/data/circuits/topography';

const Provider = NextIntlClientProvider as unknown as React.ComponentType<{
  locale: string;
  messages: unknown;
  timeZone: string;
  children?: React.ReactNode;
}>;

const render = (props: React.ComponentProps<typeof CircuitElevationProfile>, locale: 'en' | 'tr') =>
  renderToStaticMarkup(
    React.createElement(
      Provider,
      { locale, messages: locale === 'tr' ? tr : en, timeZone: 'UTC' },
      React.createElement(CircuitElevationProfile, props),
    ),
  );

describe('CircuitElevationProfile', () => {
  it('renders English labels and the English incline on the EN page', () => {
    const html = render({ circuitId: 'spa', lengthKm: 7.004, corners: 19, drsZones: 2 }, 'en');
    expect(html).toContain('Track topography and engineering index');
    expect(html).toContain('7.004 km · 19 corners');
    expect(html).toContain('2 DRS zones');
    expect(html).toContain(getTopographyProfile('spa')!.keyIncline);
    expect(html).toContain('Editorial estimates, not official FIA data');
    expect(html).not.toMatch(/İrtifa|Viraj|Bölgesi|Şanzıman|fren enerjisi/);
  });

  it('renders Turkish labels and the Turkish incline on the TR page', () => {
    const html = render({ circuitId: 'red_bull_ring', lengthKm: 4.318, corners: 10, drsZones: 3 }, 'tr');
    expect(html).toContain('Pist topoğrafyası ve mühendislik indeksi');
    expect(html).toContain('4.318 km · 10 viraj');
    expect(html).toContain('3 DRS bölgesi');
    expect(html).toContain(getTopographyProfile('red_bull_ring')!.keyInclineTr);
    expect(html).toContain('Yüksek');
  });

  it('shows no lap chips for values it does not have (no invented defaults)', () => {
    const html = render({ circuitId: 'monza' }, 'en');
    expect(html).not.toContain(' km');
    expect(html).not.toContain('DRS');
  });

  it('renders nothing for a circuit without a curated profile', () => {
    expect(hasElevationProfile('kyalami')).toBe(false);
    expect(render({ circuitId: 'kyalami', lengthKm: 4.5 }, 'en')).toBe('');
    expect(hasElevationProfile('red-bull-ring')).toBe(true);
  });

  it('keeps EN and TR elevation strings in sync', () => {
    const keys = (o: object): string[] =>
      Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? keys(v).map((s) => `${k}.${s}`) : [k]));
    expect(keys(tr.ui.circuit.elevation).sort()).toEqual(keys(en.ui.circuit.elevation).sort());
  });
});

describe('CircuitLoreCards header', () => {
  it('follows the site locale and has no fake link cue', async () => {
    const { CircuitLoreCards } = await import('@/components/circuit/CircuitLoreCards');
    const { hasCircuitLore } = await import('@/data/circuits/lore');
    expect(hasCircuitLore('monaco')).toBe(true);
    expect(hasCircuitLore('kyalami')).toBe(false);
    const renderLore = (locale: 'en' | 'tr') =>
      renderToStaticMarkup(
        React.createElement(
          Provider,
          { locale, messages: locale === 'tr' ? tr : en, timeZone: 'UTC' },
          React.createElement(CircuitLoreCards, { circuitId: 'monaco' }),
        ),
      );
    const enHtml = renderLore('en');
    expect(enHtml).toContain('Circuit lore');
    expect(enHtml).toMatch(/\d+ iconic moments?/);
    expect(enHtml).not.toMatch(/PİST|İkonik|Apex Archive/);
    expect(renderLore('tr')).toContain('Pistin tarihini yazan anlar');
  });
});
