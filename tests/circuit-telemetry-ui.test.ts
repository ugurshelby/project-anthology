import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import { SpeedProfile } from '@/components/circuit/SpeedProfile';
import { TelemetryStats } from '@/components/circuit/TelemetryStats';
import { TelemetryTrace } from '@/components/circuit/TelemetryTrace';
import { isCircuitTelemetry, type CircuitTelemetry } from '@/lib/telemetry/types';
import monza from '@/data/circuits/telemetry/monza.json';
import en from '@/messages/en.json';
import tr from '@/messages/tr.json';

const Provider = NextIntlClientProvider as unknown as React.ComponentType<{ locale: string; messages: unknown; timeZone: string; children?: React.ReactNode }>;
const render = (el: React.ReactElement, locale: 'en' | 'tr') =>
  renderToStaticMarkup(React.createElement(Provider, { locale, messages: locale === 'tr' ? tr : en, timeZone: 'UTC' }, el));

const telemetry = monza as unknown as CircuitTelemetry;

describe('circuit telemetry UI (13.4)', () => {
  it('uses a valid telemetry file', () => {
    expect(isCircuitTelemetry(monza)).toBe(true);
  });

  it('shows the stored figures with locale formatting and the OpenF1 source line', () => {
    const html = render(React.createElement(TelemetryStats, { telemetry }), 'tr');
    expect(html).toContain('342 km/sa');
    expect(html).toContain('%78,6');
    expect(html).toContain('≥ 44');
    expect(html).toContain('OpenF1 · 2026 Sıralama · GAS pole turu 1:21.786 · CC BY-NC-SA 4.0');
    expect(render(React.createElement(TelemetryStats, { telemetry }), 'en')).toContain('78.6%');
  });

  it('draws one speed line and the two sector boundaries', () => {
    const html = render(React.createElement(SpeedProfile, { telemetry }), 'en');
    expect(html.match(/<polyline/g)).toHaveLength(1);
    expect(html.match(/stroke-dasharray="4 4"/g)).toHaveLength(2);
  });

  it('renders the trace in three sector lines with one focusable pin per slow point', () => {
    const html = render(
      React.createElement(TelemetryTrace, {
        points: telemetry.samples.map(([, dM, , , , , x, y]) => ({ x, y, dM })),
        boundariesM: telemetry.sectors.boundariesM,
        pins: telemetry.slowPoints,
        label: 'Monza',
      }),
      'tr',
    );
    expect(html.match(/<polyline/g)).toHaveLength(3);
    expect(html.match(/role="button"/g)).toHaveLength(telemetry.slowPoints.length);
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('km/sa');
  });
});
