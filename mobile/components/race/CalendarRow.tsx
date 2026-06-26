import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Race } from '../../lib/types';

interface CalendarRowProps {
  race: Race;
  isNext: boolean;
  isPast: boolean;
}

const COUNTRY_FLAG: Record<string, string> = {
  'Australia': '🇦🇺', 'China': '🇨🇳', 'Japan': '🇯🇵', 'Bahrain': '🇧🇭',
  'Saudi Arabia': '🇸🇦', 'Miami': '🇺🇸', 'Italy': '🇮🇹', 'Monaco': '🇲🇨',
  'Canada': '🇨🇦', 'Spain': '🇪🇸', 'Austria': '🇦🇹', 'UK': '🇬🇧',
  'Hungary': '🇭🇺', 'Belgium': '🇧🇪', 'Netherlands': '🇳🇱', 'Singapore': '🇸🇬',
  'USA': '🇺🇸', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷', 'Las Vegas': '🇺🇸',
  'Qatar': '🇶🇦', 'UAE': '🇦🇪', 'Azerbaijan': '🇦🇿',
};

export function CalendarRow({ race, isNext, isPast }: CalendarRowProps) {
  const dateStr = new Date(race.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const country = race.Circuit?.Location?.country ?? '';
  const flag = COUNTRY_FLAG[country] ?? '🏁';
  const gpName = race.raceName.replace(' Grand Prix', ' GP');

  if (isNext) {
    return (
      <View style={{ marginVertical: 6, borderRadius: 8, overflow: 'hidden' }}>
        <LinearGradient
          colors={['rgba(255,24,1,0.15)', 'rgba(255,24,1,0.05)']}
          style={{
            flexDirection: 'row', alignItems: 'center',
            paddingVertical: 14, paddingHorizontal: 12, gap: 10,
            borderWidth: 1, borderColor: 'rgba(255,24,1,0.3)', borderRadius: 8,
          }}
        >
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.apexRed }} />
          <Text style={[Typography.dataMono, { width: 28, color: Colors.textLow, fontSize: 11 }]}>
            {String(race.round).padStart(2, '0')}
          </Text>
          <Text style={{ fontSize: 20 }}>{flag}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.cardTitle, { color: Colors.textHi, fontSize: 15, lineHeight: 18 }]}>
              {gpName}
            </Text>
            <Text style={[Typography.labelCaps, { color: Colors.apexRed, fontSize: 9, marginTop: 2 }]}>
              NEXT RACE
            </Text>
          </View>
          <Text style={[Typography.dataMono, { color: Colors.textMid }]}>{dateStr}</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 11, paddingHorizontal: 12, gap: 10,
      opacity: isPast ? 0.45 : 1,
    }}>
      <View style={{ width: 8 }} />
      <Text style={[Typography.dataMono, { width: 28, color: Colors.textLow, fontSize: 11 }]}>
        {String(race.round).padStart(2, '0')}
      </Text>
      <Text style={{ fontSize: 18 }}>{flag}</Text>
      <Text style={[Typography.dataMono, { flex: 1, color: isPast ? Colors.textMid : Colors.textHi, fontSize: 13 }]}>
        {gpName}
      </Text>
      <Text style={[Typography.dataMono, { color: Colors.textLow, fontSize: 12 }]}>{dateStr}</Text>
      {isPast && (
        <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.textLow, fontSize: 10 }}>✓</Text>
        </View>
      )}
    </View>
  );
}
