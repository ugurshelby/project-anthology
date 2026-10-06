import { describe, it, expect } from 'vitest';
import { localizedAlternates, websiteJsonLd, articleJsonLd, sportsEventJsonLd, siteUrl } from '../lib/seo';

describe('Localized SEO & Hreflang helpers', () => {
  it('generates correct alternates for default English route', () => {
    const alternates = localizedAlternates('/season', 'en');
    const base = siteUrl();

    expect(alternates.canonical).toBe(`${base}/season`);
    expect(alternates.languages.en).toBe(`${base}/season`);
    expect(alternates.languages.tr).toBe(`${base}/tr/season`);
    expect(alternates.languages['x-default']).toBe(`${base}/season`);
  });

  it('generates correct alternates for Turkish route', () => {
    const alternates = localizedAlternates('/season', 'tr');
    const base = siteUrl();

    expect(alternates.canonical).toBe(`${base}/tr/season`);
    expect(alternates.languages.en).toBe(`${base}/season`);
    expect(alternates.languages.tr).toBe(`${base}/tr/season`);
  });

  it('handles root / correctly without double slashes', () => {
    const alternates = localizedAlternates('/', 'en');
    const base = siteUrl();

    expect(alternates.canonical).toBe(`${base}`);
    expect(alternates.languages.en).toBe(`${base}`);
    expect(alternates.languages.tr).toBe(`${base}/tr`);
    expect(alternates.languages['x-default']).toBe(`${base}`);

    const trAlternates = localizedAlternates('/', 'tr');
    expect(trAlternates.canonical).toBe(`${base}/tr`);
  });

  it('websiteJsonLd sets inLanguage based on locale', () => {
    const enLd = websiteJsonLd('en');
    expect(enLd.inLanguage).toBe('en-US');

    const trLd = websiteJsonLd('tr');
    expect(trLd.inLanguage).toBe('tr-TR');
  });

  it('articleJsonLd sets localized URL and inLanguage', () => {
    const base = siteUrl();
    const trArticle = articleJsonLd({
      title: 'Ayrton Senna: Monaco 1988',
      description: 'Monaco hikayesi',
      slug: 'senna-monaco-1988',
      locale: 'tr',
    });

    expect(trArticle.inLanguage).toBe('tr-TR');
    expect(trArticle.url).toBe(`${base}/tr/anthology/senna-monaco-1988`);

    const enArticle = articleJsonLd({
      title: 'Ayrton Senna: Monaco 1988',
      description: 'Monaco story',
      slug: 'senna-monaco-1988',
      locale: 'en',
    });

    expect(enArticle.inLanguage).toBe('en-US');
    expect(enArticle.url).toBe(`${base}/anthology/senna-monaco-1988`);
  });

  it('sportsEventJsonLd produces valid SportsEvent schema', () => {
    const base = siteUrl();
    const event = sportsEventJsonLd({
      name: 'Monaco Grand Prix',
      startDate: '2026-05-24',
      circuitName: 'Circuit de Monaco',
      locality: 'Monte Carlo',
      country: 'Monaco',
      round: 6,
      season: 2026,
      url: '/season/2026/round/6',
    });

    expect(event['@context']).toBe('https://schema.org');
    expect(event['@type']).toBe('SportsEvent');
    expect(event.name).toBe('Monaco Grand Prix');
    expect(event.sport).toBe('Formula 1');
    expect(event.url).toBe(`${base}/season/2026/round/6`);
    expect(event.startDate).toBe('2026-05-24');
    expect(event.location).toEqual({
      '@type': 'Place',
      name: 'Circuit de Monaco',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Monte Carlo',
        addressCountry: 'Monaco',
      },
    });
  });
});
