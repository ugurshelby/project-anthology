import { View, Text, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { queryKeys } from '../../lib/queryKeys';
import { fetchSeason } from '../../lib/api';
import { DriverStandingsRow, ConstructorStandingsRow } from '../../components/standings/StandingsRow';
import { CalendarRow } from '../../components/race/CalendarRow';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Divider } from '../../components/ui/Divider';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Driver, Constructor, Race } from '../../lib/types';

const CURRENT_YEAR = new Date().getFullYear();

type ListItem =
  | { type: 'header'; key: string; label: string }
  | { type: 'segment'; key: string }
  | { type: 'driver'; key: string; data: Driver }
  | { type: 'constructor'; key: string; data: Constructor }
  | { type: 'divider'; key: string }
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

  const items: ListItem[] = [
    { type: 'header', key: 'h-season', label: `SEASON ${CURRENT_YEAR}` },
    { type: 'segment', key: 'segment' },
    ...(tab === 0
      ? (season?.driverStandings ?? []).map((d) => ({ type: 'driver' as const, key: d.driverId, data: d }))
      : (season?.constructorStandings ?? []).map((c) => ({ type: 'constructor' as const, key: c.constructorId, data: c }))
    ),
    { type: 'divider', key: 'div-1' },
    { type: 'header', key: 'h-calendar', label: 'CALENDAR' },
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
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        renderItem={({ item }) => {
          switch (item.type) {
            case 'header':
              return <Text style={[Typography.headline, { marginTop: 20, marginBottom: 12 }]}>{item.label}</Text>;
            case 'segment':
              return (
                <SegmentedControl
                  options={['Drivers', 'Constructors']}
                  selectedIndex={tab}
                  onChange={setTab}
                />
              );
            case 'driver':
              return <DriverStandingsRow item={item.data} />;
            case 'constructor':
              return <ConstructorStandingsRow item={item.data} />;
            case 'race':
              return <CalendarRow race={item.data} isNext={item.isNext} isPast={item.isPast} />;
            default:
              return <Divider />;
          }
        }}
      />
    </SafeAreaView>
  );
}
