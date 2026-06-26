import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Svg, Path } from 'react-native-svg';
import { queryKeys } from '../../lib/queryKeys';
import { fetchDrivers, fetchSeason } from '../../lib/api';
import { DriverHero } from '../../components/profile/DriverHero';
import { StatGrid } from '../../components/profile/StatGrid';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTeamColor } from '../../hooks/useTeamColor';

const CURRENT_YEAR = new Date().getFullYear();

function BackButton() {
  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={16}
      style={{
        position: 'absolute', top: 16, left: 16, zIndex: 10,
        backgroundColor: 'rgba(10,10,10,0.6)', borderRadius: 20, padding: 8,
      }}
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
  const { data: season } = useQuery({
    queryKey: queryKeys.season(CURRENT_YEAR),
    queryFn: () => fetchSeason(CURRENT_YEAR),
  });

  const driver = drivers?.find((d) => d.driverId === id);
  const teamColor = useTeamColor(driver?.constructorId ?? '');

  // Find driver's race results
  const raceResults = (season?.races ?? [])
    .filter((r) => r.Results && r.Results.length > 0)
    .map((r) => {
      const result = r.Results?.find((res) => res.Driver.driverId === id);
      if (!result) return null;
      return { race: r.raceName.replace(' Grand Prix', ' GP'), position: result.position };
    })
    .filter(Boolean)
    .slice(-5)
    .reverse() as Array<{ race: string; position: string }>;

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

        {/* Bio section */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <View style={{ width: 16, height: 2, backgroundColor: teamColor }} />
            <Text style={[Typography.labelCaps, { color: teamColor, fontSize: 10 }]}>
              {driver.constructorName.toUpperCase()}
            </Text>
          </View>
          <Text style={[Typography.hero, { fontSize: 40, lineHeight: 40, color: Colors.textHi }]}>
            {driver.givenName.toUpperCase()}
          </Text>
          <Text style={[Typography.hero, { fontSize: 40, lineHeight: 40, color: Colors.textHi }]}>
            {driver.familyName.toUpperCase()}
          </Text>
          <Text style={[Typography.dataMono, { color: Colors.textMid, marginTop: 8, fontSize: 13 }]}>
            #{driver.permanentNumber}
          </Text>
        </View>

        {/* Badge row */}
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', gap: 8, marginBottom: 28 }}>
          <View style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: teamColor + '20', borderRadius: 4, borderWidth: 1, borderColor: teamColor + '40' }}>
            <Text style={[Typography.labelCaps, { color: teamColor, fontSize: 10 }]}>
              {driver.wins} WIN{driver.wins !== 1 ? 'S' : ''}
            </Text>
          </View>
          <View style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: Colors.surface, borderRadius: 4, borderWidth: 1, borderColor: Colors.hairline }}>
            <Text style={[Typography.labelCaps, { color: Colors.textMid, fontSize: 10 }]}>
              {driver.points} PTS
            </Text>
          </View>
        </View>

        {/* Recent results */}
        {raceResults.length > 0 && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
            <Text style={[Typography.headline, { fontSize: 20, marginBottom: 12 }]}>RECENT RESULTS</Text>
            <View style={{ gap: 1, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: Colors.hairline }}>
              {raceResults.map((r, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingHorizontal: 14, paddingVertical: 12,
                    backgroundColor: i % 2 === 0 ? Colors.surface : Colors.surfaceRaised,
                  }}
                >
                  <Text style={[Typography.dataMono, { color: Colors.textMid, flex: 1, fontSize: 12 }]}>
                    {r.race}
                  </Text>
                  <View style={{
                    width: 28, height: 28, borderRadius: 14,
                    backgroundColor: r.position === '1' ? Colors.apexRed : Colors.bg,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={[Typography.dataMono, {
                      color: r.position === '1' ? Colors.textHi : Colors.textMid,
                      fontSize: 12, fontFamily: 'JetBrainsMono_700Bold',
                    }]}>
                      P{r.position}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {raceResults.length === 0 && <View style={{ height: 40 }} />}
      </ScrollView>
    </View>
  );
}
