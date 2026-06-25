import { Tabs } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.hairline,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.apexRed,
        tabBarInactiveTintColor: Colors.textLow,
        tabBarLabelStyle: {
          fontFamily: 'JetBrainsMono_700Bold',
          fontSize: 10,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="season" options={{ title: 'Season' }} />
      <Tabs.Screen name="profiles" options={{ title: 'Profiles' }} />
      <Tabs.Screen name="anthology" options={{ title: 'Anthology' }} />
      <Tabs.Screen name="news" options={{ title: 'News' }} />
    </Tabs>
  );
}
