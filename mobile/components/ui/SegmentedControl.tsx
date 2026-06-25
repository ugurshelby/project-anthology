import { View, Text, Pressable } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ options, selectedIndex, onChange }: SegmentedControlProps) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 6, borderWidth: 1, borderColor: Colors.hairline, padding: 2 }}>
      {options.map((option, i) => (
        <Pressable
          key={option}
          onPress={() => onChange(i)}
          style={{
            flex: 1,
            paddingVertical: 8,
            alignItems: 'center',
            backgroundColor: i === selectedIndex ? Colors.surfaceRaised : 'transparent',
            borderRadius: 4,
          }}
        >
          <Text style={[Typography.labelCaps, { color: i === selectedIndex ? Colors.textHi : Colors.textLow }]}>
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
