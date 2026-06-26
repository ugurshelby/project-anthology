import { View, Text, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { queryKeys } from '../../lib/queryKeys';
import { fetchSeason } from '../../lib/api';
import { DriverStandingsRow, ConstructorStandingsRow } from '../../components/standings/StandingsRow';
import { CalendarRow } from '../../components/race/CalendarRow';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Divider } from '../../components/ui/Divider';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Driver, Constructor, Race } from '../../lib/types';

const CURRENT_YEAR = new Date().getFullYear();

type ListItem =
  | { type: 'header-season'; key: string }
  | { type: 'segment'; key: string }
  | { type: 'driver'; key: string; data: Driver }
  | { type: 'constructor'; key: string; data: Constructor }
  | { type: 'standings-divider'; key: string }
  | { type: 'header-calendar'; key: string; raceCount: number }
  | { type: 'race'; key: string; data: Race; isNext: boolean; isPast: boolean };

export default function SeasonScreen() {
  const [tab, setTab] = useState(0);
  const { data: season, isLoading } = useQuery({
    queryKey: queryKeys.season(CURRENT_YEAR),
    queryFn: () => fetchSeason(CURRENT_YEAR),
  });

  if (isLoading) {
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

  const items: ListItem[] = [
    { type: 'header-season', key: 'h-season' },
    { type: 'segment', key: 'segment' },
    ...(tab === 0
      ? (season?.driverStandings ?? []).map((d) => ({ type: 'driver' as const, key: d.driverId, data: d }))
      : (season?.constructorStandings ?? []).map((c) => ({ type: 'constructor' as const, key: c.constructorId, data: c }))
    ),
    { type: 'standings-divider', key: 'div-1' },
    { type: 'header-calendar', key: 'h-calendar', raceCount: totalRaces },
    ...(season?.races ?? []).map((r, i) => ({
      type: 'race' as const,
      key: `race-${r.round}`,
      data: r,
      isNext: i === nextRaceIndex,
      isPast: new Date(r.date) < today,
    })),
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <FlashList
        data={items}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          switch (item.type) {
            case 'header-season':
              return (
                <LinearGradient
                  colors={['rgba(255,24,1,0.10)', 'transparent']}
                  style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <View style={{ width: 16, height: 2, backgroundColor: Colors.apexRed }} />
                    <Text style={[Typography.labelCaps, { color: Colors.apexRed, fontSize: 10 }]}>
                      FORMULA 1
                    </Text>
                  </View>
                  <Text style={[Typography.hero, { fontSize: 48, lineHeight: 48 }]}>
                    SEASON {CURRENT_YEAR}
                  </Text>
                  <Text style={[Typography.labelCaps, { color: Colors.textMid, fontSize: 10, marginTop: 4 }]}>
                    {pastCount} / {totalRaces} RACES COMPLETE
                  </Text>
                </LinearGradient>
              );

            case 'segment':
              return (
                <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
                  <SegmentedControl
                    options={['Drivers', 'Constructors']}
                    selectedIndex={tab}
                    onChange={setTab}
                  />
                </View>
              );

            case 'driver':
              return (
                <View style={{ paddingHorizontal: 8 }}>
                  <DriverStandingsRow item={item.data} />
                </View>
              );

            case 'constructor':
              return (
                <View style={{ paddingHorizontal: 8 }}>
                  <ConstructorStandingsRow item={item.data} />
                </View>
              );

            case 'standings-divider':
              return <View style={{ height: 24 }} />;

            case 'header-calendar':
              return (
                <View style={{ paddingHorizontal: 20, paddingBottom: 8, borderTopWidth: 1, borderTopColor: Colors.hairline, paddingTop: 16, marginBottom: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <Text style={[Typography.headline, { fontSize: 22 }]}>CALENDAR</Text>
                    <Text style={[Typography.dataMono, { color: Colors.textLow, fontSize: 11 }]}>
                      {item.raceCount} ROUNDS
                    </Text>
                  </View>
                </View>
              );

            case 'race':
              return (
                <View style={{ paddingHorizontal: 12 }}>
                  <CalendarRow race={item.data} isNext={item.isNext} isPast={item.isPast} />
                </View>
              );

            default:
              return <Divider />;
          }
        }}
      />
    </SafeAreaView>
  );
}
