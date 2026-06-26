import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Svg, Path } from 'react-native-svg';
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
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={Colors.apexRed} />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView>
        <TeamHeader teamId={team.constructorId} name={team.name} />
        <StatGrid stats={[
          { label: 'POINTS', value: team.points },
          { label: 'WINS', value: team.wins },
          { label: 'POSITION', value: `P${team.position}` },
        ]} />
      </ScrollView>
    </View>
  );
}

function TeamHeader({ teamId, name }: { teamId: string; name: string }) {
  const teamColor = useTeamColor(teamId);
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bg }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, borderBottomWidth: 3, borderBottomColor: teamColor }}>
        <Pressable onPress={() => router.back()} hitSlop={16} style={{ marginBottom: 16 }}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19L5 12L12 5" stroke={Colors.textMid} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={[Typography.hero, { color: teamColor }]}>{name.toUpperCase()}</Text>
      </View>
    </SafeAreaView>
  );
}
