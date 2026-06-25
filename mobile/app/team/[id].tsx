import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { fetchTeams } from '../../lib/api';
import { StatGrid } from '../../components/profile/StatGrid';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTeamColor } from '../../hooks/useTeamColor';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: teams, isLoading } = useQuery({
    queryKey: queryKeys.teams(),
    queryFn: fetchTeams,
  });

  const team = teams?.find((t) => t.constructorId === id);

  if (isLoading || !team) {
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
        <TeamHeader teamId={team.constructorId} name={team.name} />
        <StatGrid stats={[
          { label: 'POINTS', value: team.points },
          { label: 'WINS', value: team.wins },
          { label: 'POSITION', value: `P${team.position}` },
        ]} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TeamHeader({ teamId, name }: { teamId: string; name: string }) {
  const teamColor = useTeamColor(teamId);
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 32, paddingBottom: 24, borderBottomWidth: 3, borderBottomColor: teamColor }}>
      <Text style={[Typography.hero, { color: teamColor }]}>{name.toUpperCase()}</Text>
    </View>
  );
}
