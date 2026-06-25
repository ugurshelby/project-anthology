import { View, Text, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { router } from 'expo-router';
import { queryKeys } from '../../lib/queryKeys';
import { fetchDrivers, fetchTeams } from '../../lib/api';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { PressableCard } from '../../components/ui/PressableCard';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTeamColor } from '../../hooks/useTeamColor';
import { Driver, Constructor } from '../../lib/types';

function DriverListItem({ driver }: { driver: Driver }) {
  const color = useTeamColor(driver.constructorId);
  return (
    <PressableCard
      onPress={() => router.push(`/driver/${driver.driverId}`)}
      style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}
    >
      <View style={{ width: 3, height: 32, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={[Typography.cardTitle, { color: Colors.textHi }]}>
          {driver.givenName} {driver.familyName}
        </Text>
        <Text style={[Typography.labelCaps, { color: Colors.textMid }]}>{driver.constructorName}</Text>
      </View>
      <Text style={[Typography.headline, { color }]}>#{driver.permanentNumber}</Text>
    </PressableCard>
  );
}

function TeamListItem({ team }: { team: Constructor }) {
  const color = useTeamColor(team.constructorId);
  return (
    <PressableCard
      onPress={() => router.push(`/team/${team.constructorId}`)}
      style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}
    >
      <View style={{ width: 3, height: 32, backgroundColor: color, borderRadius: 2 }} />
      <Text style={[Typography.cardTitle, { flex: 1, color: Colors.textHi }]}>{team.name.toUpperCase()}</Text>
      <Text style={[Typography.dataMono, { color: Colors.textMid }]}>{team.points} PTS</Text>
    </PressableCard>
  );
}

export default function ProfilesScreen() {
  const [tab, setTab] = useState(0);
  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: queryKeys.drivers(),
    queryFn: fetchDrivers,
  });
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: queryKeys.teams(),
    queryFn: fetchTeams,
  });

  const isLoading = tab === 0 ? driversLoading : teamsLoading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <SegmentedControl options={['Pilots', 'Teams']} selectedIndex={tab} onChange={setTab} />
      </View>
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Colors.apexRed} />
        </View>
      ) : tab === 0 ? (
        <FlashList
          data={drivers}
          keyExtractor={(item) => item.driverId}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          renderItem={({ item }) => <DriverListItem driver={item} />}
        />
      ) : (
        <FlashList
          data={teams}
          keyExtractor={(item) => item.constructorId}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          renderItem={({ item }) => <TeamListItem team={item} />}
        />
      )}
    </SafeAreaView>
  );
}
