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
