import { describe, it, expect } from 'vitest';
import { raceName, circuitName, countryName } from '@/lib/i18n/format';

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
