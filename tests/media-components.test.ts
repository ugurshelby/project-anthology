import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CircuitPlaceholder } from '@/components/media/placeholders/CircuitPlaceholder';
import { TeamPlaceholder } from '@/components/media/placeholders/TeamPlaceholder';
import { CarPlaceholder } from '@/components/media/placeholders/CarPlaceholder';
import { DriverPlaceholder } from '@/components/media/placeholders/DriverPlaceholder';
import { MediaAssetView } from '@/components/media/MediaAssetView';
import { F1CarSilhouette, carEraForSeason } from '@/components/media/F1CarSilhouette';
import type { MediaResult } from '@/lib/media/read';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import tr from '@/messages/tr.json';

const Provider = NextIntlClientProvider as unknown as React.ComponentType<{ locale: string; messages: unknown; timeZone: string; children?: React.ReactNode }>;

/** MediaAssetView reads `ui.media` strings, so it renders inside the intl provider like on the site. */
const renderIntl = (el: React.ReactElement, locale: 'en' | 'tr' = 'en') =>
  renderToStaticMarkup(React.createElement(Provider, { locale, messages: locale === 'tr' ? tr : en, timeZone: 'UTC' }, el));

describe('Media Placeholders & MediaAssetView (Section 8 & 9 compliance)', () => {
  describe('CircuitPlaceholder', () => {
    it('renders vector track contour with CAD grid and accessibility labels', () => {
      const html = renderToStaticMarkup(
        React.createElement(CircuitPlaceholder, {
          seed: 'monza',
          name: 'Autodromo Nazionale Monza',
        })
      );

      expect(html).toContain('role="img"');
      expect(html).toContain('Autodromo Nazionale Monza circuit layout schematic');
      expect(html).toContain('FIA GRADE 1 SPEC');
      expect(html).toContain('CAD_SCHEMATIC');
      expect(html).toContain('DATUM: MONZA');
      expect(html).toContain('<svg');
    });
  });

  describe('TeamPlaceholder', () => {
    it('renders typographic wordmark with team secondary color and carbon texture', () => {
      const html = renderToStaticMarkup(
        React.createElement(TeamPlaceholder, {
          seed: 'ferrari',
          name: 'Scuderia Ferrari',
          teamColor: '#e80020',
        })
      );

      expect(html).toContain('role="img"');
      expect(html).toContain('SCUDERIA FERRARI typography badge');
      expect(html).toContain('FORMULA 1 CONSTRUCTOR');
      expect(html).toContain('SCUDERIA');
      expect(html).toContain('#e80020');
      expect(html).toContain('<svg');
    });
  });

  describe('CarPlaceholder', () => {
    it('draws a two-tone livery silhouette with name and season, no blueprint chrome', () => {
      const html = renderToStaticMarkup(
        React.createElement(CarPlaceholder, {
          seed: 'mclaren:2025',
          name: 'McLaren MCL39',
          teamColor: '#ff8000',
          accentColor: '#47c7fc',
          season: 2025,
        })
      );

      expect(html).toContain('role="img"');
      expect(html).toContain('aria-label="MCLAREN MCL39 · 2025"');
      expect(html).toContain('#ff8000');
      expect(html).toContain('#47c7fc');
      expect(html).not.toContain('CAD');
      expect(html).not.toContain('APEX_CHASSIS');
    });

    it('takes the season from the seed and derives a contrasting accent when none is given', () => {
      const html = renderToStaticMarkup(
        React.createElement(CarPlaceholder, { seed: 'iconic:ferrari-f2004', teamColor: '#e80020' })
      );
      expect(html).toContain('FERRARI F2004');
      expect(html).toContain('#f4f4f4');
      const light = renderToStaticMarkup(React.createElement(CarPlaceholder, { seed: 'haas:2024', teamColor: '#f4f4f4' }));
      expect(light).toContain('aria-label="HAAS · 2024"');
      expect(light).toContain('#15171a');
    });
  });

  describe('F1CarSilhouette', () => {
    it('picks the car shape from the season: wedge, raised nose, halo', () => {
      expect(carEraForSeason(1970)).toBe('classic');
      expect(carEraForSeason(1988)).toBe('classic');
      expect(carEraForSeason(1992)).toBe('raised');
      expect(carEraForSeason(2017)).toBe('raised');
      expect(carEraForSeason(2018)).toBe('halo');
      expect(carEraForSeason(undefined)).toBe('halo');
    });

    it('draws the halo only on halo-era cars', () => {
      const svg = (era: 'classic' | 'halo') =>
        renderToStaticMarkup(React.createElement(F1CarSilhouette, { body: '#1e41ff', accent: '#f7c300', era }));
      expect(svg('halo')).toContain('stroke-linecap="round"');
      expect(svg('classic')).not.toContain('stroke-linecap="round"');
      expect(svg('halo')).toContain('#f7c300');
    });
  });

  describe('DriverPlaceholder', () => {
    it('renders FIA 3-letter mark, racing number, and helmet outline', () => {
      const html = renderToStaticMarkup(
        React.createElement(DriverPlaceholder, {
          seed: 'norris',
          name: 'Lando Norris',
          driverCode: 'NOR',
          driverNumber: 4,
          teamColor: '#ff8000',
        })
      );

      expect(html).toContain('role="img"');
      expect(html).toContain('Lando Norris driver badge');
      expect(html).toContain('NOR');
      expect(html).toContain('#4');
      expect(html).toContain('LANDO NORRIS');
      expect(html).toContain('FIA PILOT // ROSTER');
      expect(html).toContain('#ff8000');
    });
  });

  describe('MediaAssetView', () => {
    it('shows a neutral pending surface, not the SVG placeholder, while the lookup is open', () => {
      const html = renderIntl(
        React.createElement(MediaAssetView, {
          type: 'car',
          entityKey: 'red_bull:2025',
          alt: 'Red Bull 2025 car',
          name: 'Red Bull 2025',
          teamColor: '#3671c6',
        })
      );
      expect(html).toContain('aria-busy="true"');
      expect(html).not.toContain('<svg');
    });

    it('renders SVG placeholder when initialResult is placeholder', () => {
      const placeholderResult: MediaResult = {
        status: 'placeholder',
        type: 'driver',
        key: 'norris',
        placeholder: { kind: 'driver', seed: 'norris' },
      };

      const html = renderIntl(
        React.createElement(MediaAssetView, {
          type: 'driver',
          entityKey: 'norris',
          initialResult: placeholderResult,
          alt: 'Lando Norris',
          name: 'Lando Norris',
          driverCode: 'NOR',
          driverNumber: 4,
          teamColor: '#ff8000',
        })
      );

      expect(html).toContain('role="img"');
      expect(html).toContain('NOR');
      expect(html).toContain('#4');
    });

    it('renders verified image and CC-BY attribution when initialResult is image', () => {
      const imageResult: MediaResult = {
        status: 'image',
        type: 'driver',
        key: 'norris',
        image: {
          src: 'https://example.supabase.co/storage/v1/object/public/media/driver/norris/abc/640.webp',
          srcSet: 'https://example.supabase.co/.../160.webp 160w, ... 640w',
          width: 640,
          height: 800,
          variants: [{ w: 160, h: 200, src: 'https://example.supabase.co/.../160.webp' }],
          blurDataURL: 'data:image/webp;base64,AAAA',
          dominantColor: '#ff8000',
        },
        attribution: {
          text: 'Stepro / Wikimedia Commons, CC BY-SA 4.0',
          author: 'Stepro',
          license: 'CC BY-SA 4.0',
          licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
          sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lando_Norris.jpg',
          trademark: false,
        },
      };

      const html = renderIntl(
        React.createElement(MediaAssetView, {
          type: 'driver',
          entityKey: 'norris',
          initialResult: imageResult,
          alt: 'Lando Norris portrait',
        })
      );

      expect(html).toContain('img');
      expect(html).toContain('Lando Norris portrait');
      expect(html).toContain('Stepro / Wikimedia Commons, CC BY-SA 4.0');
      expect(html).toContain('Image license: Stepro / Wikimedia Commons, CC BY-SA 4.0');
      expect(html).toContain('aria-expanded="false"');
    });

    it('localizes the attribution badge label (AG-2)', () => {
      const imageResult: MediaResult = {
        status: 'image',
        type: 'driver',
        key: 'norris',
        image: {
          src: 'https://example.supabase.co/storage/v1/object/public/media/driver/norris/abc/640.webp',
          srcSet: '',
          width: 640,
          height: 800,
          variants: [],
          blurDataURL: null,
          dominantColor: null,
        },
        attribution: {
          text: 'Stepro / Wikimedia Commons, CC BY-SA 4.0',
          author: 'Stepro',
          license: 'CC BY-SA 4.0',
          licenseUrl: null,
          sourceUrl: null,
          trademark: false,
        },
      };
      const el = React.createElement(MediaAssetView, {
        type: 'driver',
        entityKey: 'norris',
        initialResult: imageResult,
        alt: 'Lando Norris',
      });
      expect(renderIntl(el, 'tr')).toContain('aria-label="Görsel lisansı: Stepro / Wikimedia Commons, CC BY-SA 4.0"');
      expect(renderIntl(el, 'en')).toContain('aria-label="Image license: Stepro / Wikimedia Commons, CC BY-SA 4.0"');
    });

    it('keeps EN and TR media strings in sync', () => {
      expect(Object.keys(tr.ui.media).sort()).toEqual(Object.keys(en.ui.media).sort());
    });
  });
});

describe('MediaCredit and responsive variants', () => {
  const attribution = {
    text: 'Dietmar Rabich / Wikimedia Commons, CC BY-SA 4.0',
    author: 'Dietmar Rabich',
    license: 'CC BY-SA 4.0',
    licenseUrl: null,
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
    trademark: false,
  };

  it('shows a localized label, the credit text and a labelled source link', async () => {
    const { MediaCredit } = await import('@/components/media/MediaCredit');
    const enHtml = renderIntl(React.createElement(MediaCredit, { attribution }));
    expect(enHtml).toContain('Photo:');
    expect(enHtml).toContain('Dietmar Rabich / Wikimedia Commons, CC BY-SA 4.0');
    expect(enHtml).toContain('href="https://commons.wikimedia.org/wiki/File:Example.jpg"');
    expect(enHtml).toContain('aria-label="Open the original file on Wikimedia Commons (opens in a new tab)"');
    const trHtml = renderIntl(React.createElement(MediaCredit, { attribution: { ...attribution, trademark: true } }), 'tr');
    expect(trHtml).toContain('Marka:');
    expect(renderIntl(React.createElement(MediaCredit, { attribution: null }))).toBe('');
  });

  it('lets the browser pick the smallest fitting WebP variant', async () => {
    const { ApexImage } = await import('@/components/media/ApexImage');
    const base = 'https://example.supabase.co/storage/v1/object/public/media/circuit/x/abc';
    const html = renderToStaticMarkup(
      React.createElement(ApexImage, {
        src: `${base}/1600.webp`,
        alt: '',
        fill: true,
        sizes: '100vw',
        variants: [
          { w: 480, src: `${base}/480.webp` },
          { w: 960, src: `${base}/960.webp` },
          { w: 1600, src: `${base}/1600.webp` },
        ],
      }),
    );
    const srcset = /srcSet="([^"]+)"|srcset="([^"]+)"/.exec(html);
    const value = srcset?.[1] ?? srcset?.[2] ?? '';
    expect(value).toContain(`${base}/960.webp 640w`);
    expect(value).toContain(`${base}/960.webp 828w`);
    expect(value).toContain(`${base}/1600.webp 1080w`);
  });
});

describe('MachineryVisual', () => {
  it('shows only the licensed photo when one exists, never the silhouette next to it', async () => {
    const { MachineryVisual } = await import('@/components/machinery/MachineryVisual');
    const { getMachineryCar } = await import('@/data/machinery/cars');
    const car = getMachineryCar('redbull-rb19')!;
    const media: MediaResult = {
      status: 'image',
      type: 'car',
      key: 'iconic:redbull-rb19',
      image: {
        src: 'https://example.supabase.co/storage/v1/object/public/media/car/rb19/1600.webp',
        srcSet: '',
        width: 1600,
        height: 900,
        variants: [],
        blurDataURL: null,
        dominantColor: '#20242c',
      },
      attribution: {
        text: 'Lukas Raich / Wikimedia Commons, CC BY-SA 4.0',
        author: 'Lukas Raich',
        license: 'CC BY-SA 4.0',
        licenseUrl: null,
        sourceUrl: null,
        trademark: false,
      },
    };
    const photo = renderIntl(React.createElement(MachineryVisual, { car, media }));
    expect(photo).toContain('1600.webp');
    expect(photo).not.toContain('<svg');

    const none = renderIntl(
      React.createElement(MachineryVisual, {
        car,
        media: { status: 'placeholder', type: 'car', key: 'iconic:redbull-rb19', placeholder: { kind: 'car', seed: 'iconic:redbull-rb19' } },
      }),
    );
    expect(none).toContain('<svg');
    // two-tone: the 2023 Red Bull livery body and accent
    expect(none.toLowerCase()).toContain('#2b4da6');
    expect(none.toLowerCase()).toContain('#f7c300');
  });
});
