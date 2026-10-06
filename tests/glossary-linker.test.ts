import { describe, expect, it } from 'vitest';
import { tokenizeWithGlossary } from '@/lib/glossary/linker';

describe('tokenizeWithGlossary', () => {
  it('returns plain text when no terms match', () => {
    const text = 'Formula 1 is the pinnacle of motorsport racing.';
    const tokens = tokenizeWithGlossary(text, 'en');
    expect(tokens).toEqual([{ type: 'text', content: text }]);
  });

  it('matches English technical terms like Diffuser and DRS', () => {
    const text = 'The car gained speed when opening DRS before the corner with a powerful Diffuser.';
    const tokens = tokenizeWithGlossary(text, 'en');
    const terms = tokens.filter((t) => t.type === 'term');
    expect(terms.length).toBe(2);
    expect(terms[0].slug).toBe('drs');
    expect(terms[0].content).toBe('DRS');
    expect(terms[1].slug).toBe('diffuser');
    expect(terms[1].content).toBe('Diffuser');
  });

  it('matches Turkish technical terms and aliases with special characters', () => {
    const text = 'Williams FW14B aktif süspansiyon ve çift difüzör ile rakiplerini geride bıraktı.';
    const tokens = tokenizeWithGlossary(text, 'tr');
    const terms = tokens.filter((t) => t.type === 'term');
    expect(terms.length).toBe(2);
    expect(terms[0].slug).toBe('active-suspension');
    expect(terms[0].content).toBe('aktif süspansiyon');
    expect(terms[1].slug).toBe('diffuser');
    expect(terms[1].content).toBe('çift difüzör');
  });

  it('does not re-link the same term slug multiple times in a single block', () => {
    const text = 'DRS was enabled on lap 3. The DRS gap was under 1 second.';
    const tokens = tokenizeWithGlossary(text, 'en');
    const drsTerms = tokens.filter((t) => t.type === 'term' && t.slug === 'drs');
    expect(drsTerms.length).toBe(1);
    // The second occurrence should be regular text
    const textParts = tokens.filter((t) => t.type === 'text');
    expect(textParts.some((p) => p.content.includes('DRS'))).toBe(true);
  });

  it('handles word boundaries cleanly and does not match embedded partial letters', () => {
    const text = 'The address was addressed to someone else.';
    const tokens = tokenizeWithGlossary(text, 'en');
    // "DRS" inside "address" must NOT match!
    const terms = tokens.filter((t) => t.type === 'term');
    expect(terms.length).toBe(0);
  });
});
