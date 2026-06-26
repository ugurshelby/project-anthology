import { Tabs } from 'expo-router';
import { Svg, Path, Circle, Rect } from 'react-native-svg';
import { Colors } from '../../constants/colors';

type IconProps = { color: string };

function IconHome({ color }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IconSeason({ color }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.105 4 21 4.895 21 6V20C21 21.105 20.105 22 19 22H5C3.895 22 3 21.105 3 20V6C3 4.895 3.895 4 5 4Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function IconProfiles({ color }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <Path d="M4 20C4 17.239 7.582 15 12 15C16.418 15 20 17.239 20 20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function IconAnthology({ color }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 19.5C4 18.119 5.119 17 6.5 17H20V3H6.5C5.119 3 4 4.119 4 5.5V19.5C4 20.881 5.119 22 6.5 22H20V20" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconNews({ color }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={16} rx={2} stroke={color} strokeWidth={1.8} />
      <Path d="M7 9H17M7 13H13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.hairline,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.apexRed,
        tabBarInactiveTintColor: Colors.textLow,
        tabBarLabelStyle: {
          fontFamily: 'JetBrainsMono_700Bold',
          fontSize: 9,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <IconHome color={String(color)} /> }}
      />
      <Tabs.Screen
        name="season"
        options={{ title: 'Season', tabBarIcon: ({ color }) => <IconSeason color={String(color)} /> }}
      />
      <Tabs.Screen
        name="profiles"
        options={{ title: 'Pilots', tabBarIcon: ({ color }) => <IconProfiles color={String(color)} /> }}
      />
      <Tabs.Screen
        name="anthology"
        options={{ title: 'Stories', tabBarIcon: ({ color }) => <IconAnthology color={String(color)} /> }}
      />
      <Tabs.Screen
        name="news"
        options={{ title: 'News', tabBarIcon: ({ color }) => <IconNews color={String(color)} /> }}
      />
    </Tabs>
  );
}
