import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      <ScrollView contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}>
        {season?.nextRace && <RaceCountdown race={season.nextRace} />}

        <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title="Standings" />
          <SegmentedControl
            options={['Drivers', 'Teams']}
            selectedIndex={standingsTab}
            onChange={setStandingsTab}
          />
          <View style={{ marginTop: 8 }}>
            {standingsTab === 0
              ? (season?.driverStandings ?? []).slice(0, 5).map((d) => <DriverStandingsRow key={d.driverId} item={d} />)
              : (season?.constructorStandings ?? []).slice(0, 5).map((c) => <ConstructorStandingsRow key={c.constructorId} item={c} />)
            }
          </View>
        </View>

        <View style={{ marginHorizontal: 20 }}>
          <SectionHeader title="Latest Intel" />
          {(news ?? []).slice(0, 3).map((item, index) => (
            <View key={item.id}>
              <NewsCard item={item} />
              {index < 2 && <Divider />}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
