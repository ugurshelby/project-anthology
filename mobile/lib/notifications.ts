import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { registerPushToken } from './api';

const PREF_KEY = '@apex_notification_prefs';
const SHOWN_KEY = '@apex_notification_shown';

export const SESSION_TYPES = ['fp1', 'fp2', 'fp3', 'qualifying', 'sprint', 'race'] as const;
export type SessionType = typeof SESSION_TYPES[number];

export const SESSION_LABELS: Record<SessionType, string> = {
  fp1: 'Free Practice 1',
  fp2: 'Free Practice 2',
  fp3: 'Free Practice 3',
  qualifying: 'Qualifying',
  sprint: 'Sprint',
  race: 'Race',
};

export async function getDefaultPrefs(): Promise<Record<SessionType, boolean>> {
  return { fp1: false, fp2: false, fp3: false, qualifying: true, sprint: true, race: true };
}

export async function loadPrefs(): Promise<Record<SessionType, boolean>> {
  const raw = await AsyncStorage.getItem(PREF_KEY);
  return raw ? JSON.parse(raw) : getDefaultPrefs();
}

export async function savePrefs(prefs: Record<SessionType, boolean>): Promise<void> {
  await AsyncStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

export async function hasShownNotificationScreen(): Promise<boolean> {
  return (await AsyncStorage.getItem(SHOWN_KEY)) === 'true';
}

export async function markNotificationScreenShown(): Promise<void> {
  await AsyncStorage.setItem(SHOWN_KEY, 'true');
}

export async function registerForPushNotifications(prefs: Record<SessionType, boolean>): Promise<void> {
  if (Platform.OS === 'web') return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;

  const tokenData = await Notifications.getExpoPushTokenAsync();
  await savePrefs(prefs);
  await registerPushToken(tokenData.data, prefs);
}
