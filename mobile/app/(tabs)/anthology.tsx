import { View, Text, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { queryKeys } from '../../lib/queryKeys';
import { fetchStories } from '../../lib/api';
import { StoryCard } from '../../components/anthology/StoryCard';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Story } from '../../lib/types';

type ListItem =
  | { type: 'header'; key: string; count: number }
  | { type: 'story'; key: string; data: Story };

export default function AnthologyScreen() {
  const { data: stories, isLoading } = useQuery({
    queryKey: queryKeys.stories(),
    queryFn: fetchStories,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.apexRed} />
      </SafeAreaView>
    );
  }

  const items: ListItem[] = [
    { type: 'header', key: 'header', count: stories?.length ?? 0 },
    ...(stories ?? []).map((s) => ({ type: 'story' as const, key: s.slug, data: s })),
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <FlashList
        data={items}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <LinearGradient
                colors={['rgba(255,24,1,0.08)', 'transparent']}
                style={{ marginHorizontal: -20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, marginBottom: 4 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <View style={{ width: 16, height: 2, backgroundColor: Colors.apexRed }} />
                  <Text style={[Typography.labelCaps, { color: Colors.apexRed, fontSize: 10 }]}>
                    {item.count} STORIES
                  </Text>
                </View>
                <Text style={[Typography.hero, { fontSize: 48, lineHeight: 48 }]}>ANTHOLOGY</Text>
                <Text style={[Typography.bodyMd, { color: Colors.textMid, fontSize: 13, marginTop: 8, lineHeight: 20 }]}>
                  The moments, machines, and minds that shaped Formula 1.
                </Text>
              </LinearGradient>
            );
          }
          return (
            <StoryCard
              story={item.data}
              onPress={() => router.push(`/anthology/${item.data.slug}`)}
            />
          );
        }}
      />
    </SafeAreaView>
  );
}
