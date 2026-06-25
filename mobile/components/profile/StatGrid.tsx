import { View, Text } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';

interface Stat {
  label: string;
  value: string | number;
}

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1, backgroundColor: Colors.hairline }}>
      {stats.map((s) => (
        <View
          key={s.label}
          style={{ flex: 1, minWidth: '30%', backgroundColor: Colors.surface, padding: 16, alignItems: 'center' }}
        >
          <Text style={[Typography.headline, { color: Colors.textHi }]}>{s.value}</Text>
          <Text style={[Typography.labelCaps, { marginTop: 4 }]}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}
