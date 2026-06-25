import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Driver } from '../../lib/types';
import { useTeamColor } from '../../hooks/useTeamColor';

export function DriverHero({ driver }: { driver: Driver }) {
  const teamColor = useTeamColor(driver.constructorId);

  return (
    <View style={{ position: 'relative', height: 280 }}>
      <Image
        source={driver.imageUrl ? { uri: driver.imageUrl } : undefined}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
      />
      <LinearGradient
        colors={['transparent', Colors.bg]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140 }}
      />
      <View style={{ position: 'absolute', bottom: 16, left: 20 }}>
        <Text style={[Typography.labelCaps, { color: teamColor }]}>{driver.constructorName}</Text>
        <Text style={Typography.hero}>{driver.familyName.toUpperCase()}</Text>
        <Text style={[Typography.dataMono, { color: Colors.textMid }]}>#{driver.permanentNumber}</Text>
      </View>
    </View>
  );
}
