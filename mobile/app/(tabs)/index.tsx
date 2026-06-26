import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { fetchSeason, fetchNews } from '../../lib/api';
import { RaceCountdown } from '../../components/race/RaceCountdown';
import { DriverStandingsRow, ConstructorStandingsRow } from '../../components/standings/StandingsRow';
import { NewsCard } from '../../components/news/NewsCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Divider } from '../../components/ui/Divider';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useState } from 'react';

const CURRENT_YEAR = new Date().getFullYear();

function HomeHero({ nextRaceName, season }: { nextRaceName?: string; season?: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <LinearGradient
        colors={['rgba(255,24,1,0.12)', 'transparent']}
        style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <View style={{ width: 20, height: 2, backgroundColor: Colors.apexRed }} />
          <Text style={[Typography.labelCaps, { color: Colors.apexRed, fontSize: 10 }]}>
            FORMULA 1 · {season ?? CURRENT_YEAR}
          </Text>
        </View>
        <Text style={[Typography.hero, { fontSize: 52, lineHeight: 52 }]}>APEX</Text>
        {nextRaceName && (
          <Text style={[Typography.labelCaps, { color: Colors.textMid, fontSize: 10, marginTop: 2 }]}>
            {nextRaceName.replace(' Grand Prix', ' GP').toUpperCase()}
          </Text>
        )}
      </LinearGradient>
    </View>
  );
}

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <HomeHero
          nextRaceName={season?.nextRace?.raceName}
          season={season?.season}
        />

        {season?.nextRace && <RaceCountdown race={season.nextRace} />}

        <View style={{ marginHorizontal: 20, marginBottom: 28 }}>
          <SectionHeader title="Standings" />
          <SegmentedControl
            options={['Drivers', 'Teams']}
            selectedIndex={standingsTab}
            onChange={setStandingsTab}
          />
          <View style={{ marginTop: 4 }}>
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

        <View style={{ marginHorizontal: 20 }}>
          <SectionHeader title="Latest Intel" />
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
