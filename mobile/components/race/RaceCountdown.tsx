import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Race } from '../../lib/types';

interface RaceCountdownProps {
  race: Race;
}

export function RaceCountdown({ race }: RaceCountdownProps) {
  const target = new Date(`${race.date}T${race.time ?? '12:00:00Z'}`);
  const { days, hours, minutes, seconds, isExpired } = useCountdown(target);
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.08, { duration: 80 }),
      withTiming(1.0, { duration: 80 })
    );
  }, [seconds]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
      <Text style={Typography.labelCaps}>NEXT RACE</Text>
      <Text style={[Typography.headline, { marginTop: 4 }]}>{race.raceName}</Text>
      <View style={{ height: 1, backgroundColor: Colors.hairline, marginVertical: 12 }} />
      {isExpired ? (
        <Text style={[Typography.dataMono, { color: Colors.apexRed }]}>RACE WEEK</Text>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <Animated.Text style={[Typography.hero, animStyle]}>{days}</Animated.Text>
          <Text style={[Typography.labelCaps, { marginBottom: 4 }]}>DAYS</Text>
          <Text style={[Typography.dataMono, { marginLeft: 8, color: Colors.textMid }]}>
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
        </View>
      )}
    </View>
  );
}
