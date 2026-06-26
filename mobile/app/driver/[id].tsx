import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Svg, Path } from 'react-native-svg';
import { queryKeys } from '../../lib/queryKeys';
import { fetchDrivers } from '../../lib/api';
import { DriverHero } from '../../components/profile/DriverHero';
import { StatGrid } from '../../components/profile/StatGrid';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

function BackButton() {
  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={16}
      style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: 'rgba(10,10,10,0.6)', borderRadius: 20, padding: 8 }}
    >
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M19 12H5M12 19L5 12L12 5" stroke={Colors.textHi} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  );
}

export default function DriverDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: drivers, isLoading } = useQuery({
    queryKey: queryKeys.drivers(),
    queryFn: fetchDrivers,
  });

  const driver = drivers?.find((d) => d.driverId === id);

  if (isLoading || !driver) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={Colors.apexRed} />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView>
        <View style={{ position: 'relative' }}>
          <DriverHero driver={driver} />
          <BackButton />
        </View>
        <StatGrid stats={[
          { label: 'POINTS', value: driver.points },
          { label: 'WINS', value: driver.wins },
          { label: 'POSITION', value: `P${driver.position}` },
        ]} />
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Text style={[Typography.labelCaps, { color: Colors.textMid }]}>
            {driver.constructorName}
          </Text>
          <Text style={[Typography.bodyMd, { color: Colors.textMid, marginTop: 8 }]}>
            {driver.givenName} {driver.familyName}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
