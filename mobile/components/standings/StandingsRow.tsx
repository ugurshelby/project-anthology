import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { useTeamColor } from '../../hooks/useTeamColor';
import { Driver, Constructor } from '../../lib/types';

interface DriverRowProps { item: Driver }
interface ConstructorRowProps { item: Constructor }

export function DriverStandingsRow({ item }: DriverRowProps) {
  const teamColor = useTeamColor(item.constructorId);
  const isTop3 = item.position <= 3;

  return (
    <Pressable
      onPress={() => router.push(`/driver/${item.driverId}`)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: pressed ? Colors.surfaceRaised : 'transparent',
        borderRadius: 6,
        gap: 10,
      })}
    >
      <View style={{ width: 28, alignItems: 'center' }}>
        <Text style={[
          Typography.dataMono,
          { color: isTop3 ? Colors.textHi : Colors.textLow, fontSize: 14 }
        ]}>
          {item.position}
        </Text>
      </View>

      <View style={{ width: 3, height: 36, backgroundColor: teamColor, borderRadius: 2 }} />

      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface }}
          contentFit="cover"
        />
      ) : (
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[Typography.labelCaps, { color: teamColor, fontSize: 12 }]}>
            {item.familyName.slice(0, 3).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text style={[Typography.cardTitle, { color: Colors.textHi, fontSize: 16, lineHeight: 20 }]}>
          {item.familyName.toUpperCase()}
        </Text>
        <Text style={[Typography.labelCaps, { color: Colors.textMid, fontSize: 10 }]}>
          {item.constructorName}
        </Text>
      </View>

      <Text style={[Typography.dataMono, { color: Colors.apexRed, fontFamily: 'JetBrainsMono_700Bold', fontSize: 15 }]}>
        {item.points}
      </Text>
    </Pressable>
  );
}

export function ConstructorStandingsRow({ item }: ConstructorRowProps) {
  const teamColor = useTeamColor(item.constructorId);
  const isTop3 = item.position <= 3;

  return (
    <Pressable
      onPress={() => router.push(`/team/${item.constructorId}`)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: pressed ? Colors.surfaceRaised : 'transparent',
        borderRadius: 6,
        gap: 10,
      })}
    >
      <View style={{ width: 28, alignItems: 'center' }}>
        <Text style={[Typography.dataMono, { color: isTop3 ? Colors.textHi : Colors.textLow, fontSize: 14 }]}>
          {item.position}
        </Text>
      </View>

      <View style={{ width: 3, height: 36, backgroundColor: teamColor, borderRadius: 2 }} />

      <View style={{
        width: 40, height: 40, borderRadius: 6,
        backgroundColor: teamColor + '22',
        borderWidth: 1, borderColor: teamColor + '44',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={[Typography.labelCaps, { color: teamColor, fontSize: 9, textAlign: 'center' }]} numberOfLines={2}>
          {item.name.split(' ').slice(-1)[0].toUpperCase().slice(0, 4)}
        </Text>
      </View>

      <Text style={[Typography.cardTitle, { flex: 1, color: Colors.textHi, fontSize: 16, lineHeight: 20 }]}>
        {item.name.toUpperCase()}
      </Text>

      <Text style={[Typography.dataMono, { color: Colors.apexRed, fontFamily: 'JetBrainsMono_700Bold', fontSize: 15 }]}>
        {item.points}
      </Text>
    </Pressable>
  );
}
