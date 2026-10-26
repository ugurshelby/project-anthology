import { describe, it, expect } from 'vitest';
import { raceName, circuitName, countryName, formatNumber, formatPercent } from '@/lib/i18n/format';

describe('lib/i18n/format - raceName & circuitName normalization', () => {
  it('normalizes Bahrain Grand Prix in Malaysia data contradiction to Malaysian Grand Prix', () => {
    expect(raceName('Bahrain Grand Prix in Malaysia', 'en')).toBe('Malaysian Grand Prix');
    expect(raceName('Bahrain Grand Prix in Malaysia', 'tr')).toBe('Malezya Grand Prix');
  });

  it('normalizes standard Grand Prix names for English and Turkish', () => {
    expect(raceName('Australian Grand Prix', 'en')).toBe('Australian Grand Prix');
    expect(raceName('Australian Grand Prix', 'tr')).toBe('Avustralya Grand Prix');
    expect(raceName('Monaco Grand Prix', 'tr')).toBe('Monako Grand Prix');
  });

  it('localizes circuit names in Turkish and preserves English', () => {
    expect(circuitName('Sepang International Circuit', 'en')).toBe('Sepang International Circuit');
    expect(circuitName('Sepang International Circuit', 'tr')).toBe('Sepang Uluslararası Pisti');
    expect(circuitName('Bahrain International Circuit', 'tr')).toBe('Bahreyn Uluslararası Pisti');
    expect(circuitName('Jeddah Corniche Circuit', 'tr')).toBe('Cidde Cadde Pisti');
  });

  it('formats country names correctly', () => {
    expect(countryName('Malaysia', 'tr')).toBe('Malezya');
    expect(countryName('Malaysia', 'en')).toBe('Malaysia');
  });
});

describe('formatNumber and formatPercent', () => {
  it('formats percents with the locale sign position and decimal separator', () => {
    expect(formatPercent(19, 'tr')).toBe('%19');
    expect(formatPercent(93.75, 'tr', 2)).toBe('%93,75');
    expect(formatPercent(29.3, 'en')).toBe('29.3%');
  });

  it('formats decimals with the locale separators', () => {
    expect(formatNumber(3665.5, 'tr')).toBe('3.665,5');
    expect(formatNumber(3665.5, 'en')).toBe('3,665.5');
  });

  it('falls back to English for an unknown locale and rounds to the fraction limit', () => {
    expect(formatNumber(1.26, undefined)).toBe('1.3');
    expect(formatPercent(12.34, null, 0)).toBe('12%');
  });
});
