import { View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { fetchStory } from '../../lib/api';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 280;
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function StoryDetailScreen() {
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
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
          <Image
            source={story.coverImageUrl ? { uri: story.coverImageUrl } : undefined}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
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
