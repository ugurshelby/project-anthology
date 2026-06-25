import { View, Text, TouchableOpacity } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <Text style={Typography.labelCaps}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={[Typography.labelCaps, { color: Colors.apexRed }]}>SEE ALL</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
