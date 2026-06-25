import { View, Text } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { useTeamColor } from '../../hooks/useTeamColor';
import { Driver, Constructor } from '../../lib/types';

interface DriverRowProps {
  item: Driver;
}

interface ConstructorRowProps {
  item: Constructor;
}

export function DriverStandingsRow({ item }: DriverRowProps) {
  const teamColor = useTeamColor(item.constructorId);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 }}>
      <View style={{ width: 3, height: 20, backgroundColor: teamColor, borderRadius: 2 }} />
      <Text style={[Typography.dataMono, { width: 20, color: Colors.textMid }]}>{item.position}</Text>
      <Text style={[Typography.dataMono, { flex: 1, color: Colors.textHi }]}>
        {item.familyName.toUpperCase()}
      </Text>
      <Text style={[Typography.dataMono, { color: Colors.textMid, fontSize: 11 }]}>
        {item.constructorName.toUpperCase()}
      </Text>
      <Text style={[Typography.dataMono, { width: 40, textAlign: 'right' }]}>{item.points}</Text>
    </View>
  );
}

export function ConstructorStandingsRow({ item }: ConstructorRowProps) {
  const teamColor = useTeamColor(item.constructorId);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 }}>
      <View style={{ width: 3, height: 20, backgroundColor: teamColor, borderRadius: 2 }} />
      <Text style={[Typography.dataMono, { width: 20, color: Colors.textMid }]}>{item.position}</Text>
      <Text style={[Typography.dataMono, { flex: 1, color: Colors.textHi }]}>{item.name.toUpperCase()}</Text>
      <Text style={[Typography.dataMono, { width: 40, textAlign: 'right' }]}>{item.points}</Text>
    </View>
  );
}
