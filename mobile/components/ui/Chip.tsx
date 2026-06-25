import { View, Text } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';

interface ChipProps {
  label: string;
  color?: string;
}

export function Chip({ label, color = Colors.apexRed }: ChipProps) {
  return (
    <View style={{ borderWidth: 1, borderColor: color, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text style={[Typography.labelCaps, { color }]}>{label}</Text>
    </View>
  );
}
