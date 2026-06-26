import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { fetchSeason, fetchNews } from '../../lib/api';
import { RaceCountdown } from '../../components/race/RaceCountdown';
import { DriverStandingsRow, ConstructorStandingsRow } from '../../components/standings/StandingsRow';
import { NewsCard } from '../../components/news/NewsCard';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Divider } from '../../components/ui/Divider';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useState } from 'react';

const CURRENT_YEAR = new Date().getFullYear();

export default function HomeScreen() {
  const [standingsTab, setStandingsTab] = useState(0);

  const { data: season, isLoading: seasonLoading } = useQuery({
    queryKey: queryKeys.season(CURRENT_YEAR),
    queryFn: () => fetchSeason(CURRENT_YEAR),
  });

  const { data: news } = useQuery({
    queryKey: queryKeys.news(),
    queryFn: fetchNews,
  });

  if (seasonLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.apexRed} />
      </SafeAreaView>
    );
  }

  const today = new Date();
  const nextRaceIndex = season?.races.findIndex((r) => new Date(r.date) >= today) ?? -1;
  const pastCount = nextRaceIndex === -1 ? (season?.races.length ?? 0) : nextRaceIndex;
  const totalRaces = season?.races.length ?? 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Hero */}
        <LinearGradient
          colors={['rgba(255,24,1,0.15)', 'rgba(255,24,1,0.04)', 'transparent']}
          style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <View style={{ width: 24, height: 2, backgroundColor: Colors.apexRed }} />
            <Text style={[Typography.labelCaps, { color: Colors.apexRed, fontSize: 10 }]}>
              FORMULA 1 · {season?.season ?? CURRENT_YEAR}
            </Text>
          </View>
          <Text style={[Typography.hero, { fontSize: 64, lineHeight: 60, marginBottom: 6 }]}>APEX</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {season?.nextRace && (
              <View style={{
                paddingHorizontal: 10, paddingVertical: 4,
                backgroundColor: Colors.apexRed + '20',
                borderRadius: 4,
                borderWidth: 1, borderColor: Colors.apexRed + '50',
              }}>
                <Text style={[Typography.labelCaps, { color: Colors.apexRed, fontSize: 10 }]}>
                  NEXT: {season.nextRace.raceName.replace(' Grand Prix', ' GP').toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={[Typography.labelCaps, { color: Colors.textLow, fontSize: 10 }]}>
              {pastCount}/{totalRaces} RACES
            </Text>
          </View>
        </LinearGradient>

        {/* Next race countdown */}
        {season?.nextRace && (
          <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
            <RaceCountdown race={season.nextRace} />
          </View>
        )}

        {/* Standings */}
        <View style={{ marginBottom: 28 }}>
          <View style={{ paddingHorizontal: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={[Typography.headline, { fontSize: 20 }]}>STANDINGS</Text>
          </View>
          <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
            <SegmentedControl
              options={['Drivers', 'Constructors']}
              selectedIndex={standingsTab}
              onChange={setStandingsTab}
            />
          </View>
          <View style={{ paddingHorizontal: 16, gap: 0 }}>
            {standingsTab === 0
              ? (season?.driverStandings ?? []).slice(0, 5).map((d) => (
                  <DriverStandingsRow key={d.driverId} item={d} />
                ))
              : (season?.constructorStandings ?? []).slice(0, 5).map((c) => (
                  <ConstructorStandingsRow key={c.constructorId} item={c} />
                ))
            }
          </View>
        </View>

        {/* Latest Intel */}
        <View style={{ marginHorizontal: 20 }}>
          <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={[Typography.headline, { fontSize: 20 }]}>LATEST INTEL</Text>
          </View>
          {(news ?? []).slice(0, 4).map((item, index, arr) => (
            <View key={item.id}>
              <NewsCard item={item} />
              {index < arr.length - 1 && <Divider />}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
