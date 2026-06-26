import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { Svg, Path } from 'react-native-svg';
import { queryKeys } from '../../lib/queryKeys';
import { fetchTeams, fetchDrivers } from '../../lib/api';
import { StatGrid } from '../../components/profile/StatGrid';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTeamColor } from '../../hooks/useTeamColor';
import { Image } from 'expo-image';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: queryKeys.teams(),
    queryFn: fetchTeams,
  });
  const { data: drivers } = useQuery({
    queryKey: queryKeys.drivers(),
    queryFn: fetchDrivers,
  });

  const team = teams?.find((t) => t.constructorId === id);
  const teamDrivers = (drivers ?? []).filter((d) => d.constructorId === id);
  const teamColor = useTeamColor(id ?? '');

  if (teamsLoading || !team) {
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
        {/* Hero Header */}
        <View style={{ position: 'relative' }}>
          <LinearGradient
            colors={[teamColor + '30', teamColor + '08', 'transparent']}
            style={{ paddingBottom: 32, paddingTop: 0 }}
          >
            <SafeAreaView edges={['top']}>
              <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 0 }}>
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={16}
                  style={{ marginBottom: 24, alignSelf: 'flex-start', backgroundColor: 'rgba(10,10,10,0.5)', borderRadius: 20, padding: 8 }}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M19 12H5M12 19L5 12L12 5" stroke={Colors.textHi} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </Pressable>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <View style={{ width: 20, height: 2, backgroundColor: teamColor }} />
                  <Text style={[Typography.labelCaps, { color: teamColor, fontSize: 10 }]}>CONSTRUCTOR</Text>
                </View>
                <Text style={[Typography.hero, { fontSize: 48, lineHeight: 48, color: Colors.textHi }]}>
                  {team.name.toUpperCase()}
                </Text>
                <Text style={[Typography.labelCaps, { color: Colors.textMid, marginTop: 4, fontSize: 10 }]}>
                  P{team.position} IN CONSTRUCTORS CHAMPIONSHIP
                </Text>
              </View>
            </SafeAreaView>
          </LinearGradient>
          <View style={{ height: 3, backgroundColor: teamColor, opacity: 0.7 }} />
        </View>

        <StatGrid stats={[
          { label: 'POINTS', value: team.points },
          { label: 'WINS', value: team.wins },
          { label: 'POSITION', value: `P${team.position}` },
        ]} />

        {/* Drivers */}
        {teamDrivers.length > 0 && (
          <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
            <Text style={[Typography.headline, { fontSize: 20, marginBottom: 14 }]}>DRIVERS</Text>
            <View style={{ gap: 10 }}>
              {teamDrivers.map((driver) => (
                <Pressable
                  key={driver.driverId}
                  onPress={() => router.push(`/driver/${driver.driverId}`)}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: pressed ? Colors.surfaceRaised : Colors.surface,
                    borderRadius: 10, overflow: 'hidden',
                    borderWidth: 1, borderColor: Colors.hairline,
                    height: 72,
                  })}
                >
                  <View style={{ width: 3, height: '100%', backgroundColor: teamColor }} />
                  <View style={{ width: 72, height: 72, backgroundColor: Colors.surfaceRaised }}>
                    {driver.imageUrl ? (
                      <Image
                        source={{ uri: driver.imageUrl }}
                        style={{ width: 72, height: 72 }}
                        contentFit="cover"
                        contentPosition="top center"
                      />
                    ) : (
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={[Typography.labelCaps, { color: teamColor }]}>
                          {driver.familyName.slice(0, 3).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1, paddingHorizontal: 14 }}>
                    <Text style={[Typography.cardTitle, { color: Colors.textHi, fontSize: 17, lineHeight: 20 }]}>
                      {driver.givenName.toUpperCase().slice(0, 1)}. {driver.familyName.toUpperCase()}
                    </Text>
                    <Text style={[Typography.dataMono, { color: Colors.textMid, fontSize: 12, marginTop: 2 }]}>
                      #{driver.permanentNumber}
                    </Text>
                  </View>
                  <View style={{ paddingRight: 16, alignItems: 'flex-end' }}>
                    <Text style={[Typography.dataMono, { color: teamColor, fontFamily: 'JetBrainsMono_700Bold', fontSize: 18 }]}>
                      {driver.points}
                    </Text>
                    <Text style={[Typography.labelCaps, { color: Colors.textLow, fontSize: 9 }]}>PTS</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}
