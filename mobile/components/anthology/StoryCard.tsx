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
          source={story.coverImageUrl ? { uri: story.coverImageUrl } : undefined}
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
