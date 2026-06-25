import { View, Text, Switch, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  SESSION_TYPES,
  SESSION_LABELS,
  SessionType,
  registerForPushNotifications,
  markNotificationScreenShown,
} from '../lib/notifications';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

export default function NotificationsScreen() {
  const [prefs, setPrefs] = useState<Record<SessionType, boolean>>(
    SESSION_TYPES.reduce((acc, t) => ({ ...acc, [t]: t === 'qualifying' || t === 'sprint' || t === 'race' }), {} as Record<SessionType, boolean>)
  );
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await registerForPushNotifications(prefs);
    } finally {
      await markNotificationScreenShown();
      setLoading(false);
      router.replace('/(tabs)');
    }
  }

  async function handleSkip() {
    await markNotificationScreenShown();
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40 }}>
        <Text style={[Typography.labelCaps, { color: Colors.apexRed, marginBottom: 8 }]}>NOTIFICATIONS</Text>
        <Text style={[Typography.headline, { marginBottom: 8 }]}>Stay on the grid.</Text>
        <Text style={[Typography.bodyMd, { color: Colors.textMid, marginBottom: 32 }]}>
          Choose which sessions you want to be notified about — 30 minutes before they start.
        </Text>

        {SESSION_TYPES.map((type) => (
          <View
            key={type}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.hairline }}
          >
            <Text style={[Typography.bodyMd, { color: Colors.textHi }]}>{SESSION_LABELS[type]}</Text>
            <Switch
              value={prefs[type]}
              onValueChange={(val) => setPrefs((p) => ({ ...p, [type]: val }))}
              trackColor={{ false: Colors.hairline, true: Colors.apexRed }}
              thumbColor={Colors.textHi}
            />
          </View>
        ))}

        <Pressable
          onPress={handleSave}
          style={{ backgroundColor: Colors.apexRed, borderRadius: 6, paddingVertical: 14, alignItems: 'center', marginTop: 32 }}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textHi} />
          ) : (
            <Text style={[Typography.labelCaps, { color: Colors.textHi }]}>ENABLE NOTIFICATIONS</Text>
          )}
        </Pressable>

        <Pressable onPress={handleSkip} style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={[Typography.labelCaps, { color: Colors.textMid }]}>SKIP FOR NOW</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
