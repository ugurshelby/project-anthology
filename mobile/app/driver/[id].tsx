import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { fetchDrivers } from '../../lib/api';
import { DriverHero } from '../../components/profile/DriverHero';
import { StatGrid } from '../../components/profile/StatGrid';
import { Colors } from '../../constants/colors';

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
        <ActivityIndicator color={Colors.apexRed} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView>
        <DriverHero driver={driver} />
        <StatGrid stats={[
          { label: 'POINTS', value: driver.points },
          { label: 'WINS', value: driver.wins },
          { label: 'POSITION', value: `P${driver.position}` },
        ]} />
      </ScrollView>
    </SafeAreaView>
  );
}
