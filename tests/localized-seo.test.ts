import { describe, it, expect } from 'vitest';
import { localizedAlternates, websiteJsonLd, articleJsonLd, siteUrl } from '../lib/seo';

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
});
