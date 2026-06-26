import { View, Text, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { router } from 'expo-router';
import { Image } from 'expo-image';
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

function DriverCard({ driver, index }: { driver: Driver; index: number }) {
  const color = useTeamColor(driver.constructorId);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isTop3 = index < 3;

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.97, { duration: 100 }); }}
      onPressOut={() => { scale.value = withSpring(1, { duration: 100 }); }}
      onPress={() => router.push(`/driver/${driver.driverId}`)}
      style={[animStyle, { marginBottom: 10 }]}
    >
      <View style={{
        height: 88,
        backgroundColor: isTop3 ? color + '15' : Colors.surface,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: isTop3 ? color + '50' : Colors.hairline,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        {/* Left color stripe */}
        <View style={{ width: 4, height: '100%', backgroundColor: color }} />

        {/* Large pilot photo */}
        <View style={{ width: 72, height: 88, backgroundColor: Colors.surfaceRaised }}>
          {driver.imageUrl ? (
            <Image
              source={{ uri: driver.imageUrl }}
              style={{ width: 72, height: 88 }}
              contentFit="cover"
              contentPosition="top center"
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[Typography.headline, { color, fontSize: 22 }]}>
                {driver.familyName.slice(0, 3).toUpperCase()}
              </Text>
            </View>
          )}
          <LinearGradient
            colors={['transparent', color + '30']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 36 }}
          />
        </View>

        {/* Driver info */}
        <View style={{ flex: 1, paddingHorizontal: 14 }}>
          <Text style={[Typography.labelCaps, { color, fontSize: 10 }]}>
            {driver.constructorName.toUpperCase()}
          </Text>
          <Text style={[Typography.cardTitle, { color: Colors.textHi, fontSize: 19, lineHeight: 22, marginTop: 1 }]}>
            {driver.givenName.slice(0, 1).toUpperCase()}. {driver.familyName.toUpperCase()}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <View style={{
              paddingHorizontal: 7, paddingVertical: 2,
              backgroundColor: Colors.bg,
              borderRadius: 3,
              borderWidth: 1, borderColor: Colors.hairline,
            }}>
              <Text style={[Typography.dataMono, { color: Colors.textMid, fontSize: 10 }]}>
                #{driver.permanentNumber}
              </Text>
            </View>
            <View style={{
              paddingHorizontal: 7, paddingVertical: 2,
              backgroundColor: Colors.bg,
              borderRadius: 3,
              borderWidth: 1, borderColor: Colors.hairline,
            }}>
              <Text style={[Typography.dataMono, { color: Colors.textMid, fontSize: 10 }]}>
                P{driver.position}
              </Text>
            </View>
          </View>
        </View>

        {/* Points */}
        <View style={{ paddingRight: 16, alignItems: 'flex-end' }}>
          <Text style={[Typography.dataMono, {
            color: isTop3 ? color : Colors.apexRed,
            fontFamily: 'JetBrainsMono_700Bold',
            fontSize: 22,
          }]}>
            {driver.points}
          </Text>
          <Text style={[Typography.labelCaps, { color: Colors.textLow, fontSize: 9 }]}>PTS</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

function TeamCard({ team, index }: { team: Constructor; index: number }) {
  const color = useTeamColor(team.constructorId);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isTop3 = index < 3;

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.97, { duration: 100 }); }}
      onPressOut={() => { scale.value = withSpring(1, { duration: 100 }); }}
      onPress={() => router.push(`/team/${team.constructorId}`)}
      style={[animStyle, { marginBottom: 10 }]}
    >
      <View style={{
        backgroundColor: isTop3 ? color + '12' : Colors.surface,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: isTop3 ? color + '50' : Colors.hairline,
      }}>
        {/* Top color accent bar */}
        <View style={{ height: 3, backgroundColor: color }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
          {/* Team color badge */}
          <View style={{
            width: 56, height: 56, borderRadius: 10,
            backgroundColor: color + '22',
            borderWidth: 2, borderColor: color + '60',
            alignItems: 'center', justifyContent: 'center',
            marginRight: 14,
          }}>
            <Text style={[Typography.labelCaps, {
              color,
              fontSize: 13,
              textAlign: 'center',
              fontFamily: 'JetBrainsMono_700Bold',
            }]}>
              {team.name.split(' ').map((w: string) => w[0]).join('').slice(0, 3)}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[Typography.cardTitle, { color: Colors.textHi, fontSize: 17, lineHeight: 21 }]}>
              {team.name.toUpperCase()}
            </Text>
            <Text style={[Typography.labelCaps, { color: Colors.textMid, fontSize: 10, marginTop: 2 }]}>
              P{team.position} CONSTRUCTORS
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              <View style={{
                paddingHorizontal: 8, paddingVertical: 3,
                backgroundColor: color + '18',
                borderRadius: 4,
                borderWidth: 1, borderColor: color + '40',
              }}>
                <Text style={[Typography.labelCaps, { color, fontSize: 9 }]}>
                  {team.wins} WIN{team.wins !== 1 ? 'S' : ''}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[Typography.dataMono, {
              color: isTop3 ? color : Colors.textHi,
              fontFamily: 'JetBrainsMono_700Bold',
              fontSize: 24,
            }]}>
              {team.points}
            </Text>
            <Text style={[Typography.labelCaps, { color: Colors.textLow, fontSize: 9 }]}>PTS</Text>
          </View>
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
      {/* Header */}
      <LinearGradient
        colors={['rgba(255,24,1,0.08)', 'transparent']}
        style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <View style={{ width: 16, height: 2, backgroundColor: Colors.apexRed }} />
          <Text style={[Typography.labelCaps, { color: Colors.apexRed, fontSize: 10 }]}>
            2026 SEASON
          </Text>
        </View>
        <Text style={[Typography.hero, { fontSize: 44, lineHeight: 44, marginBottom: 12 }]}>
          {tab === 0 ? 'PILOTS' : 'TEAMS'}
        </Text>
        <SegmentedControl options={['Pilots', 'Teams']} selectedIndex={tab} onChange={setTab} />
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Colors.apexRed} />
        </View>
      ) : tab === 0 ? (
        <FlashList
          data={drivers}
          keyExtractor={(item) => item.driverId}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item, index }) => <DriverCard driver={item} index={index} />}
        />
      ) : (
        <FlashList
          data={teams}
          keyExtractor={(item) => item.constructorId}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item, index }) => <TeamCard team={item} index={index} />}
        />
      )}
    </SafeAreaView>
  );
}
