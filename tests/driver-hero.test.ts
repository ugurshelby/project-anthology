import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DriverProfileHero, DriverHeroGraphic } from '@/components/profile/DriverProfileHero';

describe('DriverHeroGraphic & DriverProfileHero visual redesign', () => {
  it('renders DriverHeroGraphic with driverCode as the primary mark', () => {
    const html = renderToStaticMarkup(
      React.createElement(DriverHeroGraphic, {
        mark: 'VER',
        bigNumber: '1',
        constructorId: 'red_bull',
        constructorName: 'Red Bull Racing',
      })
    );

    expect(html).toContain('SPEC // VER');
    expect(html).toContain('CAR NO. 01');
    expect(html).toContain('Red Bull Racing');
    expect(html).toContain('VER');
    expect(html).toContain('aria-hidden="true"');
  });

  it('renders DriverHeroGraphic without car number gracefully', () => {
    const html = renderToStaticMarkup(
      React.createElement(DriverHeroGraphic, {
        mark: 'SEN',
        bigNumber: null,
        constructorId: 'mclaren',
        constructorName: 'McLaren',
      })
    );

    expect(html).toContain('SPEC // SEN');
    expect(html).toContain('ACTIVE SPEC');
    expect(html).not.toContain('CAR NO.');
    expect(html).toContain('McLaren');
  });

  it('DriverProfileHero derives monogram initials from driver name when driverCode is absent', () => {
    const html = renderToStaticMarkup(
      React.createElement(DriverProfileHero, {
        title: 'Max Verstappen',
        imageAlt: 'Max Verstappen',
        constructorId: 'red_bull',
        constructorName: 'Red Bull Racing',
      })
    );

    // No driverCode provided -> falls back to "MV"
    expect(html).toContain('SPEC // MV');
    expect(html).toContain('MV');
  });

  it('DriverProfileHero uses driverCode when provided', () => {
    const html = renderToStaticMarkup(
      React.createElement(DriverProfileHero, {
        title: 'Charles Leclerc',
        driverCode: 'LEC',
        bigNumber: '16',
        imageAlt: 'Charles Leclerc',
        constructorId: 'ferrari',
        constructorName: 'Ferrari',
      })
    );

    expect(html).toContain('SPEC // LEC');
    expect(html).toContain('CAR NO. 16');
  });

  it('DriverProfileHero renders without imageSrc and includes editorial magazine structure', () => {
    const html = renderToStaticMarkup(
      React.createElement(DriverProfileHero, {
        kicker: 'Ferrari · 2026',
        title: 'Lewis Hamilton',
        meta: 'P2 · 120 PTS',
        bigNumber: '44',
        editorialTagline: 'A new chapter in red.',
        driverCode: 'HAM',
        imageAlt: 'Lewis Hamilton',
        constructorId: 'ferrari',
        constructorName: 'Ferrari',
      })
    );

    expect(html).toContain('Ferrari · 2026');
    expect(html).toContain('Lewis Hamilton');
    expect(html).toContain('P2 · 120 PTS');
    expect(html).toContain('A new chapter in red.');
    expect(html).toContain('SPEC // HAM');
    expect(html).toContain('CAR NO. 44');
  });
});
