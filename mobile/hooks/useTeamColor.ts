import { useMemo } from 'react';
import { Colors } from '../constants/colors';

const TEAM_COLORS: Record<string, string> = {
  red_bull: '#3671C6',
  mercedes: '#00D2BE',
  ferrari: '#E8002D',
  mclaren: '#FF8000',
  aston_martin: '#229971',
  alpine: '#FF87BC',
  williams: '#64C4FF',
  rb: '#6692FF',
  kick_sauber: '#52E252',
  haas: '#B6BABD',
};

export function useTeamColor(teamId: string): string {
  return useMemo(() => TEAM_COLORS[teamId] ?? Colors.apexRed, [teamId]);
}
