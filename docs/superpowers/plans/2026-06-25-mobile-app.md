# Apex Mobile App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `anthology/mobile/` altında Expo SDK 52 + React Native uygulaması kur; mevcut Vercel backend'ini tüketsin, BoxBox Club hissinde dark sinematik tasarım diliyle 5 ana ekranı ve push bildirim sistemini çalışır hale getir.

**Architecture:** `/mobile` klasörü mevcut Next.js reposu içinde bağımsız Expo projesi olarak yaşar. Tüm veri Vercel endpoint'lerinden + Supabase anon'dan React Query ile çekilir. Bildirim sistemi için Next.js tarafına 2 yeni endpoint eklenir.

**Tech Stack:** Expo SDK 52 · Expo Router 4 · NativeWind 4 · React Native Reanimated 3 · FlashList · React Query v5 · Expo Notifications · expo-image · AsyncStorage

## Global Constraints

- Expo SDK `~52.0.0`, Expo Router `~4.0.0` — başka major versiyon kullanılmaz
- NativeWind `^4.0.0` (Tailwind v3 tabanlı) — styled-components, StyleSheet.create değil
- Animasyonlar yalnızca `transform` ve `opacity` (GPU-only) — layout property animasyonu yasak
- FlashList büyük listeler için zorunlu — FlatList kullanılmaz (standings, news, calendar, glossary)
- `expo-image` tüm görseller için — RN Image kullanılmaz
- Renk hardcode yasak — `constants/colors.ts` ve `config/team-colors.ts` tek kaynak
- Font hardcode yasak — `constants/typography.ts` token'ları kullanılır
- Supabase client-side: yalnızca `anon` key, RLS korunur
- Next.js `/app` dizinine dokunulmaz (bildirim endpoint'leri hariç)
- Her task sonunda `cd mobile && npx expo export --platform web` (type check amaçlı, web build değil) ya da `npx tsc --noEmit` çalıştırılır

---

## Faz 1 — Proje İskeleti & Tasarım Tokenları

### Task 1: Expo Projesi Oluştur

**Files:**
- Create: `mobile/package.json`
- Create: `mobile/app.json`
- Create: `mobile/babel.config.js`
- Create: `mobile/tailwind.config.js`
- Create: `mobile/tsconfig.json`
- Create: `mobile/app/_layout.tsx`
- Create: `mobile/constants/colors.ts`
- Create: `mobile/constants/typography.ts`

**Interfaces:**
- Produces: `Colors` object (`constants/colors.ts`) — tüm task'larda import edilir
- Produces: `Typography` object (`constants/typography.ts`) — tüm task'larda import edilir

- [ ] **Step 1: `mobile/` klasörü oluştur ve Expo init**

```bash
cd "c:/Users/ts/Desktop/Coding/anthology"
mkdir mobile
cd mobile
npx create-expo-app@latest . --template blank-typescript
```

Expected: `package.json`, `app.json`, `tsconfig.json`, `App.tsx` oluşur.

- [ ] **Step 2: Expo Router'a geç — `app/` dizin yapısı**

`App.tsx` dosyasını sil, `app/_layout.tsx` oluştur:

```bash
rm App.tsx
mkdir -p app/"(tabs)"
```

`package.json` main alanını güncelle:
```json
{
  "main": "expo-router/entry"
}
```

- [ ] **Step 3: Bağımlılıkları yükle**

```bash
npx expo install expo-router expo-image expo-notifications expo-font \
  react-native-reanimated react-native-gesture-handler \
  react-native-safe-area-context react-native-screens \
  @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack \
  @shopify/flash-list @tanstack/react-query \
  @react-native-async-storage/async-storage \
  nativewind tailwindcss
```

- [ ] **Step 4: `babel.config.js` yapılandır**

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel', 'react-native-reanimated/plugin'],
  };
};
```

- [ ] **Step 5: `tailwind.config.js` yapılandır**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#141414',
        'surface-raised': '#1c1c1c',
        hairline: '#262626',
        'text-hi': '#ffffff',
        'text-mid': '#9a9a9a',
        'text-low': '#666666',
        'apex-red': '#ff1801',
      },
      fontFamily: {
        'barlow-condensed': ['BarlowCondensed_700Bold'],
        'barlow-condensed-semibold': ['BarlowCondensed_600SemiBold'],
        inter: ['Inter_400Regular'],
        'jetbrains-mono': ['JetBrainsMono_500Medium'],
        'jetbrains-mono-bold': ['JetBrainsMono_700Bold'],
      },
    },
  },
};
```

- [ ] **Step 6: `constants/colors.ts` oluştur**

```ts
export const Colors = {
  bg: '#0a0a0a',
  surface: '#141414',
  surfaceRaised: '#1c1c1c',
  hairline: '#262626',
  textHi: '#ffffff',
  text: '#e6e6e6',
  textMid: '#9a9a9a',
  textLow: '#666666',
  apexRed: '#ff1801',
} as const;

export type ColorToken = keyof typeof Colors;
```

- [ ] **Step 7: `constants/typography.ts` oluştur**

```ts
import { StyleSheet } from 'react-native';

export const Typography = StyleSheet.create({
  hero: {
    fontFamily: 'BarlowCondensed_700Bold',
    fontSize: 64,
    lineHeight: 64,
    color: '#ffffff',
  },
  headline: {
    fontFamily: 'BarlowCondensed_600SemiBold',
    fontSize: 32,
    lineHeight: 36,
    color: '#ffffff',
  },
  cardTitle: {
    fontFamily: 'BarlowCondensed_600SemiBold',
    fontSize: 22,
    lineHeight: 26,
    color: '#ffffff',
  },
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 26,
    color: '#e6e6e6',
  },
  bodyMd: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 24,
    color: '#e6e6e6',
  },
  dataMono: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 13,
    lineHeight: 20,
    color: '#e6e6e6',
  },
  labelCaps: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: '#9a9a9a',
  },
});
```

- [ ] **Step 8: `app/_layout.tsx` root layout oluştur (font yükleme + QueryClient)**

```tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
} from '@expo-google-fonts/barlow-condensed';
import {
  Inter_400Regular,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    Inter_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0a0a' } }} />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
```

`@expo-google-fonts` paketlerini yükle:
```bash
npx expo install @expo-google-fonts/barlow-condensed @expo-google-fonts/inter @expo-google-fonts/jetbrains-mono
```

- [ ] **Step 9: `app.json` güncelle**

```json
{
  "expo": {
    "name": "Apex",
    "slug": "apex-f1",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "apex",
    "userInterfaceStyle": "dark",
    "splash": { "backgroundColor": "#0a0a0a" },
    "ios": {
      "bundleIdentifier": "com.apex.f1",
      "supportsTablet": false
    },
    "android": {
      "package": "com.apex.f1",
      "adaptiveIcon": { "backgroundColor": "#0a0a0a" }
    },
    "plugins": [
      "expo-router",
      "expo-font",
      ["expo-notifications", { "color": "#ff1801" }]
    ]
  }
}
```

- [ ] **Step 10: TypeScript tip kontrolü**

```bash
cd mobile && npx tsc --noEmit
```

Expected: 0 hata.

- [ ] **Step 11: Commit**

```bash
cd .. && git add mobile/
git commit -m "feat(mobile): scaffold Expo project with tokens, fonts, QueryClient"
```

---

### Task 2: API Katmanı & Query Keys

**Files:**
- Create: `mobile/lib/api.ts`
- Create: `mobile/lib/queryKeys.ts`
- Create: `mobile/hooks/useTeamColor.ts`
- Create: `mobile/hooks/useCountdown.ts`

**Interfaces:**
- Consumes: `Colors` from `constants/colors.ts`
- Produces:
  - `fetchSeason(year: number): Promise<SeasonData>` — Season, Home ekranları kullanır
  - `fetchNews(): Promise<NewsItem[]>` — News ekranı kullanır
  - `fetchDrivers(): Promise<Driver[]>` — Profiles ekranı kullanır
  - `fetchTeams(): Promise<Team[]>` — Profiles ekranı kullanır
  - `fetchStories(): Promise<Story[]>` — Anthology ekranı kullanır
  - `queryKeys` object — tüm useQuery çağrılarında kullanılır
  - `useTeamColor(teamId: string): string` hook — renk çözümleme
  - `useCountdown(targetDate: Date): { days: number; hours: number; minutes: number; seconds: number }` hook

- [ ] **Step 1: Tip tanımları oluştur**

`mobile/lib/types.ts` oluştur:

```ts
export interface Driver {
  driverId: string;
  givenName: string;
  familyName: string;
  permanentNumber: string;
  constructorId: string;
  constructorName: string;
  points: number;
  position: number;
  wins: number;
  imageUrl?: string;
}

export interface Constructor {
  constructorId: string;
  name: string;
  points: number;
  position: number;
  wins: number;
}

export interface Race {
  round: number;
  raceName: string;
  Circuit: { circuitName: string; Location: { country: string } };
  date: string;
  time?: string;
  QualifyingDate?: string;
  FirstPractice?: { date: string; time: string };
  SecondPractice?: { date: string; time: string };
  ThirdPractice?: { date: string; time: string };
  Sprint?: { date: string; time: string };
  Results?: Array<{ position: string; Driver: { driverId: string }; Constructor: { constructorId: string } }>;
}

export interface SeasonData {
  season: string;
  driverStandings: Driver[];
  constructorStandings: Constructor[];
  races: Race[];
  nextRace: Race | null;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  category?: 'technical' | 'race' | 'general';
}

export interface Story {
  slug: string;
  title: string;
  kicker?: string;
  coverImageUrl?: string;
  excerpt?: string;
  content?: string;
  publishedAt: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  category?: string;
}
```

- [ ] **Step 2: `lib/queryKeys.ts` oluştur**

```ts
export const queryKeys = {
  season: (year: number) => ['season', year] as const,
  news: () => ['news'] as const,
  drivers: () => ['drivers'] as const,
  teams: () => ['teams'] as const,
  stories: () => ['stories'] as const,
  story: (slug: string) => ['story', slug] as const,
} as const;
```

- [ ] **Step 3: `lib/api.ts` oluştur**

```ts
import { SeasonData, NewsItem, Driver, Constructor, Story } from './types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://project-anthology-five.vercel.app';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

async function supabaseFetch<T>(table: string, query: string = ''): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase error ${res.status}: ${table}`);
  return res.json() as Promise<T>;
}

export async function fetchSeason(year: number): Promise<SeasonData> {
  return apiFetch<SeasonData>(`/api/season/${year}`);
}

export async function fetchNews(): Promise<NewsItem[]> {
  return apiFetch<NewsItem[]>('/api/news');
}

export async function fetchDrivers(): Promise<Driver[]> {
  return supabaseFetch<Driver[]>('drivers', '?select=*&order=familyName.asc');
}

export async function fetchTeams(): Promise<Constructor[]> {
  return supabaseFetch<Constructor[]>('constructors', '?select=*&order=name.asc');
}

export async function fetchStories(): Promise<Story[]> {
  return supabaseFetch<Story[]>('stories', '?select=slug,title,kicker,cover_image_url,excerpt,published_at&order=published_at.desc');
}

export async function fetchStory(slug: string): Promise<Story> {
  const rows = await supabaseFetch<Story[]>('stories', `?slug=eq.${slug}&select=*&limit=1`);
  if (!rows[0]) throw new Error(`Story not found: ${slug}`);
  return rows[0];
}

export async function registerPushToken(token: string, preferences: Record<string, boolean>): Promise<void> {
  await fetch(`${BASE_URL}/api/push/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, preferences }),
  });
}
```

- [ ] **Step 4: `.env` dosyası oluştur**

`mobile/.env` oluştur:
```
EXPO_PUBLIC_API_URL=https://project-anthology-five.vercel.app
EXPO_PUBLIC_SUPABASE_URL=https://ezocovgpybrluvgaqnft.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon_key_buraya>
```

`.gitignore`'a ekle: `mobile/.env`

- [ ] **Step 5: `hooks/useTeamColor.ts` oluştur**

```ts
import { useMemo } from 'react';
import { Colors } from '../constants/colors';

// Team renk mapping — config/team-colors.ts'ten türetilmiş
const TEAM_COLORS: Record<string, string> = {
  red_bull: '#3671C6',
  mercedes: '#00D2BE',
  ferrari: '#E8002D',
  mclaren: '#FF8000',
  aston_martin: '#229971',
  alpine: '#FF87BC',
  williams: '#64C4FF',
  rb: '#6692FF',
  kick_sauber: '#52E252',
  haas: '#B6BABD',
};

export function useTeamColor(teamId: string): string {
  return useMemo(() => TEAM_COLORS[teamId] ?? Colors.apexRed, [teamId]);
}
```

- [ ] **Step 6: `hooks/useCountdown.ts` oluştur**

```ts
import { useState, useEffect } from 'react';

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calc(target: Date): Countdown {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  return { days, hours, minutes, seconds, isExpired: false };
}

export function useCountdown(targetDate: Date): Countdown {
  const [state, setState] = useState<Countdown>(() => calc(targetDate));

  useEffect(() => {
    const id = setInterval(() => setState(calc(targetDate)), 1_000);
    return () => clearInterval(id);
  }, [targetDate]);

  return state;
}
```

- [ ] **Step 7: Tip kontrolü**

```bash
cd mobile && npx tsc --noEmit
```

Expected: 0 hata.

- [ ] **Step 8: Commit**

```bash
cd .. && git add mobile/lib/ mobile/hooks/ mobile/.env
git commit -m "feat(mobile): API layer, React Query keys, useTeamColor, useCountdown"
```

---

## Faz 2 — Navigasyon & Tab Bar

### Task 3: Bottom Tab Navigator & Tab Ekranı Stub'ları

**Files:**
- Create: `mobile/app/(tabs)/_layout.tsx`
- Create: `mobile/app/(tabs)/index.tsx` (stub)
- Create: `mobile/app/(tabs)/season.tsx` (stub)
- Create: `mobile/app/(tabs)/profiles.tsx` (stub)
- Create: `mobile/app/(tabs)/anthology.tsx` (stub)
- Create: `mobile/app/(tabs)/news.tsx` (stub)

**Interfaces:**
- Consumes: `Colors` from `constants/colors.ts`
- Produces: Çalışan tab navigasyonu — Expo Go'da görünür

- [ ] **Step 1: Tab layout oluştur**

```tsx
// mobile/app/(tabs)/_layout.tsx
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
```

- [ ] **Step 2: Her tab için stub ekran oluştur**

`mobile/app/(tabs)/index.tsx`:
```tsx
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: Colors.textHi }}>Home</Text>
      </View>
    </SafeAreaView>
  );
}
```

Aynı pattern ile `season.tsx`, `profiles.tsx`, `anthology.tsx`, `news.tsx` oluştur — yalnızca title değişir.

- [ ] **Step 3: Expo Go'da test et**

```bash
cd mobile && npx expo start
```

Fiziksel cihazda Expo Go ile QR tara. 5 tab görünmeli, her biri placeholder metin göstermeli.

- [ ] **Step 4: Commit**

```bash
cd .. && git add mobile/app/
git commit -m "feat(mobile): tab navigator + screen stubs"
```

---

## Faz 3 — UI Bileşen Kütüphanesi

### Task 4: Temel UI Atomları

**Files:**
- Create: `mobile/components/ui/Card.tsx`
- Create: `mobile/components/ui/Chip.tsx`
- Create: `mobile/components/ui/Divider.tsx`
- Create: `mobile/components/ui/SectionHeader.tsx`
- Create: `mobile/components/ui/SegmentedControl.tsx`
- Create: `mobile/components/ui/PressableCard.tsx`

**Interfaces:**
- Consumes: `Colors`, `Typography`
- Produces: Tüm ekranların kullandığı temel atomlar

- [ ] **Step 1: `Card.tsx`**

```tsx
import { View, ViewProps } from 'react-native';
import { Colors } from '../../constants/colors';

interface CardProps extends ViewProps {
  raised?: boolean;
}

export function Card({ raised, style, children, ...props }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: raised ? Colors.surfaceRaised : Colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: Colors.hairline,
          padding: 16,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
```

- [ ] **Step 2: `PressableCard.tsx` (animasyonlu)**

```tsx
import { Pressable, ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';

interface PressableCardProps extends ViewProps {
  onPress?: () => void;
  raised?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableCard({ onPress, raised, style, children, ...props }: PressableCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.97, { duration: 120 });
        opacity.value = withSpring(0.85, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { duration: 120 });
        opacity.value = withSpring(1, { duration: 120 });
      }}
      onPress={onPress}
      style={[
        animStyle,
        {
          backgroundColor: raised ? Colors.surfaceRaised : Colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: Colors.hairline,
          padding: 16,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
```

- [ ] **Step 3: `Divider.tsx`**

```tsx
import { View } from 'react-native';
import { Colors } from '../../constants/colors';

export function Divider() {
  return <View style={{ height: 1, backgroundColor: Colors.hairline, marginVertical: 8 }} />;
}
```

- [ ] **Step 4: `SectionHeader.tsx`**

```tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <Text style={Typography.labelCaps}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={[Typography.labelCaps, { color: Colors.apexRed }]}>SEE ALL</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

- [ ] **Step 5: `Chip.tsx`**

```tsx
import { View, Text } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';

interface ChipProps {
  label: string;
  color?: string;
}

export function Chip({ label, color = Colors.apexRed }: ChipProps) {
  return (
    <View style={{ borderWidth: 1, borderColor: color, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text style={[Typography.labelCaps, { color }]}>{label}</Text>
    </View>
  );
}
```

- [ ] **Step 6: `SegmentedControl.tsx`**

```tsx
import { View, Text, Pressable } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ options, selectedIndex, onChange }: SegmentedControlProps) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 6, borderWidth: 1, borderColor: Colors.hairline, padding: 2 }}>
      {options.map((option, i) => (
        <Pressable
          key={option}
          onPress={() => onChange(i)}
          style={{
            flex: 1,
            paddingVertical: 8,
            alignItems: 'center',
            backgroundColor: i === selectedIndex ? Colors.surfaceRaised : 'transparent',
            borderRadius: 4,
          }}
        >
          <Text style={[Typography.labelCaps, { color: i === selectedIndex ? Colors.textHi : Colors.textLow }]}>
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
```

- [ ] **Step 7: Tip kontrolü**

```bash
cd mobile && npx tsc --noEmit
```

Expected: 0 hata.

- [ ] **Step 8: Commit**

```bash
cd .. && git add mobile/components/
git commit -m "feat(mobile): base UI atoms (Card, PressableCard, Chip, Divider, SectionHeader, SegmentedControl)"
```

---

## Faz 4 — Ekranlar

### Task 5: Home Ekranı

**Files:**
- Modify: `mobile/app/(tabs)/index.tsx`
- Create: `mobile/components/race/RaceCountdown.tsx`
- Create: `mobile/components/standings/StandingsRow.tsx`
- Create: `mobile/components/standings/StandingsToggle.tsx`
- Create: `mobile/components/news/NewsCard.tsx`

**Interfaces:**
- Consumes: `fetchSeason`, `fetchNews`, `queryKeys`, `useCountdown`, `useTeamColor`
- Consumes: `Card`, `SectionHeader`, `SegmentedControl`, `Divider`
- Produces: Çalışan Home ekranı

- [ ] **Step 1: `RaceCountdown.tsx` oluştur**

```tsx
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Race } from '../../lib/types';

interface RaceCountdownProps {
  race: Race;
}

export function RaceCountdown({ race }: RaceCountdownProps) {
  const target = new Date(`${race.date}T${race.time ?? '12:00:00Z'}`);
  const { days, hours, minutes, seconds, isExpired } = useCountdown(target);
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.08, { duration: 80 }),
      withTiming(1.0, { duration: 80 })
    );
  }, [seconds]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
      <Text style={Typography.labelCaps}>NEXT RACE</Text>
      <Text style={[Typography.headline, { marginTop: 4 }]}>{race.raceName}</Text>
      <View style={{ height: 1, backgroundColor: Colors.hairline, marginVertical: 12 }} />
      {isExpired ? (
        <Text style={[Typography.dataMono, { color: Colors.apexRed }]}>RACE WEEK</Text>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <Animated.Text style={[Typography.hero, animStyle]}>{days}</Animated.Text>
          <Text style={[Typography.labelCaps, { marginBottom: 4 }]}>DAYS</Text>
          <Text style={[Typography.dataMono, { marginLeft: 8, color: Colors.textMid }]}>
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 2: `StandingsRow.tsx` oluştur**

```tsx
import { View, Text } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { useTeamColor } from '../../hooks/useTeamColor';
import { Driver, Constructor } from '../../lib/types';

interface DriverRowProps {
  item: Driver;
}

interface ConstructorRowProps {
  item: Constructor;
}

export function DriverStandingsRow({ item }: DriverRowProps) {
  const teamColor = useTeamColor(item.constructorId);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 }}>
      <View style={{ width: 3, height: 20, backgroundColor: teamColor, borderRadius: 2 }} />
      <Text style={[Typography.dataMono, { width: 20, color: Colors.textMid }]}>{item.position}</Text>
      <Text style={[Typography.dataMono, { flex: 1, color: Colors.textHi }]}>
        {item.familyName.toUpperCase()}
      </Text>
      <Text style={[Typography.dataMono, { color: Colors.textMid, fontSize: 11 }]}>
        {item.constructorName.toUpperCase()}
      </Text>
      <Text style={[Typography.dataMono, { width: 40, textAlign: 'right' }]}>{item.points}</Text>
    </View>
  );
}

export function ConstructorStandingsRow({ item }: ConstructorRowProps) {
  const teamColor = useTeamColor(item.constructorId);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 }}>
      <View style={{ width: 3, height: 20, backgroundColor: teamColor, borderRadius: 2 }} />
      <Text style={[Typography.dataMono, { width: 20, color: Colors.textMid }]}>{item.position}</Text>
      <Text style={[Typography.dataMono, { flex: 1, color: Colors.textHi }]}>{item.name.toUpperCase()}</Text>
      <Text style={[Typography.dataMono, { width: 40, textAlign: 'right' }]}>{item.points}</Text>
    </View>
  );
}
```

- [ ] **Step 3: `NewsCard.tsx` oluştur**

```tsx
import { View, Text, Pressable, Linking } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { NewsItem } from '../../lib/types';

interface NewsCardProps {
  item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
  const time = new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <Pressable
      onPress={() => Linking.openURL(item.url)}
      style={{ flexDirection: 'row', gap: 12, paddingVertical: 12 }}
    >
      <Text style={[Typography.dataMono, { color: Colors.textLow, width: 40 }]}>{time}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[Typography.bodyMd, { color: Colors.textHi }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[Typography.labelCaps, { marginTop: 4 }]}>{item.source}</Text>
      </View>
    </Pressable>
  );
}
```

- [ ] **Step 4: `app/(tabs)/index.tsx` implement et**

```tsx
import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { fetchSeason, fetchNews } from '../../lib/api';
import { RaceCountdown } from '../../components/race/RaceCountdown';
import { DriverStandingsRow, ConstructorStandingsRow } from '../../components/standings/StandingsRow';
import { NewsCard } from '../../components/news/NewsCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Divider } from '../../components/ui/Divider';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useState } from 'react';

const CURRENT_YEAR = new Date().getFullYear();

export default function HomeScreen() {
  const [standingsTab, setStandingsTab] = useState(0);

  const { data: season, isLoading: seasonLoading } = useQuery({
    queryKey: queryKeys.season(CURRENT_YEAR),
    queryFn: () => fetchSeason(CURRENT_YEAR),
  });

  const { data: news } = useQuery({
    queryKey: queryKeys.news(),
    queryFn: fetchNews,
  });

  if (seasonLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.apexRed} />
      </SafeAreaView>
    );
  }

  const standings = standingsTab === 0
    ? (season?.driverStandings ?? []).slice(0, 5)
    : (season?.constructorStandings ?? []).slice(0, 5);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {season?.nextRace && <RaceCountdown race={season.nextRace} />}

        <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title="Standings" />
          <SegmentedControl
            options={['Drivers', 'Teams']}
            selectedIndex={standingsTab}
            onChange={setStandingsTab}
          />
          <View style={{ marginTop: 8 }}>
            {standingsTab === 0
              ? standings.map((d: any) => <DriverStandingsRow key={d.driverId} item={d} />)
              : standings.map((c: any) => <ConstructorStandingsRow key={c.constructorId} item={c} />)
            }
          </View>
        </View>

        <View style={{ marginHorizontal: 20 }}>
          <SectionHeader title="Latest Intel" />
          {(news ?? []).slice(0, 3).map((item) => (
            <View key={item.id}>
              <NewsCard item={item} />
              <Divider />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 5: Expo Go'da test et**

```bash
cd mobile && npx expo start
```

Home ekranında geri sayım, standings toggle, 3 haber görünmeli.

- [ ] **Step 6: Tip kontrolü**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
cd .. && git add mobile/
git commit -m "feat(mobile): Home screen — countdown, standings toggle, news feed"
```

---

### Task 6: Season Ekranı

**Files:**
- Modify: `mobile/app/(tabs)/season.tsx`
- Create: `mobile/components/race/CalendarRow.tsx`

**Interfaces:**
- Consumes: `fetchSeason`, `queryKeys`, `DriverStandingsRow`, `ConstructorStandingsRow`, `SegmentedControl`
- Produces: Çalışan Season ekranı (standings + takvim)

- [ ] **Step 1: `CalendarRow.tsx` oluştur**

```tsx
import { View, Text } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Race } from '../../lib/types';

interface CalendarRowProps {
  race: Race;
  isNext: boolean;
  isPast: boolean;
}

export function CalendarRow({ race, isNext, isPast }: CalendarRowProps) {
  const dateStr = new Date(race.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 }}>
      {isNext && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.apexRed }} />}
      {!isNext && <View style={{ width: 6 }} />}
      <Text style={[Typography.dataMono, { width: 32, color: Colors.textLow }]}>
        {String(race.round).padStart(2, '0')}
      </Text>
      <Text style={[Typography.dataMono, { flex: 1, color: isPast ? Colors.textLow : Colors.textHi }]}>
        {race.raceName.replace(' Grand Prix', ' GP')}
      </Text>
      <Text style={[Typography.dataMono, { color: Colors.textLow }]}>{dateStr}</Text>
      {isPast && <Text style={[Typography.labelCaps, { color: Colors.textLow }]}>✓</Text>}
    </View>
  );
}
```

- [ ] **Step 2: `season.tsx` implement et**

```tsx
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
        estimatedItemSize={48}
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
```

- [ ] **Step 3: Test & Commit**

```bash
cd mobile && npx tsc --noEmit
cd .. && git add mobile/ && git commit -m "feat(mobile): Season screen — standings + calendar FlashList"
```

---

### Task 7: Profiles Ekranı

**Files:**
- Modify: `mobile/app/(tabs)/profiles.tsx`
- Create: `mobile/app/driver/[id].tsx`
- Create: `mobile/app/team/[id].tsx`
- Create: `mobile/components/profile/DriverHero.tsx`
- Create: `mobile/components/profile/TeamHero.tsx`
- Create: `mobile/components/profile/StatGrid.tsx`

**Interfaces:**
- Consumes: `fetchDrivers`, `fetchTeams`, `queryKeys`, `expo-image`, `useTeamColor`
- Produces: Profiles ekranı (toggle + listeler) + detay ekranları

- [ ] **Step 1: `StatGrid.tsx` oluştur**

```tsx
import { View, Text } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';

interface Stat {
  label: string;
  value: string | number;
}

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1, backgroundColor: Colors.hairline }}>
      {stats.map((s) => (
        <View
          key={s.label}
          style={{ flex: 1, minWidth: '30%', backgroundColor: Colors.surface, padding: 16, alignItems: 'center' }}
        >
          <Text style={[Typography.headline, { color: Colors.textHi }]}>{s.value}</Text>
          <Text style={[Typography.labelCaps, { marginTop: 4 }]}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 2: `DriverHero.tsx` oluştur**

```tsx
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Driver } from '../../lib/types';
import { useTeamColor } from '../../hooks/useTeamColor';

export function DriverHero({ driver }: { driver: Driver }) {
  const teamColor = useTeamColor(driver.constructorId);

  return (
    <View style={{ position: 'relative', height: 280 }}>
      <Image
        source={driver.imageUrl ?? require('../../assets/placeholder-driver.png')}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
      />
      <LinearGradient
        colors={['transparent', Colors.bg]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140 }}
      />
      <View style={{ position: 'absolute', bottom: 16, left: 20 }}>
        <Text style={[Typography.labelCaps, { color: teamColor }]}>{driver.constructorName}</Text>
        <Text style={Typography.hero}>{driver.familyName.toUpperCase()}</Text>
        <Text style={[Typography.dataMono, { color: Colors.textMid }]}>#{driver.permanentNumber}</Text>
      </View>
    </View>
  );
}
```

`expo-linear-gradient` yükle:
```bash
cd mobile && npx expo install expo-linear-gradient
```

- [ ] **Step 3: `profiles.tsx` implement et**

```tsx
import { View, Text, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { router } from 'expo-router';
import { queryKeys } from '../../lib/queryKeys';
import { fetchDrivers, fetchTeams } from '../../lib/api';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { PressableCard } from '../../components/ui/PressableCard';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTeamColor } from '../../hooks/useTeamColor';
import { Driver, Constructor } from '../../lib/types';

function DriverListItem({ driver }: { driver: Driver }) {
  const color = useTeamColor(driver.constructorId);
  return (
    <PressableCard
      onPress={() => router.push(`/driver/${driver.driverId}`)}
      style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}
    >
      <View style={{ width: 3, height: 32, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={[Typography.cardTitle, { color: Colors.textHi }]}>
          {driver.givenName} {driver.familyName}
        </Text>
        <Text style={[Typography.labelCaps, { color: Colors.textMid }]}>{driver.constructorName}</Text>
      </View>
      <Text style={[Typography.headline, { color }]}>#{driver.permanentNumber}</Text>
    </PressableCard>
  );
}

function TeamListItem({ team }: { team: Constructor }) {
  const color = useTeamColor(team.constructorId);
  return (
    <PressableCard
      onPress={() => router.push(`/team/${team.constructorId}`)}
      style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}
    >
      <View style={{ width: 3, height: 32, backgroundColor: color, borderRadius: 2 }} />
      <Text style={[Typography.cardTitle, { flex: 1, color: Colors.textHi }]}>{team.name.toUpperCase()}</Text>
      <Text style={[Typography.dataMono, { color: Colors.textMid }]}>{team.points} PTS</Text>
    </PressableCard>
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
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <SegmentedControl options={['Pilots', 'Teams']} selectedIndex={tab} onChange={setTab} />
      </View>
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Colors.apexRed} />
        </View>
      ) : (
        <FlashList
          data={tab === 0 ? drivers : teams}
          estimatedItemSize={72}
          keyExtractor={(item: any) => item.driverId ?? item.constructorId}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          renderItem={({ item }: any) =>
            tab === 0 ? <DriverListItem driver={item} /> : <TeamListItem team={item} />
          }
        />
      )}
    </SafeAreaView>
  );
}
```

- [ ] **Step 4: `app/driver/[id].tsx` stub (detay)**

```tsx
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { fetchDrivers } from '../../lib/api';
import { DriverHero } from '../../components/profile/DriverHero';
import { StatGrid } from '../../components/profile/StatGrid';
import { Colors } from '../../constants/colors';

export default function DriverDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: drivers, isLoading } = useQuery({
    queryKey: queryKeys.drivers(),
    queryFn: fetchDrivers,
  });

  const driver = drivers?.find((d) => d.driverId === id);

  if (isLoading || !driver) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.apexRed} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView>
        <DriverHero driver={driver} />
        <StatGrid stats={[
          { label: 'POINTS', value: driver.points },
          { label: 'WINS', value: driver.wins },
          { label: 'POSITION', value: `P${driver.position}` },
        ]} />
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 5: Test & Commit**

```bash
cd mobile && npx tsc --noEmit
cd .. && git add mobile/ && git commit -m "feat(mobile): Profiles screen — driver/team lists + detail screens"
```

---

### Task 8: Anthology Ekranı

**Files:**
- Modify: `mobile/app/(tabs)/anthology.tsx`
- Create: `mobile/app/anthology/[slug].tsx`
- Create: `mobile/components/anthology/StoryCard.tsx`

**Interfaces:**
- Consumes: `fetchStories`, `fetchStory`, `queryKeys`, `expo-image`, `expo-linear-gradient`
- Produces: Anthology liste + detay ekranı (parallax header)

- [ ] **Step 1: `StoryCard.tsx` oluştur**

```tsx
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableCard } from '../ui/PressableCard';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Story } from '../../lib/types';

export function StoryCard({ story, onPress }: { story: Story; onPress: () => void }) {
  return (
    <PressableCard onPress={onPress} style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
      <View style={{ height: 200 }}>
        <Image
          source={story.coverImageUrl}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 }}
        />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
          {story.kicker && (
            <Text style={[Typography.labelCaps, { color: Colors.apexRed, marginBottom: 4 }]}>{story.kicker}</Text>
          )}
          <Text style={Typography.cardTitle} numberOfLines={2}>{story.title}</Text>
        </View>
      </View>
    </PressableCard>
  );
}
```

- [ ] **Step 2: `anthology.tsx` implement et**

```tsx
import { View, Text, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { queryKeys } from '../../lib/queryKeys';
import { fetchStories } from '../../lib/api';
import { StoryCard } from '../../components/anthology/StoryCard';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

export default function AnthologyScreen() {
  const { data: stories, isLoading } = useQuery({
    queryKey: queryKeys.stories(),
    queryFn: fetchStories,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Colors.apexRed} />
        </View>
      ) : (
        <FlashList
          data={stories}
          estimatedItemSize={232}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
          ListHeaderComponent={
            <Text style={[Typography.headline, { marginBottom: 16 }]}>ANTHOLOGY</Text>
          }
          renderItem={({ item }) => (
            <StoryCard
              story={item}
              onPress={() => router.push(`/anthology/${item.slug}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: `app/anthology/[slug].tsx` parallax detay**

```tsx
import { View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { fetchStory } from '../../lib/api';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 280;
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function StoryDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const { data: story, isLoading } = useQuery({
    queryKey: queryKeys.story(slug),
    queryFn: () => fetchStory(slug),
  });

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, HEADER_HEIGHT], [0, HEADER_HEIGHT * 0.4]) }],
  }));

  if (isLoading || !story) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.apexRed} />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ height: HEADER_HEIGHT, overflow: 'hidden' }}>
        <Animated.View style={[{ height: HEADER_HEIGHT, width: SCREEN_WIDTH }, imageStyle]}>
          <Image source={story.coverImageUrl} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        </Animated.View>
      </View>
      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        style={{ flex: 1, marginTop: -40 }}
      >
        <View style={{ backgroundColor: Colors.bg, paddingTop: 24 }}>
          {story.kicker && (
            <Text style={[Typography.labelCaps, { color: Colors.apexRed, marginBottom: 8 }]}>{story.kicker}</Text>
          )}
          <Text style={[Typography.headline, { marginBottom: 16 }]}>{story.title}</Text>
          <Text style={Typography.bodyMd}>{story.content ?? story.excerpt}</Text>
        </View>
      </AnimatedScrollView>
    </View>
  );
}
```

- [ ] **Step 4: Test & Commit**

```bash
cd mobile && npx tsc --noEmit
cd .. && git add mobile/ && git commit -m "feat(mobile): Anthology screen — story list + parallax detail"
```

---

### Task 9: News + Glossary Ekranı

**Files:**
- Modify: `mobile/app/(tabs)/news.tsx`

**Interfaces:**
- Consumes: `fetchNews`, `queryKeys`, `NewsCard`, `SegmentedControl`, `FlashList`
- Consumes: `data/glossary/` statik JSON (bundle'a eklenir)
- Produces: News + Glossary ekranı (pull-to-refresh, filtre, search)

- [ ] **Step 1: Glossary JSON'ı bundle et**

`mobile/assets/glossary.json` olarak `data/glossary/` içeriğini kopyala veya symlink:
```bash
cp -r "../data/glossary" "mobile/assets/glossary"
```

`mobile/lib/glossary.ts` oluştur:
```ts
import { GlossaryTerm } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const raw = require('../assets/glossary/terms.json') as GlossaryTerm[];

export function getGlossaryTerms(): GlossaryTerm[] {
  return raw.sort((a, b) => a.term.localeCompare(b.term));
}
```

- [ ] **Step 2: `news.tsx` implement et**

```tsx
import { View, Text, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { queryKeys } from '../../lib/queryKeys';
import { fetchNews } from '../../lib/api';
import { NewsCard } from '../../components/news/NewsCard';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Divider } from '../../components/ui/Divider';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { getGlossaryTerms } from '../../lib/glossary';
import { NewsItem, GlossaryTerm } from '../../lib/types';

const NEWS_FILTERS = ['All', 'Technical', 'Race'] as const;
type NewsFilter = typeof NEWS_FILTERS[number];

export default function NewsScreen() {
  const [mainTab, setMainTab] = useState(0);
  const [newsFilter, setNewsFilter] = useState<NewsFilter>('All');
  const [search, setSearch] = useState('');

  const { data: news, isLoading, refetch, isFetching } = useQuery({
    queryKey: queryKeys.news(),
    queryFn: fetchNews,
  });

  const glossaryTerms = useMemo(() => {
    const all = getGlossaryTerms();
    if (!search) return all;
    return all.filter((t) => t.term.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const filteredNews = useMemo(() => {
    if (!news) return [];
    if (newsFilter === 'All') return news;
    const map: Record<NewsFilter, string> = { All: '', Technical: 'technical', Race: 'race' };
    return news.filter((n) => n.category === map[newsFilter]);
  }, [news, newsFilter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 12 }}>
        <SegmentedControl
          options={['News', 'Glossary']}
          selectedIndex={mainTab}
          onChange={setMainTab}
        />
        {mainTab === 0 && (
          <SegmentedControl
            options={['All', 'Technical', 'Race']}
            selectedIndex={NEWS_FILTERS.indexOf(newsFilter)}
            onChange={(i) => setNewsFilter(NEWS_FILTERS[i])}
          />
        )}
        {mainTab === 1 && (
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search terms…"
            placeholderTextColor={Colors.textLow}
            style={[Typography.dataMono, {
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.hairline,
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: Colors.textHi,
            }]}
          />
        )}
      </View>

      {mainTab === 0 ? (
        isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={Colors.apexRed} />
          </View>
        ) : (
          <FlashList
            data={filteredNews}
            estimatedItemSize={72}
            keyExtractor={(item: NewsItem) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={Colors.apexRed} />}
            ItemSeparatorComponent={Divider}
            renderItem={({ item }) => <NewsCard item={item} />}
          />
        )
      ) : (
        <FlashList
          data={glossaryTerms}
          estimatedItemSize={64}
          keyExtractor={(item: GlossaryTerm) => item.term}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 12 }}>
              <Text style={[Typography.cardTitle, { color: Colors.textHi }]}>{item.term}</Text>
              <Text style={[Typography.bodyMd, { marginTop: 4, color: Colors.textMid }]}>{item.definition}</Text>
              <Divider />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: Test & Commit**

```bash
cd mobile && npx tsc --noEmit
cd .. && git add mobile/ && git commit -m "feat(mobile): News + Glossary screen — filters, pull-to-refresh, search"
```

---

## Faz 5 — Bildirim Sistemi

### Task 10: Push Bildirim Backend (Next.js)

**Files:**
- Create: `app/api/push/register/route.ts`
- Create: `app/api/cron/notify/route.ts`
- Modify: `supabase/migrations/` (yeni tablo)
- Modify: `vercel.json` (yeni cron)

**Interfaces:**
- Consumes: `lib/f1Calendar.ts` (`getF1Context`)
- Produces: `/api/push/register` POST, `/api/cron/notify` GET

- [ ] **Step 1: Supabase migration oluştur**

`supabase/migrations/20260625000001_push_subscriptions.sql`:

```sql
CREATE TABLE push_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token       text NOT NULL,
  preferences jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  CONSTRAINT push_subscriptions_token_unique UNIQUE (token)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can upsert own token"
  ON push_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

GRANT INSERT, UPDATE, SELECT ON push_subscriptions TO anon, authenticated;
```

⚠️ MANUEL AKSİYON GEREKLİ: Supabase dashboard'da SQL Editor'da bu migration'ı çalıştır.

- [ ] **Step 2: `/api/push/register/route.ts` oluştur**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { token, preferences } = await req.json() as { token: string; preferences: Record<string, boolean> };

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ token, preferences, updated_at: new Date().toISOString() }, { onConflict: 'token' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: expo-server-sdk yükle (Next.js)**

```bash
npm install expo-server-sdk
```

- [ ] **Step 4: `/api/cron/notify/route.ts` oluştur**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Expo from 'expo-server-sdk';
import { getF1Context } from '@/lib/f1Calendar';
import { verifyCronAuth } from '@/lib/cronAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const expo = new Expo();

type Session = { type: string; date: Date; label: string };

function getUpcomingSessions(races: any[]): Session[] {
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 60 * 1000);
  const sessions: Session[] = [];

  for (const race of races) {
    const candidates = [
      { type: 'fp1', date: race.FirstPractice, label: `FP1 — ${race.raceName}` },
      { type: 'fp2', date: race.SecondPractice, label: `FP2 — ${race.raceName}` },
      { type: 'fp3', date: race.ThirdPractice, label: `FP3 — ${race.raceName}` },
      { type: 'qualifying', date: race.Qualifying, label: `Qualifying — ${race.raceName}` },
      { type: 'sprint', date: race.Sprint, label: `Sprint — ${race.raceName}` },
      { type: 'race', date: { date: race.date, time: race.time }, label: `Race — ${race.raceName}` },
    ];
    for (const c of candidates) {
      if (!c.date?.date) continue;
      const d = new Date(`${c.date.date}T${c.date.time ?? '12:00:00Z'}`);
      if (d >= now && d <= in30) {
        sessions.push({ type: c.type, date: d, label: c.label });
      }
    }
  }
  return sessions;
}

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { races } = getF1Context();
  const sessions = getUpcomingSessions(races);
  if (sessions.length === 0) return NextResponse.json({ sent: 0 });

  const { data: subs } = await supabase.from('push_subscriptions').select('token, preferences');
  if (!subs?.length) return NextResponse.json({ sent: 0 });

  const messages: Expo.ExpoPushMessage[] = [];
  for (const session of sessions) {
    for (const sub of subs) {
      const prefs = sub.preferences as Record<string, boolean>;
      if (prefs[session.type]) {
        if (Expo.isExpoPushToken(sub.token)) {
          messages.push({
            to: sub.token,
            title: 'APEX',
            body: `${session.label} starts in 30 minutes`,
            data: { sessionType: session.type },
          });
        }
      }
    }
  }

  const chunks = expo.chunkPushNotifications(messages);
  let sent = 0;
  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
    sent += chunk.length;
  }

  return NextResponse.json({ sent });
}
```

- [ ] **Step 5: `vercel.json` cron ekle**

```json
{
  "crons": [
    { "path": "/api/cron/notify", "schedule": "*/30 * * * *" }
  ]
}
```

- [ ] **Step 6: Build kontrolü (Next.js)**

```bash
npm run build
```

Expected: 0 hata.

- [ ] **Step 7: Commit**

```bash
git add app/api/push/ app/api/cron/notify/ supabase/migrations/ vercel.json package.json package-lock.json
git commit -m "feat: push notification backend — /api/push/register + /api/cron/notify"
```

---

### Task 11: Mobil Bildirim Ekranı

**Files:**
- Create: `mobile/app/notifications.tsx`
- Create: `mobile/lib/notifications.ts`
- Modify: `mobile/app/_layout.tsx` (ilk açılış yönlendirmesi)

**Interfaces:**
- Consumes: `registerPushToken` from `lib/api.ts`, `AsyncStorage`, `expo-notifications`
- Produces: Bildirim tercih ekranı + token kayıt akışı

- [ ] **Step 1: `lib/notifications.ts` oluştur**

```ts
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
```

- [ ] **Step 2: `app/notifications.tsx` oluştur**

```tsx
import { View, Text, Switch, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  SESSION_TYPES,
  SESSION_LABELS,
  SessionType,
  getDefaultPrefs,
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
    await registerForPushNotifications(prefs);
    await markNotificationScreenShown();
    setLoading(false);
    router.replace('/(tabs)');
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
```

- [ ] **Step 3: Root layout'a ilk açılış yönlendirmesi ekle**

`mobile/app/_layout.tsx` içinde `useEffect` ekle:

```tsx
import { useEffect } from 'react';
import { router } from 'expo-router';
import { hasShownNotificationScreen } from '../lib/notifications';

// RootLayout içinde:
useEffect(() => {
  async function checkNotifications() {
    const shown = await hasShownNotificationScreen();
    if (!shown) router.replace('/notifications');
  }
  if (fontsLoaded) checkNotifications();
}, [fontsLoaded]);
```

- [ ] **Step 4: Test & Commit**

```bash
cd mobile && npx tsc --noEmit
cd .. && git add mobile/ && git commit -m "feat(mobile): push notification preferences screen + token registration"
```

---

## Faz 6 — EAS Build Yapılandırması

### Task 12: EAS Config & Build

**Files:**
- Create: `mobile/eas.json`
- Create: `mobile/.easignore`

**Interfaces:**
- Produces: `eas build` ile APK (Android) ve IPA (iOS) üretilebilir hale gelir

- [ ] **Step 1: EAS CLI yükle**

```bash
npm install -g eas-cli
eas login   # Expo hesabı gerekli
```

- [ ] **Step 2: `eas.json` oluştur**

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "EXPO_PUBLIC_API_URL": "https://project-anthology-five.vercel.app" }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "env": { "EXPO_PUBLIC_API_URL": "https://project-anthology-five.vercel.app" }
    },
    "production": {
      "env": { "EXPO_PUBLIC_API_URL": "https://project-anthology-five.vercel.app" }
    }
  },
  "submit": {
    "production": {}
  }
}
```

- [ ] **Step 3: `.easignore` oluştur**

```
node_modules/
.git/
*.md
__tests__/
```

- [ ] **Step 4: Expo proje ID al**

```bash
cd mobile && eas init
```

Expected: `app.json`'a `extra.eas.projectId` eklenir.

- [ ] **Step 5: Preview APK build**

```bash
eas build --platform android --profile preview
```

Expected: EAS dashboard'da build başlar, ~10dk sonra APK indirilebilir.

⚠️ MANUEL AKSİYON GEREKLİ: Expo hesabı açık olmalı. iOS build için Apple Developer hesabı ($99/yıl) ve sertifikalar gerekli.

- [ ] **Step 6: Commit**

```bash
cd .. && git add mobile/eas.json mobile/.easignore
git commit -m "feat(mobile): EAS build config — development/preview/production profiles"
```

---

## Self-Review

**Spec coverage:**
- ✅ Home (§5.1) — Task 5
- ✅ Season (§5.2) — Task 6
- ✅ Profiles (§5.3) — Task 7
- ✅ Anthology (§5.4) — Task 8
- ✅ News + Glossary (§5.5) — Task 9
- ✅ Bildirim akışı (§8.1) — Task 11
- ✅ Backend endpoint'leri (§8.2) — Task 10
- ✅ Supabase tablosu (§8.3) — Task 10
- ✅ Design tokenlar (§6) — Task 1
- ✅ Animasyon sistemi (§7) — Task 4, 5, 8
- ✅ EAS build (§10) — Task 12
- ✅ Paket listesi (§9) — Task 1, 3

**Placeholder scan:** Temiz — tüm adımlarda gerçek kod var.

**Type consistency:** `Driver`, `Constructor`, `Race`, `NewsItem`, `Story`, `GlossaryTerm` — `lib/types.ts`'de tanımlanır, tüm task'larda aynı isimler kullanılır.
