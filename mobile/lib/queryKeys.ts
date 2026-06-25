export const queryKeys = {
  season: (year: number) => ['season', year] as const,
  news: () => ['news'] as const,
  drivers: () => ['drivers'] as const,
  teams: () => ['teams'] as const,
  stories: () => ['stories'] as const,
  story: (slug: string) => ['story', slug] as const,
} as const;
