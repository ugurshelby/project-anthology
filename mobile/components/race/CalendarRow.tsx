import { View, Text } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Race } from '../../lib/types';

interface CalendarRowProps {
  race: Race;
  isNext: boolean;
  isPast: boolean;
}

export function CalendarRow({ race, isNext, isPast }: CalendarRowProps) {
  const dateStr = new Date(race.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 }}>
      {isNext && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.apexRed }} />}
      {!isNext && <View style={{ width: 6 }} />}
      <Text style={[Typography.dataMono, { width: 32, color: Colors.textLow }]}>
        {String(race.round).padStart(2, '0')}
      </Text>
      <Text style={[Typography.dataMono, { flex: 1, color: isPast ? Colors.textLow : Colors.textHi }]}>
        {race.raceName.replace(' Grand Prix', ' GP')}
      </Text>
      <Text style={[Typography.dataMono, { color: Colors.textLow }]}>{dateStr}</Text>
      {isPast && <Text style={[Typography.labelCaps, { color: Colors.textLow }]}>✓</Text>}
    </View>
  );
}
