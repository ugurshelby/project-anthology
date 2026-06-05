import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

/**
 * Default site OpenGraph image (1200×630). Static brand card in the Anthology
 * palette: near-black background, red accent bar, condensed uppercase title.
 * No external font fetch — uses system sans so build/runtime stays reliable.
 */
export const runtime = 'nodejs';
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0a0a0a',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 22,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: 'rgba(244,241,234,0.5)',
          }}
        >
          <div style={{ width: 40, height: 6, background: '#ff1801', marginRight: 18 }} />
          Formula 1
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 150,
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: -2,
              color: '#f4f1ea',
            }}
          >
            ANTHOLOGY
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 30,
              fontWeight: 300,
              color: 'rgba(244,241,234,0.7)',
              maxWidth: 900,
            }}
          >
            {SITE_TAGLINE}
          </div>
        </div>

        <div style={{ height: 8, width: '100%', background: '#ff1801' }} />
      </div>
    ),
    { ...size },
  );
}
