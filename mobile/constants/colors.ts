export const Colors = {
  bg: '#0a0a0a',
  surface: '#141414',
  surfaceRaised: '#1c1c1c',
  hairline: '#262626',
  textHi: '#ffffff',
  text: '#e6e6e6',
  textMid: '#9a9a9a',
  textLow: '#666666',
  apexRed: '#ff1801',
} as const;

export type ColorToken = keyof typeof Colors;
