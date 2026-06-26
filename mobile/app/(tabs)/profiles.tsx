import { View, Text, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { queryKeys } from '../../lib/queryKeys';
import { fetchDrivers, fetchTeams } from '../../lib/api';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTeamColor } from '../../hooks/useTeamColor';
import { Driver, Constructor } from '../../lib/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function DriverCard({ driver }: { driver: Driver }) {
  const color = useTeamColor(driver.constructorId);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.97, { duration: 100 }); }}
      onPressOut={() => { scale.value = withSpring(1, { duration: 100 }); }}
      onPress={() => router.push(`/driver/${driver.driverId}`)}
      style={[animStyle, { marginBottom: 10 }]}
    >
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 10, overflow: 'hidden',
        borderWidth: 1, borderColor: Colors.hairline,
        height: 80,
      }}>
        <View style={{ width: 4, height: '100%', backgroundColor: color }} />

        <View style={{ width: 80, height: 80, backgroundColor: Colors.surfaceRaised, position: 'relative' }}>
          {driver.imageUrl ? (
            <Image
              source={{ uri: driver.imageUrl }}
              style={{ width: 80, height: 80 }}
              contentFit="cover"
              contentPosition="top center"
            />
          ) : (
            <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[Typography.headline, { color, fontSize: 28 }]}>
                {driver.familyName.slice(0, 3).toUpperCase()}
              </Text>
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(20,20,20,0.3)']}
            style={{ position: 'absolute', inset: 0 }}
          />
        </View>

        <View style={{ flex: 1, paddingHorizontal: 14, gap: 2 }}>
          <Text style={[Typography.labelCaps, { color, fontSize: 10 }]}>{driver.constructorName}</Text>
          <Text style={[Typography.cardTitle, { color: Colors.textHi, fontSize: 18, lineHeight: 22 }]}>
            {driver.givenName.toUpperCase().slice(0, 1)}. {driver.familyName.toUpperCase()}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 }}>
            <Text style={[Typography.dataMono, { color: Colors.textMid, fontSize: 11 }]}>
              #{driver.permanentNumber}
            </Text>
            <Text style={[Typography.dataMono, { color: Colors.textMid, fontSize: 11 }]}>
              P{driver.position}
            </Text>
          </View>
        </View>

        <View style={{ paddingRight: 16, alignItems: 'flex-end' }}>
          <Text style={[Typography.dataMono, { color: Colors.apexRed, fontFamily: 'JetBrainsMono_700Bold', fontSize: 18 }]}>
            {driver.points}
          </Text>
          <Text style={[Typography.labelCaps, { color: Colors.textLow, fontSize: 9 }]}>PTS</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

function TeamCard({ team }: { team: Constructor }) {
  const color = useTeamColor(team.constructorId);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.97, { duration: 100 }); }}
      onPressOut={() => { scale.value = withSpring(1, { duration: 100 }); }}
      onPress={() => router.push(`/team/${team.constructorId}`)}
      style={[animStyle, { marginBottom: 10 }]}
    >
      <View style={{
        backgroundColor: Colors.surface,
        borderRadius: 10, overflow: 'hidden',
        borderWidth: 1, borderColor: Colors.hairline,
        borderBottomWidth: 3, borderBottomColor: color,
        paddingHorizontal: 16, paddingVertical: 14,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{
            width: 48, height: 48, borderRadius: 8,
            backgroundColor: color + '20',
            borderWidth: 1, borderColor: color + '40',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={[Typography.labelCaps, { color, fontSize: 10, textAlign: 'center' }]} numberOfLines={2}>
              {team.name.split(' ').map(w => w[0]).join('').slice(0, 3)}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[Typography.cardTitle, { color: Colors.textHi, fontSize: 17, lineHeight: 21 }]}>
              {team.name.toUpperCase()}
            </Text>
            <Text style={[Typography.labelCaps, { color: Colors.textMid, fontSize: 10, marginTop: 2 }]}>
              P{team.position} · CONSTRUCTOR
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[Typography.dataMono, { color, fontFamily: 'JetBrainsMono_700Bold', fontSize: 22 }]}>
              {team.points}
            </Text>
            <Text style={[Typography.labelCaps, { color: Colors.textLow, fontSize: 9 }]}>PTS</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 10, gap: 6 }}>
          {[team.wins].map((wins, i) => (
            <View key={i} style={{
              paddingHorizontal: 8, paddingVertical: 4,
              backgroundColor: Colors.surfaceRaised,
              borderRadius: 4,
            }}>
              <Text style={[Typography.labelCaps, { color: Colors.textMid, fontSize: 9 }]}>
                {wins} WIN{wins !== 1 ? 'S' : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </AnimatedPressable>
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
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 8 }}>
        <Text style={[Typography.headline, { fontSize: 28, lineHeight: 32 }]}>
          {tab === 0 ? 'PILOTS' : 'TEAMS'}
        </Text>
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
          renderItem={({ item }) => <DriverCard driver={item} />}
        />
      ) : (
        <FlashList
          data={teams}
          keyExtractor={(item) => item.constructorId}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          renderItem={({ item }) => <TeamCard team={item} />}
        />
      )}
    </SafeAreaView>
  );
}
