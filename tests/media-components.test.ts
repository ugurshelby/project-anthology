// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ApexImage } from '@/components/media/ApexImage';
import { variantLoader } from '@/components/media/variantLoader';
import { VariantImage } from '@/components/media/VariantImage';
import { CircuitPlaceholder } from '@/components/media/placeholders/CircuitPlaceholder';
import { TeamPlaceholder } from '@/components/media/placeholders/TeamPlaceholder';
import { CarPlaceholder } from '@/components/media/placeholders/CarPlaceholder';
import { DriverPlaceholder } from '@/components/media/placeholders/DriverPlaceholder';
import { MediaAssetView } from '@/components/media/MediaAssetView';
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
    it('shows the circuit artwork with the name as caption and label', () => {
      const html = renderToStaticMarkup(
        React.createElement(CircuitPlaceholder, { seed: 'monza', name: 'Autodromo Nazionale Monza' }),
      );
      expect(html).toContain('role="img"');
      expect(html).toContain('Autodromo Nazionale Monza circuit layout schematic');
      expect(html).toContain('/placeholders/circuit-1376.webp');
      expect(html).toContain('AUTODROMO NAZIONALE MONZA');
      expect(html).not.toContain('<svg');
    });
  });

  describe('TeamPlaceholder', () => {
    it('shows the shield artwork, captioned outside compact slots', () => {
      const html = renderIntl(
        React.createElement(TeamPlaceholder, { seed: 'ferrari', name: 'Scuderia Ferrari', teamColor: '#e80020' }),
      );
      expect(html).toContain('role="img"');
      expect(html).toContain('SCUDERIA FERRARI team mark');
      expect(html).toContain('/placeholders/team-768.webp');
      expect(html).toContain('>SCUDERIA FERRARI<');
      const compact = renderIntl(React.createElement(TeamPlaceholder, { seed: 'ferrari', name: 'Scuderia Ferrari', compact: true }));
      expect(compact).toContain('object-contain');
      expect(compact).not.toContain('>SCUDERIA FERRARI<');
    });
  });

  describe('CarPlaceholder', () => {
    it('shows the car artwork labelled with name and season', () => {
      const html = renderToStaticMarkup(
        React.createElement(CarPlaceholder, { seed: 'mclaren:2025', name: 'McLaren MCL39', teamColor: '#ff8000', season: 2025 }),
      );
      expect(html).toContain('role="img"');
      expect(html).toContain('aria-label="MCLAREN MCL39 · 2025"');
      expect(html).toContain('/placeholders/car-1280.webp');
    });

    it("picks the artwork of the car's era, the halo car from 2018 and without a season", () => {
      const src = (seed: string) =>
        /\/placeholders\/[^"]+\.webp/.exec(renderToStaticMarkup(React.createElement(CarPlaceholder, { seed })))?.[0];
      expect(src('ferrari:1952')).toBe('/placeholders/car-1950-1280.webp');
      expect(src('lotus:1963')).toBe('/placeholders/car-1961-1280.webp');
      expect(src('lotus:1978')).toBe('/placeholders/car-1968-1280.webp');
      expect(src('mclaren:1988')).toBe('/placeholders/car-1983-1280.webp');
      expect(src('ferrari:2004')).toBe('/placeholders/car-1994-1280.webp');
      expect(src('red_bull:2013')).toBe('/placeholders/car-2009-1280.webp');
      expect(src('mercedes:2018')).toBe('/placeholders/car-1280.webp');
      expect(src('iconic:ferrari-f2004')).toBe('/placeholders/car-1280.webp');
    });

    it('takes the season from the seed and does not repeat a year already in the name', () => {
      expect(renderToStaticMarkup(React.createElement(CarPlaceholder, { seed: 'iconic:ferrari-f2004' }))).toContain('FERRARI F2004');
      expect(renderToStaticMarkup(React.createElement(CarPlaceholder, { seed: 'haas:2024' }))).toContain('aria-label="HAAS · 2024"');
      expect(renderToStaticMarkup(React.createElement(CarPlaceholder, { seed: 'ferrari:2004', name: 'Ferrari 2004' }))).toContain(
        'aria-label="FERRARI 2004"',
      );
    });
  });

  describe('DriverPlaceholder', () => {
    it('shows the driver artwork without a caption (name and number sit next to it everywhere)', () => {
      const html = renderToStaticMarkup(
        React.createElement(DriverPlaceholder, { seed: 'norris', name: 'Lando Norris', driverCode: 'NOR', driverNumber: 4, teamColor: '#ff8000' }),
      );
      expect(html).toContain('role="img"');
      expect(html).toContain('Lando Norris driver badge');
      expect(html).toContain('/placeholders/driver-896.webp');
      expect(html).not.toContain('NOR');
      expect(html).toContain('loading="lazy"');
    });

    it('loads eagerly with high priority when it stands in for a priority image', () => {
      const html = renderToStaticMarkup(React.createElement(DriverPlaceholder, { seed: 'norris', name: 'Lando Norris', priority: true }));
      expect(html).toContain('fetchPriority="high"');
      expect(html).toContain('loading="eager"');
    });
  });

  describe('MediaAssetView', () => {
    it('shows a neutral pending surface, not the placeholder artwork, while the lookup is open', () => {
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
      expect(html).not.toContain('/placeholders/');
    });

    it('renders the placeholder artwork when initialResult is placeholder', () => {
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
      expect(html).toContain('Lando Norris driver badge');
      expect(html).toContain('/placeholders/driver-896.webp');
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
  it('shows only the licensed photo when one exists, never the placeholder next to it', async () => {
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
    expect(photo).not.toContain('/placeholders/');

    const none = renderIntl(
      React.createElement(MachineryVisual, {
        car,
        media: { status: 'placeholder', type: 'car', key: 'iconic:redbull-rb19', placeholder: { kind: 'car', seed: 'iconic:redbull-rb19' } },
      }),
    );
    expect(none).toContain('/placeholders/car-1280.webp');
  });
});

const variantImage = (): MediaResult => ({
  status: 'image',
  type: 'circuit',
  key: 'monza',
  image: {
    src: 'https://cdn.test/monza/1600.webp',
    srcSet: '',
    width: 1600,
    height: 900,
    variants: [320, 960, 1600].map((w) => ({ w, h: Math.round(w * 0.5625), src: `https://cdn.test/monza/${w}.webp` })),
    blurDataURL: null,
    dominantColor: '#101010',
  },
  attribution: { text: 'A / Wikimedia Commons, CC BY 4.0', author: 'A', license: 'CC BY 4.0', licenseUrl: null, sourceUrl: null, trademark: false },
});

describe('variantLoader', () => {
  it('picks the smallest variant at least as wide as requested, else the largest', () => {
    const load = variantLoader([
      { w: 1600, src: 'c' },
      { w: 320, src: 'a' },
      { w: 960, src: 'b' },
    ]);
    expect(load({ src: 'x', width: 300 })).toBe('a');
    expect(load({ src: 'x', width: 640 })).toBe('b');
    expect(load({ src: 'x', width: 4000 })).toBe('c');
  });
});

describe('VariantImage (8.3, server-safe loader)', () => {
  const variants = [
    { w: 320, src: 'https://cdn.test/driver/alonso/320.webp' },
    { w: 640, src: 'https://cdn.test/driver/alonso/640.webp' },
    { w: 1280, src: 'https://cdn.test/driver/alonso/1280.webp' },
  ];
  const render = (v: typeof variants) =>
    renderToStaticMarkup(
      React.createElement(VariantImage, {
        src: v[v.length - 1].src,
        variants: v,
        alt: 'Alonso',
        fill: true,
        fetchPriority: 'high',
        loading: 'eager',
        sizes: '(max-width: 768px) 155vw, 80vw',
      }),
    );

  it('builds a srcset from the variant list with priority attributes', () => {
    const html = render(variants);
    const srcset = /srcSet="([^"]+)"/i.exec(html)?.[1] ?? '';
    expect(srcset).toContain('/alonso/640.webp');
    expect(srcset).toContain('/alonso/1280.webp');
    expect(html).toMatch(/fetchPriority="high"/i);
    expect(html).toContain('loading="eager"');
  });

  it('serves a single variant as is, without a srcset', () => {
    const html = render(variants.slice(2));
    expect(html).toContain('src="https://cdn.test/driver/alonso/1280.webp"');
    expect(html).not.toMatch(/srcSet=/i);
  });
});

describe('MediaAssetView image output (8.2)', () => {
  const view = (extra: Record<string, unknown> = {}) =>
    renderIntl(
      React.createElement(MediaAssetView, {
        type: 'circuit',
        entityKey: 'monza',
        initialResult: variantImage(),
        alt: 'Monza',
        ...extra,
      }),
    );

  it('emits a srcset with at least two distinct variant URLs for a multi-variant result', () => {
    const srcset = /srcSet="([^"]+)"/i.exec(view())?.[1] ?? '';
    const urls = new Set(srcset.split(',').map((p) => p.trim().split(' ')[0]));
    expect(urls.size).toBeGreaterThanOrEqual(2);
    expect(srcset).toContain('/monza/960.webp');
  });

  it('priority sets fetchpriority=high and eager loading; without it the image is lazy', () => {
    const hi = view({ priority: true });
    expect(hi).toMatch(/fetchPriority="high"/i);
    expect(hi).toContain('loading="eager"');
    const lo = view();
    expect(lo).toContain('loading="lazy"');
    expect(lo).not.toMatch(/fetchPriority="high"/i);
  });

  it('defaults sizes to 100vw', () => {
    expect(view()).toContain('sizes="100vw"');
  });
});

describe('image load errors (8.2, K4)', () => {
  let root: Root | null = null;
  let host: HTMLElement | null = null;
  afterEach(() => {
    act(() => root?.unmount());
    host?.remove();
    root = null;
    host = null;
  });
  const mount = (el: React.ReactElement) => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    act(() => root!.render(el));
    return host;
  };

  it('MediaAssetView swaps to the type placeholder on img error and never retries the broken URL', () => {
    const el = mount(
      React.createElement(
        Provider,
        { locale: 'en', messages: en, timeZone: 'UTC' },
        React.createElement(MediaAssetView, { type: 'circuit', entityKey: 'monza', initialResult: variantImage(), alt: 'Monza', name: 'Monza' }),
      ),
    );
    const img = el.querySelector('img');
    expect(img).not.toBeNull();
    act(() => {
      img!.dispatchEvent(new Event('error'));
    });
    const after = [...el.querySelectorAll('img')].map((i) => i.getAttribute('src'));
    expect(after).toEqual(['/placeholders/circuit-1376.webp']);
  });

  it('ApexImage renders ApexFallback on img error', () => {
    const el = mount(React.createElement(ApexImage, { src: 'https://cdn.test/x.webp', alt: 'x', width: 10, height: 10 }));
    const img = el.querySelector('img');
    expect(img).not.toBeNull();
    act(() => {
      img!.dispatchEvent(new Event('error'));
    });
    expect(el.querySelector('img')).toBeNull();
  });

  it('ApexImage priority sets fetchpriority=high and eager loading', () => {
    const el = mount(React.createElement(ApexImage, { src: 'https://cdn.test/x.webp', alt: 'x', width: 10, height: 10, priority: true }));
    const img = el.querySelector('img');
    expect(img?.getAttribute('fetchpriority')).toBe('high');
    expect(img?.getAttribute('loading')).toBe('eager');
  });
});
