import type { OnThisDayEntry } from '@/lib/data/f1';
import type { NewsItem } from '@/lib/data/types';
import type {
  ConstructorStandingRow,
  DriverStandingRow,
  LastRaceRecap,
} from '@/lib/f1/mrdata';
import type { CalendarRace } from '@/lib/f1Calendar';

export interface BentoRacePanel {
  race: CalendarRace;
  role: string;
  countdown?: string;
  countdownTargetMs?: number;
  detail?: string;
}

export interface CompactBentoDashboardProps {
  season: number;
  leader: DriverStandingRow | null;
  standings: DriverStandingRow[];
  constructors: ConstructorStandingRow[];
  lastRaceRecap: LastRaceRecap | null;
  previousPanel: BentoRacePanel | null;
  nextPanel: BentoRacePanel | null;
  afterNextPanel: BentoRacePanel | null;
  news: NewsItem[];
  onThisDay: OnThisDayEntry[];
  renderNowMs: number;
  totalRounds: number;
  currentRound: number;
}
