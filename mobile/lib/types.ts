export interface Driver {
  driverId: string;
  givenName: string;
  familyName: string;
  permanentNumber: string;
  constructorId: string;
  constructorName: string;
  points: number;
  position: number;
  wins: number;
  imageUrl?: string;
}

export interface Constructor {
  constructorId: string;
  name: string;
  points: number;
  position: number;
  wins: number;
}

export interface Race {
  round: number;
  raceName: string;
  Circuit: { circuitName: string; Location: { country: string } };
  date: string;
  time?: string;
  QualifyingDate?: string;
  FirstPractice?: { date: string; time: string };
  SecondPractice?: { date: string; time: string };
  ThirdPractice?: { date: string; time: string };
  Sprint?: { date: string; time: string };
  Results?: Array<{ position: string; Driver: { driverId: string }; Constructor: { constructorId: string } }>;
}

export interface SeasonData {
  season: string;
  driverStandings: Driver[];
  constructorStandings: Constructor[];
  races: Race[];
  nextRace: Race | null;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  category?: 'technical' | 'race' | 'general';
}

export interface Story {
  slug: string;
  title: string;
  kicker?: string;
  coverImageUrl?: string;
  excerpt?: string;
  content?: string;
  publishedAt: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  category?: string;
}
