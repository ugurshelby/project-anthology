import { describe, expect, it } from 'vitest';
import { extractNumbers, headlineFactsInSources, knownNamesIn } from '@/lib/news/factGuard';
import { parseRewriteItem } from '@/lib/news/rewrite';

const SOURCE = [
  {
    source: 'Motorsport.com',
    title: 'Antonelli eyes title in Mexico after US GP win',
    summary: 'Kimi Antonelli leads George Russell by 102 points with four rounds left.',
  },
];

describe('headline fact guard (19.2)', () => {
  it('rejects a number the sources do not contain', () => {
    expect(headlineFactsInSources('Antonelli leads Russell by 120 points', SOURCE)).toBe(false);
  });

  it('rejects a known F1 name the sources do not mention', () => {
    expect(headlineFactsInSources('Verstappen eyes title in Mexico', SOURCE)).toBe(false);
  });

  it('passes a headline built from the source names and numbers, in English and Turkish', () => {
    expect(headlineFactsInSources('Antonelli leads Russell by 102 points before Mexico', SOURCE)).toBe(true);
    expect(headlineFactsInSources("Antonelli, Russell'ın 102 puan önünde Meksika'ya gidiyor", SOURCE)).toBe(true);
  });

  it('documents the known limit: a swapped subject and object with the same names and number passes', () => {
    // Only the prompt rule guards this case (measured failure 6k42s3).
    expect(headlineFactsInSources('Russell leads Antonelli by 102 points', SOURCE)).toBe(true);
  });

  it('folds accents and number separators', () => {
    expect(knownNamesIn('Sergio Pérez extends Cadillac deal')).toEqual(expect.arrayContaining(['perez', 'cadillac']));
    expect(extractNumbers('1,000 laps and 1.000 tur, 2029')).toEqual(['1000', '1000', '2029']);
  });
});

describe('parseRewriteItem applies the fact guard', () => {
  const item = (titleEn: string, titleTr: string) => ({
    same_story: true,
    title_en: titleEn,
    summary_en: 'Kimi Antonelli arrives in Mexico with a 102-point lead over his team-mate.',
    title_tr: titleTr,
    summary_tr: 'Kimi Antonelli, takım arkadaşına 102 puan fark atarak Meksika’ya geliyor.',
  });

  it('keeps a faithful rewrite', () => {
    expect(parseRewriteItem(item('Antonelli takes a 102-point lead to Mexico', "Antonelli 102 puanlık farkla Meksika'da"), SOURCE)).not.toBeNull();
  });

  it('rejects a rewrite whose English or Turkish headline invents a number', () => {
    expect(parseRewriteItem(item('Antonelli takes a 120-point lead to Mexico', "Antonelli 102 puanlık farkla Meksika'da"), SOURCE)).toBeNull();
    expect(parseRewriteItem(item('Antonelli takes a 102-point lead to Mexico', "Antonelli 120 puanlık farkla Meksika'da"), SOURCE)).toBeNull();
  });
});
