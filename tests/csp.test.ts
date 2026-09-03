import { describe, it, expect } from 'vitest';
import { CSP, CSP_DIRECTIVES } from '@/lib/security/csp';

describe('CSP', () => {
  it('allows Vercel Toolbar fonts from vercel.live', () => {
    const fontSrc = CSP_DIRECTIVES.find((d) => d.startsWith('font-src'));
    expect(fontSrc).toContain("'self'");
    expect(fontSrc).toContain('data:');
    expect(fontSrc).toContain('https://vercel.live');
  });

  it('already allows the Toolbar script and frame hosts', () => {
    expect(CSP).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live");
    expect(CSP).toContain("frame-src 'self' https://vercel.live");
  });
});
