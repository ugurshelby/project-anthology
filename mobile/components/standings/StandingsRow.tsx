import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { useTeamColor } from '../../hooks/useTeamColor';
import { Driver, Constructor } from '../../lib/types';

interface DriverRowProps { item: Driver }
interface ConstructorRowProps { item: Constructor }

export function DriverStandingsRow({ item }: DriverRowProps) {
  const teamColor = useTeamColor(item.constructorId);
  const isLeader = item.position === 1;

  return (
    <Pressable
      onPress={() => router.push(`/driver/${item.driverId}`)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        marginBottom: 6,
      })}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 72,
        backgroundColor: isLeader ? teamColor + '18' : Colors.surface,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: isLeader ? teamColor + '50' : Colors.hairline,
      }}>
        {/* Left color bar */}
        <View style={{ width: 3, height: '100%', backgroundColor: teamColor }} />

        {/* Position number */}
        <View style={{ width: 36, alignItems: 'center' }}>
          <Text style={[
            Typography.dataMono,
            { color: isLeader ? teamColor : Colors.textLow, fontSize: 15, fontFamily: 'JetBrainsMono_700Bold' }
          ]}>
            {item.position}
          </Text>
        </View>

        {/* Pilot photo */}
        <View style={{ width: 56, height: 72, backgroundColor: Colors.surfaceRaised, overflow: 'hidden' }}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: 56, height: 72 }}
              contentFit="cover"
              contentPosition="top center"
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[Typography.headline, { color: teamColor, fontSize: 16 }]}>
                {item.familyName.slice(0, 3).toUpperCase()}
              </Text>
            </View>
          )}
          <LinearGradient
            colors={['transparent', isLeader ? teamColor + '30' : 'rgba(20,20,20,0.4)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 30 }}
          />
        </View>

        {/* Name & team */}
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={[Typography.cardTitle, { color: Colors.textHi, fontSize: 17, lineHeight: 20 }]}>
            {item.familyName.toUpperCase()}
          </Text>
          <Text style={[Typography.labelCaps, { color: teamColor, fontSize: 10, marginTop: 2 }]}>
            {item.constructorName.toUpperCase()}
          </Text>
        </View>

        {/* Points */}
        <View style={{ paddingRight: 14, alignItems: 'flex-end' }}>
          <Text style={[Typography.dataMono, {
            color: isLeader ? teamColor : Colors.textHi,
            fontFamily: 'JetBrainsMono_700Bold',
            fontSize: 20,
          }]}>
            {item.points}
          </Text>
          <Text style={[Typography.labelCaps, { color: Colors.textLow, fontSize: 9 }]}>PTS</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function ConstructorStandingsRow({ item }: ConstructorRowProps) {
  const teamColor = useTeamColor(item.constructorId);
  const isLeader = item.position === 1;

  return (
    <Pressable
      onPress={() => router.push(`/team/${item.constructorId}`)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        marginBottom: 6,
      })}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 64,
        backgroundColor: isLeader ? teamColor + '18' : Colors.surface,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: isLeader ? teamColor + '50' : Colors.hairline,
      }}>
        {/* Color bar */}
        <View style={{ width: 3, height: '100%', backgroundColor: teamColor }} />

        {/* Position */}
        <View style={{ width: 36, alignItems: 'center' }}>
          <Text style={[Typography.dataMono, {
            color: isLeader ? teamColor : Colors.textLow,
            fontSize: 15,
            fontFamily: 'JetBrainsMono_700Bold',
          }]}>
            {item.position}
          </Text>
        </View>

        {/* Team badge */}
        <View style={{
          width: 48, height: 48, borderRadius: 8, marginHorizontal: 4,
          backgroundColor: teamColor + '22',
          borderWidth: 1, borderColor: teamColor + '55',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={[Typography.labelCaps, { color: teamColor, fontSize: 11, textAlign: 'center', fontFamily: 'JetBrainsMono_700Bold' }]}>
            {item.name.split(' ').map((w: string) => w[0]).join('').slice(0, 3)}
          </Text>
        </View>

        {/* Name */}
        <View style={{ flex: 1, paddingHorizontal: 8 }}>
          <Text style={[Typography.cardTitle, { color: Colors.textHi, fontSize: 15, lineHeight: 20 }]}>
            {item.name.toUpperCase()}
          </Text>
          <Text style={[Typography.labelCaps, { color: Colors.textMid, fontSize: 9, marginTop: 1 }]}>
            {item.wins} WIN{item.wins !== 1 ? 'S' : ''} · P{item.position}
          </Text>
        </View>

        {/* Points */}
        <View style={{ paddingRight: 14, alignItems: 'flex-end' }}>
          <Text style={[Typography.dataMono, {
            color: isLeader ? teamColor : Colors.textHi,
            fontFamily: 'JetBrainsMono_700Bold',
            fontSize: 20,
          }]}>
            {item.points}
          </Text>
          <Text style={[Typography.labelCaps, { color: Colors.textLow, fontSize: 9 }]}>PTS</Text>
        </View>
      </View>
    </Pressable>
  );
}
