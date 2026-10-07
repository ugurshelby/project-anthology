/** SeasonProgressionChart chrome follows the site locale (the EN page showed a Turkish title). */

import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import tr from '@/messages/tr.json';
import { SeasonProgressionChart } from '@/components/season/SeasonProgressionChart';
import type { DriverCumulativePoints } from '@/lib/f1/mrdata';

const Provider = NextIntlClientProvider as unknown as React.ComponentType<{
  locale: string;
  messages: unknown;
  timeZone: string;
  children?: React.ReactNode;
}>;

const series = [
  { driverName: 'Lando Norris', driverCode: 'NOR', constructorName: 'McLaren', color: '#ff8000', data: [[1, 25], [2, 43]] },
  { driverName: 'Max Verstappen', driverCode: 'VER', constructorName: 'Red Bull', color: '#3671c6', data: [[1, 18], [2, 43]] },
] as unknown as DriverCumulativePoints[];

const render = (locale: 'en' | 'tr') =>
  renderToStaticMarkup(
    React.createElement(
      Provider,
      { locale, messages: locale === 'tr' ? tr : en, timeZone: 'UTC' },
      React.createElement(SeasonProgressionChart, { series, season: 2026 }),
    ),
  );

describe('SeasonProgressionChart i18n', () => {
  it('renders English chrome on the EN page', () => {
    const html = render('en');
    expect(html).toContain('Championship trajectory · 2026');
    expect(html).toContain('Points progression and lead swings');
    expect(html).toContain('aria-label="2026 season: cumulative points of the top contenders by round"');
    expect(html).not.toMatch(/İlerleme|Salınımı|25-18-15/);
  });

  it('renders Turkish chrome on the TR page', () => {
    expect(render('tr')).toContain('Puan ilerleme eğrisi ve liderlik salınımı');
  });
});
